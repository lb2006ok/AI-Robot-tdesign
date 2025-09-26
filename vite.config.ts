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
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://192.168.30.9:7777',
        changeOrigin: true, // 改变请求头中的host为目标地址的origin
        rewrite: (path) => path.replace(/^\/api/, '') // 重写路径（可选）
      }
    }
  }
})
