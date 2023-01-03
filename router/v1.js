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
    const { lsof} = require('list-open-files')
    const [ con ] = await lsof()
    let conPid = con.files.filter(file => file.type === 'IP')
    console.log(conPid)
    let result = []
    for (const pid of conPid) {
        result.push({
            id: pid.fd,
            protocol: pid.protocol,
            type: pid.from ? 'ESTABLISHED' : 'LISTENING',
            local: pid.from ? pid.from.address + ':' + pid.from.port : "0.0.0.0:0",
            remote: pid.to.address + ':' + pid.to.port
        })
    }
    reply.send({connections: result})
}


async function v1 (fastify, options) {
    fastify.get('/ping', ping)
    fastify.get('/info', info)
    fastify.get('/connections', connections)
}

module.exports = v1