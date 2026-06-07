import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// GitHub Pages のプロジェクトページ（https://<user>.github.io/kosen-gacha/）で
// 配信するため、本番ビルドのみ base を /kosen-gacha/ にする。dev は / のまま。
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/kosen-gacha/' : '/',
  plugins: [react()],
}))
