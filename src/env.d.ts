declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_API_URL: string;
      EXPO_PUBLIC_API_KEY: string;
      EXPO_PUBLIC_STORE_HASH: string;
      EXPO_PUBLIC_DOMAIN: string;
      EXPO_PUBLIC_LOCALE: string;
    }
  }
}

// Ensure process is available globally for TypeScript in case @types/node is missing
declare var process: {
  env: NodeJS.ProcessEnv;
};

export {};
