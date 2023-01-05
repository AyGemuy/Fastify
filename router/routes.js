import fp from "fastify-plugin"
import v1 from "./v1.js"
import v2 from "./v2.js";
import v3 from "./v3.js";

export default fp(async function routes (app, opts) {
    app.register(v1, {
        prefix: '/api/v1',
    })
    app.register(v2, {
        prefix: '/api/v2',
    })
    app.register(v3, {
        prefix: '/api/v3',
    })
    app.addHook('onSend', async (request, reply, payload) => {
        reply.header('Content-Type', 'application/json')
    })
}, {
    name: 'routes'
});