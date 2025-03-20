import { defineConfig } from 'vite';

export default defineConfig({
  // Base public path for assets - use /spelling-quiz-game/ for production
  base: process.env.NODE_ENV === 'production' ? '/spelling-quiz-game/' : '/',
  
  // Configure the build output
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    // Ensure proper MIME types for GitHub Pages
    assetsInlineLimit: 4096,
    rollupOptions: {
      input: {
        main: 'index.html',
      },
      output: {
        // Ensure all file extensions are explicitly set for correct MIME types
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
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
