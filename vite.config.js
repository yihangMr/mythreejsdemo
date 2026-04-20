import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'  // 需要引入 path 模块

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')  // 假设你的源码目录是 src
    }
  }
})