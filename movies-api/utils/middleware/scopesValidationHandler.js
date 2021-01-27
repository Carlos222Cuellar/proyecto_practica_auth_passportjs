const boom = require('@hapi/boom'); //manejar errores

//va recibir los scopes permitidos para la ruta y va devolver un middleware porque tenemos que intervernir el request y el reponse
function scopesValidationHandler(allowedScopes) {
    return function(req, res, next) {
        if (!req.user || (req.user && !req.user.scopes)) { //valido si el susuario existe si esxite luego valido los scopes que tiene  que tener 
            next(boom.unauthorized('Missing scopes')); //si no tiene scopes devolvemos que no esta autorizado
        }

        //si tiene scope vamos a validar si tiene acceso
        const hasAccess = allowedScopes
            .map(allowedScope => req.user.scopes.includes(allowedScope)) //voy a hacer un map para ver si en el socpe esta el allowedscope
            .find(allowed => Boolean(allowed)); //si existe devuelve un boolean

        if (hasAccess) { //si tiene acceso llamamos al otro middleware que puede ser uno de autentificacion o otro cualquiera
            next();
        } else {
            next(boom.unauthorized('Insufficient scoopes')); //si no con boom muestro el error que faltan permisos
        }
    };
}

module.exports = scopesValidationHandler; //lo exporto