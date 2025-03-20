import { defineConfig } from 'vite';

export default defineConfig({
  // Base public path for assets - use /spelling-quiz-game/ for production
  base: process.env.NODE_ENV === 'production' ? '/spelling-quiz-game/' : '/',
  
  // Configure the build output
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
  },
  
  // Configure the dev server
  server: {
    port: 3000,
    open: true,
  },
  
  // Resolve file extensions and aliases
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    alias: {
      '@': './js',
    },
  },
  
  // Process TS files and handle resolution
  optimizeDeps: {
    include: ['microsoft-cognitiveservices-speech-sdk'],
  },
});
