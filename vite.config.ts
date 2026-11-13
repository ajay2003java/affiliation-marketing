import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const claudeKey =
    env.claude_api_key ||
    env.CLAUDE_API_KEY ||
    env.VITE_CLAUDE_API_KEY ||
    env.VITE_ANTHROPIC_API_KEY ||
    ''

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_CLAUDE_API_KEY': JSON.stringify(claudeKey),
      'import.meta.env.claude_api_key': JSON.stringify(claudeKey)
    },
    optimizeDeps: {
      include: ['xlsx']
    },
    server: {
      host: true,
      port: 5173
    }
  }
})
