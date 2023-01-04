import fp from "fastify-plugin"

import v1 from "./v1.js"
import v2 from "./v2.js";

export default fp(async function routes (app, opts) {
    app.register(v1, {
        prefix: '/api/v1',
    })
    app.register(v2, {
        prefix: '/api/v2',
    })
    app.addHook('onSend', (request, reply, payload, done) => {
        reply.header('Content-Type', 'application/json')
        done(null, payload)
    })
}, {
    name: 'routes'
});