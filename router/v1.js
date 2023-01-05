import { env } from 'node:process';
import { execSync } from 'node:child_process'
import { lsof } from "list-open-files";

async function ping (request, reply) {
    reply.send({
        agent: await request.headers['user-agent'],
        date: new Date().toUTCString(),
        message: 'pong'
    })
}


async function info (request, reply) {
    let gitHash = execSync('git rev-parse HEAD').toString().trim().slice(0, 7)
    reply.send({
        project: {
            name: env.NAME,
            description: env.DESCRIPTION,
            language: env.LANGUAGE,
            url: env.URL,
            "git hash": gitHash,
            version: env.VERSION
        }
    })
}

async function connections (request, reply) {
    const [ con ] = await lsof()
    const cons = con.files.filter(file => file.type === 'IP')
    cons.forEach(file => console.log(file))
    let result = []
    cons.forEach(c => {
        result.push({
            id: c.fd,
            protocol: c.protocol,
            type: c.from ? 'ESTABLISHED' : 'LISTENING',
            local: c.from ? c.from.address + ':' + c.from.port : "0.0.0.0:0",
            remote: c.to.address + ':' + c.to.port
        })
    })
    reply.send({connections: result})
}


async function v1 (fastify, options) {
    fastify.get('/ping', ping)
    fastify.get('/info', info)
    fastify.get('/connections', connections)
    fastify.get('/', async (request, reply) => {
        reply.header('Location', request.url + 'info')
            .status(301)
            .send({message: 'Redirecting to /api/v1/info'})
    })
    fastify.route({
        method: ['POST', 'PUT', 'DELETE'],
        url: options.url || '/ping',
        handler: async (request, reply) => {
            reply.code(405).send({message: 'Method not allowed'})
        }
    })
}

export default v1