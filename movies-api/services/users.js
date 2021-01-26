//vamos a requerir la libreria de mongo la cual nos va permitir usar todos los metodos que tiene mongo definidos
const MongoLib = require('../lib/mongo.js');
const bcrypt = require('bcrypt'); //lo vamos a usar para encriptar nuestras contraseñas asi si logran acceder a nuestra base de datos por lo menos no tendran tan facil las contraseñas

//crear la clase para los usuarios
class UsersService {
    //vamos a crear un constructor
    constructor() {
        this.collection = 'users'; //aqui va ser donde vamos a definir nuestras colecciones de usuarios a crear
        this.MongoDB = new MongoLib(); //va ser el que maneje nuestra instancia de mongo
    }

    //vamos a crear un metodo que va recibir un email y por el cual de este vamos a buscar a los usuarios en la base de datos

    async getUser({ email }) {
        const [user] = await this.MongoDB.getAll(this.collection, { email }); //vamos a buscar en la coleccion con el metodo getAll que recibe la coleccion donde vamos a buscar y el query en este caso el email que es el que queremos buscra en la coleccion
        return user; //retornamos el usuario si lo encuentra
    }

    //vamos a crear otr funcion que va ser la que se va usar para crear nuestros usuarios
    async createUser({ user }) {
        const [name, email, password] = user; //lo vamos a destructurar de user
        //vamos a crear nuestra password cifrada
        const hashPassword = await bcrypt.hash(password, 10); //el metodo hash recibe la contraseña y el numero de iteraciones para crear el hash

        //vamos a crear al usuario
        const createUserId = await this.MongoDB.create(this.collection, {
            name,
            email,
            password: hashPassword,
        });

        return createUserId;

    }
}


module.exports = UsersService;