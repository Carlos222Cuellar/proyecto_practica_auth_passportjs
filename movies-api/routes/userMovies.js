// const express = require('express'); //vamos a usar express
// //vamos a implementar en la rutas los srevicios y los esquemas creados 

// const UserMoviesService = require('../services/userMovies'); //importamos el servicio recien creado
// const validationHandler = require('../utils/middleware/validationHandler'); //importamos nuestro manejador de validaciones que previamente ya habiamos creado

// const { movieIdSchema } = require('../utils/schemas/movies'); //importamos los esquemas que necesitamos para validar esa validacion
// const { userIdSchema } = require('../utils/schemas/users'); //esquema del userid
// const { createUserMovieSchema } = require('../utils/schemas/userMovies'); //esquema del create user

// //funcion donde se definiran las rutas recibe app que es de express
// function userMoviesApi(app) {
//     const router = express.Router(); //recibe el router
//     app.user('/api/user-movies', router); //el router que acabamos de crear va ser en la ruta /api/user-movies

//     const userMoviesService = new UserMoviesService(); //creamos una nueva instancia de nuestros servicios

//     //vamos a configurar la peticiones a nuestras rutas
//     router.get( //cuando nos hagan un get
//         '/', //a la raiz
//         validationHandler({ userId: userIdSchema }, 'query'), //le pasamos el middleware de validacion que recibe el esquema de id que lo tomamso del parametro que envie el usuario atravez de la url
//         async function(req, res, next) { //el middleware como va manejar errores recibe la peticion la respuesta y next para manejar los errores
//             const { userId } = req.query; //la peticion es el id 

//             try {
//                 const userMovies = await userMoviesService.getUserMovies({ userId }); //obtenemos un usermovie haciendo uso de nuestro serviccio usamos el metodo get y le pasamo el query que lo sacamos de los parametros del request

//                 //si sale bien respondemos con el codigo de status 200
//                 res.status(200).json({
//                     data: userMovies, //devolvemos el userMovie
//                     message: 'user movies listed'
//                 });
//             } catch (error) {
//                 next(error); //manera de manejar un error de manera asicrona
//             }
//         }
//     );

//     //metodo post en nuestra ruta
//     router.post('/', validationHandler(createUserMovieSchema), async function(
//             req,
//             res,
//             next
//         ) //recibe la funciond e la ruta con el req el res y next 
//         {
//             const { body: userMovie } = req; //del request recibimos el body con el userMovie correspondiente al usuario

//             //si todo esta bien se recibe la informacion y se crea
//             try {
//                 const createdUserMovieId = await userMoviesService.createUserMovie({
//                     userMovie
//                 }); //se crea todo de manera correcta

//                 //se responde con status 201 y devolvemos lo que acabamos de crear como data
//                 res.status(201).json({
//                     data: createdUserMovieId,
//                     message: 'user movie created'
//                 });
//                 //si no esta bien capturamos el error que nos puede saltar
//             } catch (err) {
//                 next(err);
//             }
//         });

//     //ruta para manajar cuando queramos borrar una movie de favorite recibe la raiz y el id de lo que queremos eliminar
//     router.delete(
//         '/:userMovieId',
//         validationHandler({ userMovieId: movieIdSchema }, 'params'),
//         async function(req, res, next) {
//             const { userMovieId } = req.params;

//             try {
//                 const deletedUserMovieId = await userMoviesService.deleteUserMovie({
//                     userMovieId
//                 });

//                 res.status(200).json({
//                     data: deletedUserMovieId,
//                     message: 'user movie deleted'
//                 });
//             } catch (error) {
//                 next(error);
//             }
//         }
//     );


// }

// module.exports = userMoviesApi;

const express = require('express');
const passport = require('passport');

const UserMoviesService = require('../services/userMovies');
const validationHandler = require('../utils/middleware/validationHandler');
const scopesValidationHandler = require('../utils/middleware/scopesValidationHandler');

const { movieIdSchema } = require('../utils/schemas/movies');
const { userIdSchema } = require('../utils/schemas/users');
const { createUserMovieSchema } = require('../utils/schemas/userMovies');

// JWT strategy
require('../utils/auth/strategies/jwt');

function userMoviesApi(app) {
    const router = express.Router();
    app.use('/api/user-movies', router);

    const userMoviesService = new UserMoviesService();

    router.get(
        '/',
        passport.authenticate('jwt', { session: false }),
        scopesValidationHandler(['read:user-movies']),
        validationHandler({ userId: userIdSchema }, 'query'),
        async function(req, res, next) {
            const { userId } = req.query;

            try {
                const userMovies = await userMoviesService.getUserMovies({ userId });

                res.status(200).json({
                    data: userMovies,
                    message: 'user movies listed'
                });
            } catch (error) {
                next(error);
            }
        }
    );

    router.post(
        '/',
        passport.authenticate('jwt', { session: false }),
        scopesValidationHandler(['create:user-movies']),
        validationHandler(createUserMovieSchema),
        async function(req, res, next) {
            const { body: userMovie } = req;

            try {
                const createdUserMovieId = await userMoviesService.createUserMovie({
                    userMovie
                });

                res.status(201).json({
                    data: createdUserMovieId,
                    message: 'user movie created'
                });
            } catch (err) {
                next(err);
            }
        }
    );

    router.delete(
        '/:userMovieId',
        passport.authenticate('jwt', { session: false }),
        scopesValidationHandler(['delete:user-movies']),
        validationHandler({ userMovieId: movieIdSchema }, 'params'),
        async function(req, res, next) {
            const { userMovieId } = req.params;

            try {
                const deletedUserMovieId = await userMoviesService.deleteUserMovie({
                    userMovieId
                });

                res.status(200).json({
                    data: deletedUserMovieId,
                    message: 'user movie deleted'
                });
            } catch (error) {
                next(error);
            }
        }
    );
}

module.exports = userMoviesApi;