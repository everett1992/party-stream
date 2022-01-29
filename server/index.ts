import Fastify from 'fastify'
import fastifyWebsocket from 'fastify-websocket'
import fastifyStatic from 'fastify-static'
import { join, basename, dirname } from 'path'
import { Timing } from './timing'
import { SocketMessage } from '#common/types'

import { Command } from 'commander'

const ESBUILD_OUT_DIR = join(__dirname, '..', 'client', 'dist')
const ESBUILD_ENTRY = join(__dirname, '..', 'client', 'index.ts')
const PUBLIC_DIR = join(__dirname, '..', 'client', 'public')

new Command()
  .requiredOption('-p, --port <port>', 'server port', n => parseInt(n, 10), 3_000)
  .requiredOption('-v, --video <path>', 'path to video to serve')
  .option('--esbuild', 'autobuild the client')
  .action(async (opts) => {
    if (opts.esbuild) {
      const esbuild = await import('esbuild')
      esbuild.build({
        watch: true,
        color: true,
        bundle: true,
        entryPoints: [ESBUILD_ENTRY],
        target: ['chrome58', 'firefox57', 'safari11'],
        outdir: ESBUILD_OUT_DIR,
      })
    }

    const timing = new Timing()
    const fastify = Fastify({logger: {prettyPrint: true}})
    fastify.register(fastifyWebsocket, { options: { clientTracking: true } })
    fastify.register(fastifyStatic, { root: [ESBUILD_OUT_DIR, PUBLIC_DIR]})
    fastify.log.info(opts)
    fastify.get('/video', function (_req, reply) {
      reply.sendFile(basename(opts.video), dirname(opts.video), {
        acceptRanges: true,
        cacheControl: true,
      })
    })
    fastify.get('/ws', { websocket: true,  }, function (connection, _req) {
      connection.socket.send(JSON.stringify(timing.sample()))
      connection.socket.on('message', data => {
        const message = JSON.parse(data.toString()) as SocketMessage
        fastify.log.trace(message, 'message')
        if (message.vector != null) {
          broadcast(timing.update(message.vector))
        }
      })
    })

    function broadcast(message: any) {
        fastify.log.trace(message, 'broadcast')
      for (const client of fastify.websocketServer.clients) {
        client.send(JSON.stringify(message))
      }
    }

    fastify.listen(opts.port, '0.0.0.0')
  })
  .parseAsync(process.argv)
  .catch(err => {
    console.log(err)
    process.exit(1)
  })
