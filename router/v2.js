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


async function findId(request) {

    switch (true) {
        case request.body !== undefined && request.body.id !== undefined:
            return request.body.id
        case request.params.id !== undefined:
            return request.params.id
        case request.query.id !== undefined:
            return request.query.id
        default:
            return undefined
    }
}

async function getCars(request, reply) {
    const id = request.params.id
    if (id) {
        const car = await Car.findByPk(id)
        if (!car) {
            reply.code(404).send({message: 'Car not found'})
        } else {
            reply.send({car})
        }
    } else {
        const totalCars = {total: await Car.count(), cars: await Car.findAll()}
        reply.send(totalCars)
    }
}

async function createCar(request, reply) {
    const car = await Car.create(request.body)
    reply.status(201).send({car})
}

async function updateCar(request, reply) {
    const id = await findId(request)
    const car = await Car.findByPk(id)
    if (!car) {
        reply.code(404).send({message: 'Car not found'})
    } else {
        await car.update(request.body, {where: {id: id}})
        reply.send({car})
    }
}

async function deleteCar(request, reply) {
    const id = await findId(request)
    const car = await Car.findByPk(id)
    if (!car) {
        reply.code(404).send({message: 'Car not found'})
    } else {
        await car.destroy()
        reply.send({message: 'Car deleted'})
    }
}

async function v2 (fastify, options) {
    fastify.addHook('onReady', async () => {await dbInit().then(r => fastify.log.info('Database initialized'))})
    fastify.get('/cars', getCars)

    fastify.get('/cars/:id', {schema: schema.params}, getCars)

    fastify.post('/cars', { schema: schema.body, onRequest: async (request, reply) => {
        if (await Car.count() >= 20) {
            await dbInit().then(() => fastify.log.warn('Maximum Reach Db Resetting'))
        }}}, createCar)

    fastify.put('/cars', { schema: schema.querystring }, updateCar)

    fastify.put('/cars/:id(^\\d+)', { schema: schema.params }, updateCar)

    fastify.delete('/cars', { schema: schema.querystring, onResponse: async (request, reply) => {
            if (await Car.count() <= 6) {
                await dbInit().then(() => fastify.log.warn('Minimum Reach Db Resetting'))
            }}}, deleteCar)

    fastify.delete('/cars/:id(^\\d+)', { schema: schema.params, onResponse: async (request, reply) => {
            if (await Car.count() <= 6) {
                await dbInit().then(() => fastify.log.warn('Minimum Reach Db Resetting'))
            }}}, deleteCar)
}

export default v2