import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** GitHub Pages serves this repository below /word-memory-app/. */
export default defineConfig({
  base: '/word-memory-app/',
  plugins: [react()],
  test: { environment: 'node' },
});
