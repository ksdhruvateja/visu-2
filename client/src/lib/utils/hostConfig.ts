// This utility helps with handling host configurations dynamically 
// without modifying the vite.config.ts file directly

// Get the base URL dynamically based on the environment
export const getBaseUrl = (): string => {
  // In a Replit environment, we need to use 0.0.0.0 instead of localhost
  // to properly handle cross-origin requests
  return window.location.hostname === 'localhost' 
    ? 'http://localhost:5000'
    : 'https://' + window.location.hostname;
};

// Use this URL for all API requests to ensure proper handling
// regardless of the environment
export const apiBaseUrl = getBaseUrl();