import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [tailwindcss(), sveltekit(), viteStaticCopy({
    targets: [
      {
        src: "node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js",
        dest: ".",
      },
      {
        src: "node_modules/@ricky0123/vad-web/dist/*.onnx",
        dest: ".",
      },
      {
        src: "node_modules/onnxruntime-web/dist/*.wasm",
        dest: ".",
      },
      {
        src: "node_modules/.pnpm/onnxruntime-web@1.14.0/node_modules/onnxruntime-web/dist/ort-wasm-simd.wasm",
        dest: ".",
      },
    ],
  }),],
  server: {
    // Add this section
    host: true, // This allows Vite to listen on all public IPs
    hmr: {
      // If you're using a custom ngrok domain or a different port,
      // you might need to configure hmr client port as well.
      // clientPort: 443, // for ngrok https
    },
    // And specifically allow your ngrok host
    allowedHosts: ["5878-74-193-213-147.ngrok-free.app"],
  },

});
