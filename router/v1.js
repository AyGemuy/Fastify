async function ping (request, reply) {
    reply.send({
        agent: await request.headers['user-agent'],
        date: new Date().toUTCString(),
        message: 'pong'
    })
}


async function info (request, reply) {
    let gitHash = require('child_process')
        .execSync('git rev-parse HEAD')
        .toString().trim().slice(0, 7)
    reply.send({
        project: {
            name: process.env.NAME,
            description: process.env.DESCRIPTION,
            language: process.env.LANGUAGE,
            url: process.env.URL,
            "git hash": gitHash,
            version: process.env.VERSION
        }
    })
}

async function connections (request, reply) {
    const { lsof } = require('list-open-files')
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
}

module.exports = v1