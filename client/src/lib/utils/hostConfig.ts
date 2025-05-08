// This utility helps with handling host configurations dynamically 
// without modifying the vite.config.ts file directly

// Get the base URL dynamically based on the environment
export const getBaseUrl = (): string => {
  // In a Replit environment, we want to use the hostname directly
  // This ensures the request goes to the correct server regardless of environment
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  
  // For local development, hardcode to port 5000
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  
  // For Replit or production, use the current origin
  return `${protocol}//${hostname}`;
};

// Use this URL for all API requests to ensure proper handling
// regardless of the environment
export const apiBaseUrl = getBaseUrl();

// Log the API base URL for debugging
console.log(`API Base URL configured as: ${apiBaseUrl}`);