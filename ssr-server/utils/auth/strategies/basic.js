const passport = require("passport");
const { BasicStrategy } = require("passport-http"); //queremos el la clase BasicStrategy de passsport-http
const boom = require("@hapi/boom"); //manejar los errores
const axios = require("axios"); //hacer peticiones
const { config } = require("../../../config/index"); //para poder usar nuestras variables de entorno


//definir nuestra estrategia
passport.use(
    new BasicStrategy(async function(email, password, cb) { //recibe un email y un password y el callbalck para manejar los errores
        //manejar el codigo
        try {
            const { data, status } = await axios({ //voy a obtener el data y el status de nuestra peticion con axios
                url: `${config.apiUrl}/api/auth/sign-in`, //url donde se hara el request le pasamos el variable de entorno y luego la ruta a la que queremos hacer request especificamente
                method: "post", //cual es el metodo a usar
                auth: {
                    password,
                    username: email
                },
                data: {
                    apiKeyToken: config.apiKeyToken //para que nos devuelva los scopes que le estamos requiriendo
                }
            });

            //si responde pero no hay data o estado no es 200
            if (!data || status !== 200) {
                return cb(boom.unauthorized(), false); //le decimos que no esta autorizado y que no hay sesion
            }

            return cb(null, data); // error null y retornamos nuestros datos porque si hay data 
            //si no se cumple lo capturamos con catch el error 
        } catch (error) {
            cb(error); //devolvemos el error en nuestro callback
        }
    })
);