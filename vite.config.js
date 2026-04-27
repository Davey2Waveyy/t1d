import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: [
      'src/test/**/*.test.js',
      'src/hooks/**/*.test.js',
      'src/components/**/*.test.jsx',
    ],
    passWithNoTests: true,
    setupFiles: ['./src/test/setup.js'],
  },
});
