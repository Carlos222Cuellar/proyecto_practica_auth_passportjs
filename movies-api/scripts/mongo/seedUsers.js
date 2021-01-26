// DEBUG=app:* node scripts/mongo/seedUsers.js ejecutar en consola para correr el script

const bcrypt = require('bcrypt');
const chalk = require('chalk');
const debug = require('debug')('app:scripts:users');
const MongoLib = require('../../lib/mongo');
const { config } = require('../../config/index');


//tenemos tres usuarios ya definidos que son los que vamos a crear un  admin y dos user normales

const users = [{
        email: 'root@undefined.sh',
        name: 'ROOT',
        password: config.defaultAdminPassword, //usamos la variable de entorno con el password por defecto
        isAdmin: true
    },
    {
        email: 'jose@undefined.sh',
        name: 'Jose Maria',
        password: config.defaultUserPassword //usando el password por defecto de user normales
    },
    {
        email: 'maria@undefined.sh',
        name: 'Maria Jose',
        password: config.defaultUserPassword
    }
];

//crea los usuarios haciendo uso de mongo
async function createUser(mongoDB, user) {
    const { name, email, password, isAdmin } = user;
    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = await mongoDB.create('users', {
        name,
        email,
        password: hashedPassword,
        isAdmin: Boolean(isAdmin)
    });

    return userId;
}

//confirma la creacion de los user
async function seedUsers() {
    try {
        const mongoDB = new MongoLib();

        const promises = users.map(async user => {
            const userId = await createUser(mongoDB, user);
            debug(chalk.green('User created with id:', userId));
        });

        await Promise.all(promises);
        return process.exit(0);
    } catch (error) {
        debug(chalk.red(error));
        process.exit(1);
    }
}

seedUsers();