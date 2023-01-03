const fp = require('fastify-plugin')
const v1 = require('./v1')

module.exports = fp(async function (app, opts) {
    app.register(v1, {
        prefix: '/api/v1',
    })
    app.addHook('onSend', (request, reply, payload, done) => {
        reply.header('Content-Type', 'application/json')
        done(null, payload)
    })
}, {
    name: 'api-routes'
})