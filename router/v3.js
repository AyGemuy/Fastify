import { User, dbInit } from "../model/user.js";


async function v3 (fastify, options) {
    fastify.register(import('@fastify/multipart'), { addToBody: true })
    fastify.addHook('onReady', async () => {await dbInit().then(r => fastify.log.info('Auth initialized'))})
    fastify.route({
        method: ['GET', 'POST'],
        url: '/auth',
        handler: async (request, reply) => {
            if (request.method === 'GET') {
                reply.send({message: 'Auth'})
            }
            const { username, password } = request.body
            if (username && password) {
                const user = await User.findOne({ where: { username: username } })
                if (user) {
                    reply.send(user)
                }
        }
    }})
}

export default v3