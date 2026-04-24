/**
 * Simple UUID v4 generator (works in browsers and Cloudflare Workers)
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * SHA-256 hash a string using Web Crypto API (works in Cloudflare Workers)
 */
async function hashSHA256(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Normalize and hash email (lowercase, trim, hash)
 */
async function normalizeAndHashEmail(email: string): Promise<string> {
  const normalized = email.toLowerCase().trim();
  return hashSHA256(normalized);
}

/**
 * Normalize and hash phone number (remove non-digits, hash)
 */
async function normalizeAndHashPhone(phone: string): Promise<string> {
  const normalized = phone.replace(/\D/g, '');
  if (normalized.length < 10) {
    throw new Error('Invalid phone number');
  }
  return hashSHA256(normalized);
}

export { hashSHA256, normalizeAndHashEmail, normalizeAndHashPhone };

/**
 * Customer data for a conversion event (hashed PII)
 */
export interface CustomerData {
  email?: string; // SHA-256 hashed
  phone_number?: string; // SHA-256 hashed
  client_ip_address?: string; // Not hashed
  client_user_agent?: string; // Not hashed
}

/**
 * Conversion event sent to Meta
 */
export interface ConversionEvent {
  event_name: 'Contact';
  event_time: number; // Unix timestamp in seconds
  action_source: 'website';
  event_id: string; // UUID
  event_source_url: string;
  custom_data?: {
    contact_reason?: string;
    contact_type?: string;
    contact_location?: string;
  };
  user_data: CustomerData;
}

/**
 * Send a conversion event to Meta's Conversions API
 */
export async function sendConversionEvent(
  event: ConversionEvent,
  accessToken: string,
  datasetId: string
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  const apiUrl = `https://graph.facebook.com/v18.0/${datasetId}/events`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [event],
        access_token: accessToken,
      }),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        return {
          success: false,
          error: `HTTP ${response.status}`,
        };
      }
      console.error('Meta API error:', errorData);
      return {
        success: false,
        error: errorData.error?.message || 'Unknown error',
      };
    }

    const result = await response.json();
    console.log('Conversion event sent to Meta:', event.event_id);
    return {
      success: true,
      eventId: event.event_id,
    };
  } catch (error) {
    console.error('Failed to send conversion event to Meta:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create and send a contact form conversion event
 */
export async function sendContactFormConversion(
  data: {
    email?: string;
    phone?: string;
    clientIp?: string;
    clientUserAgent?: string;
    sourceUrl: string;
    contactReason?: string;
  },
  accessToken: string,
  datasetId: string
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  // Validate sourceUrl
  try {
    new URL(data.sourceUrl);
  } catch {
    throw new Error('Invalid sourceUrl');
  }

  const eventId = generateUUID();
  const customer_data: CustomerData = {
    client_ip_address: data.clientIp,
    client_user_agent: data.clientUserAgent,
  };

  // Hash PII if provided
  if (data.email) {
    try {
      customer_data.email = await normalizeAndHashEmail(data.email);
    } catch (e) {
      console.warn('Failed to hash email:', e);
    }
  }

  if (data.phone) {
    try {
      customer_data.phone_number = await normalizeAndHashPhone(data.phone);
    } catch (e) {
      console.warn('Failed to hash phone:', e);
    }
  }

  const event: ConversionEvent = {
    event_name: 'Contact',
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    event_id: eventId,
    event_source_url: data.sourceUrl,
    user_data: customer_data,
    custom_data: data.contactReason
      ? { contact_reason: data.contactReason }
      : undefined,
  };

  return sendConversionEvent(event, accessToken, datasetId);
}

/**
 * Create and send a phone call conversion event
 */
export async function sendPhoneCallConversion(
  data: {
    clientIp?: string;
    clientUserAgent?: string;
    sourceUrl: string;
    location: string;
  },
  accessToken: string,
  datasetId: string
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  // Validate sourceUrl
  try {
    new URL(data.sourceUrl);
  } catch {
    throw new Error('Invalid sourceUrl');
  }

  const eventId = generateUUID();

  const event: ConversionEvent = {
    event_name: 'Contact',
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    event_id: eventId,
    event_source_url: data.sourceUrl,
    user_data: {
      client_ip_address: data.clientIp,
      client_user_agent: data.clientUserAgent,
    },
    custom_data: {
      contact_type: 'phone_click',
      contact_location: data.location,
    },
  };

  return sendConversionEvent(event, accessToken, datasetId);
}
