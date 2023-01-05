// Require the framework and instantiate it
import { env, exit } from 'node:process';
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
    .setErrorHandler((error, request, reply) => {
        reply.status(error.statusCode).send({message: '[router] -> ' + error.statusCode + ' ' + error.message})
    })
    .setNotFoundHandler((request, reply) => {
        reply.status(404).send({message: '[router] -> 404 Not Found'})
    })

// Run the server!
const start = async () => {
    try {
        await fastify
            .listen({ host: env.ADDRESS, port: env.PORT || 3000 })
    } catch (err) {
        fastify.log.error(err)
        exit(1)
    }
}
start().then(r => fastify.log.info('Server Started!!!\n' + fastify.printRoutes({ commonPrefix: false })))