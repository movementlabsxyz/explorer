interface ImportMetaEnv {
  readonly VITE_APTOS_DEVNET_URL: string;
  // add other environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// vite-env.d.ts
// ...
/// <reference types="vite-plugin-svgr/client" />
