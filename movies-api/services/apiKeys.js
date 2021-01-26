//apartir de los apikeytoken podamos obtener los scopes que es requerido por el sing-in 
//que es necesario para poder firmar los jsonwebtoken con los scopes correspondientes deacuerdo 
//a los apikeytoken que nosotros enviemos.

const MongoLib = require('../lib/mongo'); //importamos la libreria de mongo


//creamos la clase para manejar nuestras keys
class ApiKeysService {
    constructor() {
        this.collection = 'api-keys'; //creamos la coleccion de nuestras key que ya tenemos definidas en mongo
        this.mongoDB = new MongoLib(); //nueva instancia de la libreria de mongo
    }

    //queremos el apikeytoken por lo que la fucnion recibe el token
    async getApiKey({ token }) {
        const [apiKey] = await this.mongoDB.getAll(this.collection, { token }); //busca en la coleccion el token y si lo encuentra lo devuelve el apikeytoken
        return apiKey;
    }
}

module.exports = ApiKeysService; //lo retornamos