// DEBUG=app:* node scripts/mongo/seedApiKeys.js ejecutar en consola para mandar los datos

const chalk = require('chalk');
const crypto = require('crypto');
const debug = require('debug')('app:scripts:api-keys');
const MongoLib = require('../../lib/mongo');

//creando los apikeys vamos a crear dos uno para admin y otro para user el de admin tiene todos los privilegios y el de user puede hacer ciertas cosas

const adminScopes = [
    'signin:auth',
    'signup:auth',
    'read:movies',
    'create:movies',
    'update:movies',
    'delete:movies',
    'read:user-movies',
    'create:user-movies',
    'delete:user-movies'
];

const publicScopes = [
    'signin:auth',
    'signup:auth',
    'read:movies',
    'read:user-movies',
    'create:user-movies',
    'delete:user-movies'
];

const apiKeys = [{
        token: generateRandomToken(),
        scopes: adminScopes
    },
    {
        token: generateRandomToken(),
        scopes: publicScopes
    }
];

//generar token diferentes de manera random por si alguien esta usando la misma app tenga token diferentes
function generateRandomToken() {
    const buffer = crypto.randomBytes(32);
    return buffer.toString('hex');
}

async function seedApiKeys() {
    try {
        const mongoDB = new MongoLib();

        const promises = apiKeys.map(async apiKey => {
            await mongoDB.create('api-keys', apiKey);
        });

        await Promise.all(promises);
        debug(chalk.green(`${promises.length} api keys have been created succesfully`)); // prettier-ignore
        return process.exit(0);
    } catch (error) {
        debug(chalk.red(error));
        process.exit(1);
    }
}

seedApiKeys();