// Runtime environment config interface
interface RuntimeEnv {
  VITE_API_BASE_URL?: string;
}

// Extend Window interface
declare global {
  interface Window {
    _env_?: RuntimeEnv;
  }
}

/**
 * Get API base URL from runtime config or fallback to build-time env var
 * Priority: Runtime env (Docker/Railway) > Build-time env > Default
 */
export const getApiBaseUrl = (): string => {
  // Check if runtime config is available (injected by Docker)
  if (typeof window !== 'undefined' && window._env_?.VITE_API_BASE_URL) {
    if (import.meta.env.DEV) {
      console.log('✅ Using runtime API URL:', window._env_.VITE_API_BASE_URL);
    }
    return window._env_.VITE_API_BASE_URL;
  }
  
  // Fallback to build-time environment variable
  const fallbackUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
  if (import.meta.env.DEV) {
    console.log('⚠️ Using build-time API URL:', fallbackUrl);
  }
  return fallbackUrl;
};

/**
 * Debug function to check current configuration
 */
export const debugConfig = () => {
  if (!import.meta.env.DEV) return;
  
  console.group('🔧 Configuration Debug');
  console.log('window._env_:', window._env_);
  console.log('import.meta.env.VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  console.log('Final API Base URL:', getApiBaseUrl());
  console.groupEnd();
};
