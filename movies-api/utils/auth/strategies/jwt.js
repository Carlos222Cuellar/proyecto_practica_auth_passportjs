const passport = require('passport');
const { Strategy, ExtractJwt } = require('passport-jwt');
const boom = require('@hapi/boom'); //manejar errores

const UsersService = require('../../../services/users'); //con esto vamos a buscar nuestro usuario por medio de email
const { config } = require('../../../config'); //archivo de configuracion para decirles a nuetsra estrategia cual es la llave que se uso para firmar nuestro password y asi comparar que sean correctas

passport.use(
    new Strategy({ //para definir nuestra nueva estrategia
            //el constructor sea
            secretOrKey: config.authJwtSecret, //le decimos de donde vamos a sacar el secret en este caso de la variable de entorno
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken() //de donde vamos a sacar el json web token en este casa va ser del header
        },
        async function(tokenPayload, cb) {
            const usersService = new UsersService(); //creamos una nueva instanca de nuestro servicio donde vamos a hacer nuestra busqueda

            //vamos hacer la busqueda y si hay algun error lo capturamos
            try {
                const user = await usersService.getUser({ email: tokenPayload.email }); //sacamos el atributo email del tokenpayload decondificado

                if (!user) { //si el usuario no existe le decimos que no esta autorizado y no le decimos nada del usar para evitar cualquier ataque que se pueda llegar a dar en nuestra contra
                    return cb(boom.unauthorized(), false); //retornamos el error
                }

                delete user.password; //si lo encuentra borramos el id para que no haya problemas que accedan a nuestro codigo y vean las contraseñas

                cb(null, {...user, scopes: tokenPayload.scopes }); //callback con el error en null y devolvermos el user y un scope que tiene que venir del token que previamente ya se ha firmado
            } catch (error) { //capturamos el error
                return cb(error); //devolvemos el error
            }
        }
    )
);