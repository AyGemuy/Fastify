import { Car, dbInit } from "../model/car.js";

const schema = {
    body: {
        type: 'object',
        properties: {
            id: {type: 'integer', maximum: 20},
            name: {type: 'string'},
            price: {type: 'integer'}
        },
        required: ['name', 'price']
    },
    params: {
        type: 'object',
        properties: {
            id: {type: 'integer', maximum: 20}
        }
    },
    querystring: {
        type: 'object',
        properties: {
            id: {type: 'integer', maximum: 20}
        }
    }
}

function v2Message (request, m) {
    switch (true) {
        case request.params.id !== undefined:
            m = request.body !== undefined ? 'JSON in Path Parameter' : 'Path Parameter'
            break
        case request.query.id !== undefined:
            m = request.body !== undefined ? 'JSON in Query Parameter' : 'Query Parameter'
            break
        case request.body !== undefined:
            return `[v2] -> ${request.method} with JSON`
        default:
            break
    }
    return `[v2] -> ${request.method} with ${m}`
}

async function findId(request) {
    switch (true) {
        case request.params.id !== undefined:
            return request.params.id
        case request.query.id !== undefined:
            return request.query.id
        case request.body !== undefined && request.body.id !== undefined:
            return request.body.id
        default:
            return undefined
    }
}

async function getCars(request, reply) {
    const id = request.params.id
    if (id) {
        const car = await Car.findByPk(id)
        if (!car) {
            reply.code(404).send({message: '[v2] -> Car not found'})
        } else {
            reply.send({ message: v2Message(request, 'Path Parameter'), car })
        }
    } else {
        const totalCars = { total: await Car.count(), cars: await Car.findAll() }
        reply.send(totalCars)
    }
}

async function dbMaxReset (request, reply) {
    if (await Car.count() >= 20) {
        await dbInit().then(() => request.server.log.warn('Maximum Reach Db Resetting'))
    }
}

async function dbMinReset (request, reply) {
    if (await Car.count() <= 6) {
        await dbInit().then(() => request.server.log.warn('Minimum Reach Db Resetting'))
    }
}

async function createCar(request, reply) {
    const car = await Car.create(request.body)
    reply.status(201).send({ message: v2Message(request), car })
}

async function updateCar(request, reply) {
    const id = await findId(request)
    const car = await Car.findByPk(id)
    if (!car) {
        reply.code(404).send({message: '[v2] -> Car not found'})
    } else {
        await car.update(request.body, { where: {id: id} })
        reply.send({ message: v2Message(request), car})
    }
}

async function deleteCar(request, reply) {
    const id = await findId(request)
    const car = await Car.findByPk(id)
    if (!car) {
        reply.code(404).send({message: '[v2] -> Car not found'})
    } else {
        await car.destroy()
        reply.send({message: v2Message(request), delete_id: id, total: await Car.count()})
    }
}

async function v2 (fastify, options) {
    fastify.addHook('onReady', async () => { await dbInit().then(r => fastify.log.info('Database initialized')) })

    fastify.get('/cars', getCars)

    fastify.get('/cars/:id', { schema: schema.params }, getCars)

    fastify.post('/cars', { schema: schema.body, onRequest: dbMaxReset }, createCar)

    fastify.put('/cars', { schema: schema.querystring }, updateCar)

    fastify.put('/cars/:id(^\\d+)', { schema: schema.params }, updateCar)

    fastify.delete('/cars', { schema: schema.querystring, onResponse: dbMinReset }, deleteCar)

    fastify.delete('/cars/:id(^\\d+)', { schema: schema.params, onResponse: dbMinReset }, deleteCar)
}

export default v2