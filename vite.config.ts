import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
          supabase: ['@supabase/supabase-js'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          charts: ['recharts']
        }
      }
    },
    sourcemap: mode === 'development',
    minify: mode === 'production' ? 'terser' : false,
    target: 'es2020'
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : []
  }
}));
