import { defineConfig } from 'vite';

// GitHub Pages base path
const GITHUB_PAGES_BASE = '/spelling-quiz-game/';

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production' || process.env.NODE_ENV === 'production';
  const base = isProd ? GITHUB_PAGES_BASE : '/';
  
  console.log(`Building for ${isProd ? 'production' : 'development'} with base: ${base}`);
  
  return {
    // Base public path for assets
    base,
    
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
      // Fix for GitHub Pages path issues
      assetsDir: 'assets',
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
  };
});
