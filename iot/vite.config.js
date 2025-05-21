import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig(() => {
  return {
    base: './',
    build: {
      outDir: './dist',
      assetsDir: 'assets',
      assetsInlineLimit: 4096,
      rollupOptions: {
        output: {
          assetFileNames(assetInfo) {
            const assetsFileNamesMap = new Map([
              [/.(png|jpg|jpeg|gif|svg|webp)$/, '/img/[name].[ext]'],
              [/.css$/, '/css/[name]-[hash].[ext]'],
              [/.(mp3|mp4)$/, '/media/[name]-[hash].[ext]'],
              [/.(woff2|woff|eot|ttf)$/, '/font/[name].[ext]'],
            ])

            for (const [reg, value] of assetsFileNamesMap.entries()) {
              if (reg.test(assetInfo.name)) {
                return `assets${value}`
              }
            }

            return 'assets/[ext]/[name]-[hash].[ext]'
          },
          entryFileNames: 'assets/js/index.js',
        },
      },
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
        include: [
          /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
          /\.vue$/,
          /\.vue\?vue/, // .vue
          /\.md$/, // .md
        ],
        imports: ['vue'],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
  }
})
