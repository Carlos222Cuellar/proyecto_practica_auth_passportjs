// const express = require('express');
// const MoviesService = require('../services/movies');

// const {
//   movieIdSchema,
//   createMovieSchema,
//   updateMovieSchema
// } = require('../utils/schemas/movies');

// const validationHandler = require('../utils/middleware/validationHandler');

// const cacheResponse = require('../utils/cacheResponse');
// const {
//   FIVE_MINUTES_IN_SECONDS,
//   SIXTY_MINUTES_IN_SECONDS
// } = require('../utils/time');

// function moviesApi(app) {
//   const router = express.Router();
//   app.use('/api/movies', router);

//   const moviesService = new MoviesService();

//   router.get('/', async function(req, res, next) {
//     cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
//     const { tags } = req.query;

//     try {
//       const movies = await moviesService.getMovies({ tags });

//       res.status(200).json({
//         data: movies,
//         message: 'movies listed'
//       });
//     } catch (err) {
//       next(err);
//     }
//   });

//   router.get(
//     '/:movieId',
//     validationHandler({ movieId: movieIdSchema }, 'params'),
//     async function(req, res, next) {
//       cacheResponse(res, SIXTY_MINUTES_IN_SECONDS);
//       const { movieId } = req.params;

//       try {
//         const movies = await moviesService.getMovie({ movieId });

//         res.status(200).json({
//           data: movies,
//           message: 'movie retrieved'
//         });
//       } catch (err) {
//         next(err);
//       }
//     }
//   );

//   router.post('/', validationHandler(createMovieSchema), async function(
//     req,
//     res,
//     next
//   ) {
//     const { body: movie } = req;
//     try {
//       const createdMovieId = await moviesService.createMovie({ movie });

//       res.status(201).json({
//         data: createdMovieId,
//         message: 'movie created'
//       });
//     } catch (err) {
//       next(err);
//     }
//   });

//   router.put(
//     '/:movieId',
//     validationHandler({ movieId: movieIdSchema }, 'params'),
//     validationHandler(updateMovieSchema),
//     async function(req, res, next) {
//       const { movieId } = req.params;
//       const { body: movie } = req;

//       try {
//         const updatedMovieId = await moviesService.updateMovie({
//           movieId,
//           movie
//         });

//         res.status(200).json({
//           data: updatedMovieId,
//           message: 'movie updated'
//         });
//       } catch (err) {
//         next(err);
//       }
//     }
//   );

//   router.delete(
//     '/:movieId',
//     validationHandler({ movieId: movieIdSchema }, 'params'),
//     async function(req, res, next) {
//       const { movieId } = req.params;

//       try {
//         const deletedMovieId = await moviesService.deleteMovie({ movieId });

//         res.status(200).json({
//           data: deletedMovieId,
//           message: 'movie deleted'
//         });
//       } catch (err) {
//         next(err);
//       }
//     }
//   );
// }

// module.exports = moviesApi;


const express = require('express');
const passport = require('passport');
const MoviesService = require('../services/movies');

const {
    movieIdSchema,
    createMovieSchema,
    updateMovieSchema
} = require('../utils/schemas/movies');

const validationHandler = require('../utils/middleware/validationHandler');
const scopesValidationHandler = require('../utils/middleware/scopesValidationHandler'); //manejador de los scopes para nuestra aplicacion

const cacheResponse = require('../utils/cacheResponse');
const {
    FIVE_MINUTES_IN_SECONDS,
    SIXTY_MINUTES_IN_SECONDS
} = require('../utils/time');

// JWT strategy
require('../utils/auth/strategies/jwt');

function moviesApi(app) {
    const router = express.Router();
    app.use('/api/movies', router);

    const moviesService = new MoviesService();

    router.get(
        '/',
        //solo se podra acceder a nuestras rutas si tenemos un jwt valido
        passport.authenticate('jwt', { session: false }), //definiendo nuestra estrategia con passport solo le decimos que use a jwt y la sesion sea false para que no inicie sesion
        scopesValidationHandler(['read:movies']), //como ya validamos si tiene scopes el usuario verificamos en la ruta del get si el usuario puede leer las peliculas que tenemos guardadas de ser asi lo permite si no no le deja por falta de permisos
        async function(req, res, next) {
            cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
            const { tags } = req.query;

            try {
                const movies = await moviesService.getMovies({ tags });

                res.status(200).json({
                    data: movies,
                    message: 'movies listed'
                });
            } catch (err) {
                next(err);
            }
        }
    );

    router.get(
        '/:movieId',
        passport.authenticate('jwt', { session: false }),
        scopesValidationHandler(['read:movies']),
        validationHandler({ movieId: movieIdSchema }, 'params'),
        async function(req, res, next) {
            cacheResponse(res, SIXTY_MINUTES_IN_SECONDS);
            const { movieId } = req.params;

            try {
                const movies = await moviesService.getMovie({ movieId });

                res.status(200).json({
                    data: movies,
                    message: 'movie retrieved'
                });
            } catch (err) {
                next(err);
            }
        }
    );

    router.post(
        '/',
        passport.authenticate('jwt', { session: false }),
        scopesValidationHandler(['create:movies']), //scopes para crear movies
        validationHandler(createMovieSchema),
        async function(req, res, next) {
            const { body: movie } = req;
            try {
                const createdMovieId = await moviesService.createMovie({ movie });

                res.status(201).json({
                    data: createdMovieId,
                    message: 'movie created'
                });
            } catch (err) {
                next(err);
            }
        }
    );

    router.put(
        '/:movieId',
        passport.authenticate('jwt', { session: false }),
        scopesValidationHandler(['update:movies']), //Scopes para actualizar las movies
        validationHandler({ movieId: movieIdSchema }, 'params'),
        validationHandler(updateMovieSchema),
        async function(req, res, next) {
            const { movieId } = req.params;
            const { body: movie } = req;

            try {
                const updatedMovieId = await moviesService.updateMovie({
                    movieId,
                    movie
                });

                res.status(200).json({
                    data: updatedMovieId,
                    message: 'movie updated'
                });
            } catch (err) {
                next(err);
            }
        }
    );

    router.delete(
        '/:movieId',
        passport.authenticate('jwt', { session: false }),
        scopesValidationHandler(['deleted:movies']), //scopes para eliminar movies
        validationHandler({ movieId: movieIdSchema }, 'params'),
        async function(req, res, next) {
            const { movieId } = req.params;

            try {
                const deletedMovieId = await moviesService.deleteMovie({ movieId });

                res.status(200).json({
                    data: deletedMovieId,
                    message: 'movie deleted'
                });
            } catch (err) {
                next(err);
            }
        }
    );
}

module.exports = moviesApi;