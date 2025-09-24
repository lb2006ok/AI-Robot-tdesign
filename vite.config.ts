import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: './src/main.ts', // 你的入口文件
      name: 'MyChatWidget', // 库的全局变量名
      fileName: (format) => `my-chat-widget.${format}.js`
    },
    rolldownOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})
