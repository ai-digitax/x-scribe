import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/xsc/',
  server: {
    host: '0.0.0.0', // 全てのネットワークインターフェースでリッスン
    port: 12350,
    allowedHosts: ['d00-dis002a.dis24.net'],
  }
})
