import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import {viteStaticCopy} from "vite-plugin-static-copy";
// import replace from "@rollup/plugin-replace";

// https://vitejs.dev/config/
// Yes, I know about vite-pwa... but it's overkill for our needs
// We're not doing any passthrough caching.
// https://vite-pwa-org.netlify.app/guide/

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    // svgr "inlines" .svg so they can be easily turned into React components.
    svgr({
      svgrOptions: {
        svgo: true,
        replaceAttrValues: { 'black': 'currentColor' }
      }
    }),
    viteStaticCopy({
      targets: [
        {
          src: './src/service-worker.js',
          dest: './',
        },
        {
          src: './src/registerSW.js',
          dest: './',
        },
      ]}),
    // replace({__DATE__: new Date().toISOString()})
  ],
  // optimizeDeps: {
  //   include: [
  //     "node_modules/jszip/dist/*"
  //   ],
  // },
  // build: {
  //   commonjsOptions: {
  //     include: []
  //   }
  // },
  css: {
    modules: {
      scopeBehaviour: 'local',
      localsConvention: 'camelCaseOnly'
    }
  }
})
