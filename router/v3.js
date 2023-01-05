import { User, dbInit } from "../model/user.js"
import bcrypt from "bcrypt";
import { nanoid } from 'nanoid'

const secret = nanoid(32)

const schema = {
    body: {
        type: 'object',
        properties: {
            username: {type: 'string'},
            password: {type: 'string'}
        },
        required: ['username', 'password']
    }
}

const myCustomMessages = {
    badRequestErrorMessage: '[v3] -> Format is Authorization: Bearer [token]',
    noAuthorizationInHeaderMessage: '[v3] -> Authorization header is missing!',
    authorizationTokenExpiredMessage: '[v3] -> Authorization token expired',
    // for the below message you can pass a sync function that must return a string as shown or a string
    authorizationTokenInvalid: (err) => {
        return `Authorization token is invalid: ${err.message}`
    }
}


async function auth (request, reply) {
    reply.send({message: '[v3] -> 200 Login with Post Request'})
}

async function login (request, reply) {
    const user = await User.findOne({where: {username: request.body.username}})
    if (!user || !bcrypt.compareSync(request.body.password, user.password)) {
        reply.code(401).send({message: '[v3] -> 401 Unauthorized'})
    } else {
        const token = await reply.jwtSign({})
        reply.send({message: 'Login', token: token})
    }
}

async function check (request, reply) {
    reply.send({message: '[v3] -> 200 JWT Token validation successful!'})
}

async function s3cr5t (request, reply) {
    reply.send({s3cr5t: secret})
}

async function v3 (fastify, options) {
    fastify.register(import('@fastify/multipart'), { attachFieldsToBody: 'keyValues' })

    fastify.register(import('@fastify/jwt'), {
        secret: secret,
        sign: {
            algorithm: 'HS512',
            expiresIn: '1m'
        },
        verify: {
            algorithms: ['HS512'],
            maxAge: '1m'
        }
    })

    fastify.decorate("authenticate", async function(request, reply) {
        try {
            await request.jwtVerify()
        } catch (err) {
            reply.send(err)
        }
    })

    fastify.addHook('onReady', async () => { await dbInit().then(r => fastify.log.info('Auth initialized')) })

    fastify.get('/auth', auth)

    fastify.post('/auth', { schema: schema }, login)

    fastify.get('/check', { onRequest: [fastify.authenticate] }, check)

    fastify.get('/secure', { onRequest: [fastify.authenticate] }, s3cr5t)
}

export default v3