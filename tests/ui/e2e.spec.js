import test from 'ava'
import start from '../../server/start'

const host = 'localhost'
const port = 4001
let nuxt = null
let fastify = null

test.before('Start Fastify and Nuxt servers', async (t) => {
  const server = await start(port, host)
  nuxt = server.nuxt
  fastify = server.fastify
})

test('Route / exits and render HTML', async (t) => {
  const context = {}

  const {
    html
  } = await nuxt.renderRoute('/', context)
  t.true(html.includes('<span class="title">Roomler.Live</span>'), 'Renders Title')
  t.pass()
})

test.after('Close Fastify and Nuxt servers', (t) => {
  fastify.close()
  nuxt.close()
})