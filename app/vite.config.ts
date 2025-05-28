import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
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
