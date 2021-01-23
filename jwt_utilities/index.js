const jwt = require('jsonwebtoken'); //importamos la libreria que acabos de instalar para firmar nuestro JWT

const [, , option, secret, nameOrToken] = process.argv;

//preguntamos is esxisten los argumentos
if (!option || !secret || !nameOrToken) {
    console.log('Missing arguments');
}

//la funcion para firmar nuestro JWT

function singToken(payload, secret) {
    return jwt.sign(payload, secret);
}

//la funcion para verificar nuestro token

function verifyToken(token, secret) {
    return jwt.verify(token, secret);
}

if (option == 'sing') {
    console.log(singToken({ sub: nameOrToken }, secret)); //invocamos la funcion y le pasamos el nombre y luego el secret como en la funcion determinamos que nos tiene que devolver el token eso imprimira el console.log
} else if (option == 'verify') {
    console.log(verifyToken(nameOrToken, secret)); //esta funcion va recibir el token que se crea con la otra funcion y el secret y nos va devolver el nombre que habiamos agregado al token por que eso definimos en la funcion de retorno
} else {
    console.log('los unicos valores validos para option son \"sing\" o \"verify\"');
}