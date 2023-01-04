import {DataTypes, Sequelize} from 'sequelize';

const sequelize = new Sequelize('sqlite::memory:');
const Car = sequelize.define('Car', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            is: /^[a-z]+$/i,
        }
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: true
        }
    }
}, {
    timestamps: false
})

async function dbInit() {
    await sequelize.sync({force: true}).then(() =>
        Car.bulkCreate([
            {name: 'Audi', price: 52642},
            {name: 'Mercedes', price: 57127},
            {name: 'Skoda', price: 9000},
            {name: 'Volvo', price: 29000},
            {name: 'Bentley', price: 350000},
            {name: 'Citroen', price: 21000},
            {name: 'Hummer', price: 41400},
            {name: 'Volkswagen', price: 21600}
        ], {validate: true})
    )
}

await dbInit()

export { Car, dbInit }
