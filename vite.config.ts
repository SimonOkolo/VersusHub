import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: '/index.html',
        home: '/src/pages/home/index.html',
        matches: '/src/pages/matches/index.html',
        profile: '/src/pages/profile/index.html',
      },
    },
  },
});