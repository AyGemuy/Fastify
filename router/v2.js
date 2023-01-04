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
    query: {
        type: 'object',
        properties: {
            id: {type: 'integer', maximum: 20}
        }
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
    const id = request.body.id !== undefined ? request.body.id
        : request.params.id !== undefined ? request.params.id
            : request.query.id !== undefined ? request.query.id
                : undefined
    const car = await Car.findByPk(id)
    if (!car) {
        reply.code(404).send({message: 'Car not found'})
    } else {
        await car.update(request.body, {where: {id: id}})
        reply.send({car})
    }
}

async function deleteCar(request, reply) {
    const id = request.params.id !== undefined ? request.params.id
        : request.query.id !== undefined ? request.query.id
            : undefined
    const car = await Car.findByPk(id)
    if (!car) {
        reply.code(404).send({message: 'Car not found'})
    } else {
        await car.destroy()
        reply.send({message: 'Car deleted'})
    }
}

async function v2 (fastify, options) {
    fastify.get('/cars', getCars)

    fastify.get('/cars/:id', {schema: schema.params}, getCars)

    fastify.post('/cars', { schema: schema.body, onRequest: async (request, reply) => {
        await Car.count() >= 20 ? await dbInit()
            .then(() => fastify.log.warn('Maximum Reach Db Resetting')) : null
    }}, createCar)

    fastify.put('/cars', { schema: schema.query }, updateCar)

    fastify.put('/cars/:id(^\\d+)', { schema: schema.params }, updateCar)

    fastify.delete('/cars', { schema: schema.query, onSend: async (request, reply) => {
            await Car.count() <= 6 ? await dbInit()
                .then(() => fastify.log.warn('Minimum Reach Db Resetting')) : null
        }}, deleteCar)

    fastify.delete('/cars/:id(^\\d+)', { schema: schema.params, onSend: async (request, reply) => {
            await Car.count() <= 6 ? await dbInit()
                .then(() => fastify.log.warn('Minimum Reach Db Resetting')) : null
        }}, deleteCar)
}

export default v2