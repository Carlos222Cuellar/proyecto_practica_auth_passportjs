const joi = require('@hapi/joi'); //importamos el joi para manipular los esquemas
//esquemas que ya teniamos hechos quiero el esquema que tiene el id de la pelicula y el id del usuario
const { movieIdSchema } = require('./movies');
const { userIdSchema } = require('./users');
//esquema de peliculasUsuario ya que el esquema es igual al de id de usuario solo copio y pego ya que el id lo genera mongo
const userMovieIdSchema = joi.string().regex(/^[0-9a-fA-F]{24}$/);

//para crear la user-movie solo becesitamos el id de la pelicula y del usuario
const createUserMovieSchema = {
    userId: userIdSchema,
    movieId: movieIdSchema
};

//lo exportamos
module.exports = {
    userMovieIdSchema,
    createUserMovieSchema
};