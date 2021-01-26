// DEBUG=app:* node scripts/mongo/seedMovies.js ejecuta eso en consola para correr el script

//lo que hace el script es crear una coleccion de movies a partir de los mocks que tenemos creados

const chalk = require('chalk');
const debug = require('debug')('app:scripts:movies');
const MongoLib = require('../../lib/mongo');
const { moviesMock } = require('../../utils/mocks/movies');

async function seedMovies() {
    try {
        const mongoDB = new MongoLib();

        const promises = moviesMock.map(async movie => {
            await mongoDB.create('movies', movie);
        });

        await Promise.all(promises);
        debug(chalk.green(`${promises.length} movies have been created succesfully`)); // prettier-ignore
        return process.exit(0);
    } catch (error) {
        debug(chalk.red(error));
        process.exit(1);
    }
}

seedMovies();