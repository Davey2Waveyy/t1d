import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function devApiPlugin(env) {
  return {
    name: 'dev-api-chat',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end(JSON.stringify({ error: 'Method not allowed' }))
        }
        try {
          const chunks = []
          for await (const chunk of req) chunks.push(chunk)
          const body = JSON.parse(Buffer.concat(chunks).toString() || '{}')

          const mod = await import('./api/chat.js')
          const handler = mod.default
          await handler(
            { method: 'POST', body, headers: req.headers },
            {
              status(code) {
                res.statusCode = code
                return this
              },
              json(payload) {
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(payload))
              },
            }
          )
        } catch (err) {
          console.error('dev /api/chat error', err)
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Dev proxy error' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  process.env.GROQ_API_KEY = env.GROQ_API_KEY || process.env.GROQ_API_KEY
  return {
    plugins: [react(), devApiPlugin(env)],
  }
})
