import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
		react(),
		tailwindcss()
	],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
		}
	},
	server: {
		allowedHosts: [
			'nondispersive-morton-catalectic.ngrok-free.dev'
		],
		proxy: {
			'/api': {
				target: 'http://localhost:8081',
				changeOrigin: true,
			},
			'/health': {
				target: 'http://localhost:8081',
				changeOrigin: true,
			},
		},
	},
})
