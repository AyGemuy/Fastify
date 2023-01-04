// Require the framework and instantiate it
import * as process from 'node:process';
import { config } from "dotenv";
config()
import Fastify from "fastify";
import routes from "./router/routes.js";

const envToLogger = {
    development: {
        transport: {
            target: 'pino-pretty',
            options: {
                translateTime: 'HH:MM:ss Z',
                singleLine: true,
                ignore: 'hostname',
            },
        },
    },
    production: true,
    test: false,
}

const fastify = Fastify({
    logger: envToLogger['development'] ?? true
})

fastify
    .register(routes)
    .addHook('onSend', async (request, reply, payload) => {
        reply.header('Server', 'Fastify')
    })

// Run the server!
const start = async () => {
    try {
        await fastify
            .listen({ host: process.env.ADDRESS, port: process.env.PORT || 3000 })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start().then(r => fastify.log.info('Server started'))