const express = require('express'); //importamos express para manejar las rutas
const passport = require('passport'); //vamos a crear un custom callback para nuestra auth
const boom = require('@hapi/boom'); //manejar errores de nuestra autentificacion
const jwt = require('jsonwebtoken'); //para crear nuestra webtoken firmado
const ApiKeysService = require('../services/apiKeys'); //importamos nuestro servicio
const UsersService = require('../services/users'); // servicio de los usuarios
const validationHandler = require('../utils/middleware/validationHandler'); //vamos usar el manejador de validaciones

const {
    createUserSchema,
    createProviderUserSchema
} = require('../utils/schemas/users'); //hacemos un destructuracion del esquema para crear usuarios

const { config } = require('../config'); //importamos nuestro archivo de configuracion para poder usar nuestro secret

// Basic strategy
require('../utils/auth/strategies/basic');

//funcion que va ser nuestra funcionalidad de auth recibe una app que es una app de express
function authApi(app) {
    const router = express.Router(); //creamos un nuevo router mediante express
    app.use('/api/auth', router); //le decimos cual ruta usar y le decimos que use el router que acabamos de definir

    const apiKeysService = new ApiKeysService(); //invocamos el servicio que creamos para nuestra apikey
    const usersService = new UsersService(); //creamos la instancia del servicio de user

    //metodo post va recibir la ruta y un callback ruta que asu vez recibe un request un response y el next para manejar errrores
    router.post('/sign-in', async function(req, res, next) {
        const { apiKeyToken } = req.body; //vamos a verificar que en el cuerpo venga el apiKeyToken este es el que le vamos a pasar al sing in para ver que tipo de permisos le vamos a dar al usuario

        //verificar si el token no existe
        if (!apiKeyToken) {
            return next(boom.unauthorized('apiKeyToken is required')); //con boom manejamos el error y le indicamos que falta el token
        }

        passport.authenticate('basic', function(error, user) {
            try {
                if (error || !user) {
                    return next(boom.unauthorized());
                }

                req.login(user, { session: false }, async function(error) {
                    if (error) {
                        return next(error);
                    }

                    const apiKey = await apiKeysService.getApiKey({ token: apiKeyToken });

                    if (!apiKey) {
                        return next(boom.unauthorized());
                    }

                    const { _id: id, name, email } = user;

                    const payload = {
                        sub: id,
                        name,
                        email,
                        scopes: apiKey.scopes
                    };

                    const token = jwt.sign(payload, config.authJwtSecret, {
                        expiresIn: '15m'
                    });

                    return res.status(200).json({ token, user: { id, name, email } });
                });
            } catch (error) {
                next(error);
            }
        })(req, res, next);
    });

    router.post('/sign-up', validationHandler(createUserSchema), async function(
        req,
        res,
        next
    ) {
        const { body: user } = req;

        try {
            const createdUserId = await usersService.createUser({ user });

            res.status(201).json({
                data: createdUserId,
                message: 'user created'
            });
        } catch (error) {
            next(error);
        }
    });

    router.post(
        '/sign-provider',
        validationHandler(createProviderUserSchema),
        async function(req, res, next) {
            const { body } = req;

            const { apiKeyToken, ...user } = body;

            if (!apiKeyToken) {
                return next(boom.unauthorized('apiKeyToken is required'));
            }

            try {
                const queriedUser = await usersService.getOrCreateUser({ user });
                const apiKey = await apiKeysService.getApiKey({ token: apiKeyToken });

                if (!apiKey) {
                    return next(boom.unauthorized());
                }

                const { _id: id, name, email } = queriedUser;

                const payload = {
                    sub: id,
                    name,
                    email,
                    scopes: apiKey.scopes
                };

                const token = jwt.sign(payload, config.authJwtSecret, {
                    expiresIn: '15m'
                });

                return res.status(200).json({ token, user: { id, name, email } });
            } catch (error) {
                next(error);
            }
        }
    );
}

module.exports = authApi;