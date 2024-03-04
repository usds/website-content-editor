import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import {viteStaticCopy} from "vite-plugin-static-copy";

export default defineConfig({
  // base: "./",
  // build: {
  //   outDir: "./dist",
  //   rollupOptions: {
  //     output: {
  //       manualChunks(id) {
  //         if (id.includes("node_modules")) {
  //           return "vendor";
  //         }
  //       },
  //     },
  //   },
  // },
  plugins: [
    react(),
    // svgr "inlines" .svg so they can be easily turned into React components.
    svgr({
      svgrOptions: {
        svgo: true,
        replaceAttrValues: {'black': 'currentColor'} // allows black/white svgs to be colorized via css?
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
      ]
    }),
    // replace({__DATE__: new Date().toISOString()})
  ],
  css: {
    modules: {
      scopeBehaviour: 'local',
      localsConvention: 'camelCaseOnly'
    }
  }
})
