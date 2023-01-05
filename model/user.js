import { DataTypes, Sequelize } from 'sequelize'
import bcrypt from 'bcrypt'

const sequelize = new Sequelize('sqlite::memory:')
const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            is: /^[a-z]+$/i,
        }
    },
    password: {
        type: DataTypes.STRING,
        set(value) {
            this.setDataValue('password', bcrypt.hashSync(value, 14))
        },
        allowNull: false,
        validate: {
            is: /^\$2[ayb]\$.{56}$/i,
        }
    }
}, {
    timestamps: false
})


async function dbInit() {
    await sequelize.sync({force: true}).then(async () =>
        User.create(
            {username: 'admin', password: 'password'},
        )
    )
}

export { User, dbInit }