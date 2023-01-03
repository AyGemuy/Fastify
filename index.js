// Require the framework and instantiate it
require('dotenv').config()
// const fastify = require('fastify')({ logger: true })

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

const fastify = require('fastify')({
    logger: envToLogger['development'] ?? true
})

fastify
    .register(require('./router/routes'))
    .addHook('onSend', (request, reply, payload, done) => {
        reply.header('Server', 'Fastify')
        done(null, payload)
    })

// Run the server!
const start = async () => {
    try {
        await fastify
            .listen({ host: process.env.ADDRESS, port: process.env.PORT || 3000 })
    } catch (err) {
        fastify.log.transport(err)
        process.exit(1)
    }
}
start().then(r => console.log('Server started'))