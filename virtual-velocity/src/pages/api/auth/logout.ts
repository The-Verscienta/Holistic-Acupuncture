import type { APIRoute } from 'astro';
import {
  getSessionFromRequest,
  destroySession,
  clearSessionCookie
} from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Get and destroy session
    const token = getSessionFromRequest(request);
    if (token) {
      destroySession(token);
    }

    // Return success with cleared cookie
    return new Response(
      JSON.stringify({ success: true, message: 'Logged out successfully' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': clearSessionCookie()
        }
      }
    );

  } catch (error) {
    console.error('Logout error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'An error occurred' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
