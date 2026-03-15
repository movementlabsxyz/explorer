import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import {nodePolyfills} from "vite-plugin-node-polyfills";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(() => {
  return {
    build: {
      outDir: "build",
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            mui: ['@mui/material', '@mui/icons-material'],
            aptos: ['@aptos-labs/ts-sdk', '@aptos-labs/wallet-adapter-react'],
          },
        },
      },
    },
    // in addition to the default VITE_ prefix, also support REACT_APP_ prefixed environment variables for compatibility reasons with legacy create-react-app.
    envPrefix: ["VITE_", "REACT_APP_"],
    plugins: [react(), svgr(), nodePolyfills(), tailwindcss()],
  };
});
