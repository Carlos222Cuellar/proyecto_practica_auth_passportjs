const joi = require('@hapi/joi'); //nos va permitir definir el esquema para la coleccion de nuestros datos de los usuarios

//vamos a crear el esquema para definir el id del usuario como este id lo da mongo
//vamos a usar una expresion regular para crear nuestro esquema esta expresion regular va ir de 0-9 y de a-f y A-F
//y va tener 24 caracteres
const userIdSchema = joi.string().regex(/^[0-9a-fA-F]{24}$/);



//esquema para definir el usuario que va tener el nombre de tipo string con un maximo de 100 caracteres y vas ser requerido


const userSchema = {
    name: joi
        .string()
        .max(100)
        .required(),
    email: joi
        .string()
        .email()
        .required(),
    password: joi.string().required()
};

const createUserSchema = {
    ...userSchema,
    // name: joi.string().max(100).required(),
    // email: joi.string().email().required(),
    // password: joi.string().required(),
    isAdmin: joi.boolean(),
};

const createProviderUserSchema = {
    ...userSchema,
    apiKeyToken: joi.string().required()
};

module.exports = {
    userIdSchema,
    createUserSchema,
    createProviderUserSchema,
};