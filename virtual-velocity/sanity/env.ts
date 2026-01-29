// Environment configuration for Sanity
// These values should be stored in .env file in production

export const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'your-project-id';
export const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production';
export const apiVersion = '2024-01-01';

// Set to true to enable real-time updates
export const useCdn = false;
