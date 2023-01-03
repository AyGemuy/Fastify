async function ping (request, reply) {
    reply.send({
        agent: await request.headers['user-agent'],
        date: new Date().toUTCString(),
        message: 'pong'
    })
}


async function info (request, reply) {
    let git_hash = require('child_process')
        .execSync('git rev-parse HEAD')
        .toString().trim().slice(0, 7)
    reply.send({
        project: {
            name: process.env.NAME,
            description: process.env.DESCRIPTION,
            language: process.env.LANGUAGE,
            url: process.env.URL,
            "git hash": git_hash,
            version: process.env.VERSION
        }
    })
}


async function v1 (fastify, options) {
    fastify.get('/ping', ping)
    fastify.get('/info', info)
}

module.exports = v1