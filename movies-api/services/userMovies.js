const MongoLib = require('../lib/mongo'); //importamos la libreria de mongo para poder usar los metodos de mongo en nuestro archivo actual

//definimos la clase de nuestro servicio
class UserMoviesService {
    //se crea el constructor de la clase
    constructor() {
        this.collection = 'user-movies'; //la coleccion de mongo
        this.mongoDB = new MongoLib(); //creo el cliente de mongo que es una instancia de la libreria
    }

    //metodos 
    //obtener peliculas atravez del id del usuario
    async getUserMovies({ userId }) {
        const query = userId && { userId }; //creo la query  que nos traiga todos las peliculas de ese usuario que coincidan con ese id de usuario
        const userMovies = await this.mongoDB.getAll(this.collection, query); // busca en la coleccion las coincidencias 

        return userMovies || []; //devolvemos las que encuentre si no devolvemos un array vacio
    }

    //el usuario quiere agregar peliculas a su lista  de usuarios
    async createUserMovie({ userMovie }) {
        const createdUserMovieId = await this.mongoDB.create(
            this.collection,
            userMovie
        ); //creamos un pelicula con el id de la pelicula que queremos agregar metodo create de mongo recibe una coleccion

        return createdUserMovieId; //retorna la lista creada
    }

    //el usuario puede eliminar peliculas de sus favoritos
    async deleteUserMovie({ userMovieId }) {
        const deletedUserMovieId = await this.mongoDB.delete(
            this.collection,
            userMovieId
        ); //le pasamos la colecccion a eliminar por medio del id de la pelicula con el ,metodo delete de mongo

        return deletedUserMovieId; //retornamos el id de la pelicuala que acabamos de borrar
    }
}

//exportamos nuestros modulos que acabamos de crear
module.exports = UserMoviesService;