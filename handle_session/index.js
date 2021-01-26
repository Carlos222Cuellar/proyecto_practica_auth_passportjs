const express = require('express'); //requerimos de express
const session = require('express-session'); //requerimos de express session para manejar nuestras sesiones

const app = express(); //defino mi nueva aplicacion mediante el uso de express

//definir el manejo de la sesion
app.use(session({
    resave: false, //no guarda la cookie cada vez que hay un cambio
    saveUninitialized: false, //Si la cookie no se ha iniciado que no me la guarde por defecto
    secret: "giothcode's secret" //se definie un secret este debe de ser por lo menos de 256 bit que va ser el que se use para encriptar nuestra cookie
}))

//vamos a manejar nuestras rutas con express el primer parametro es la ruta y de segundo recibe un callback que recibe la respuesta y la peticion
app.get('/', (req, res) => {
    req.session.count = req.session.count ? req.session.count + 1 : 1; //el req.session.count tiene que ser igual a el solo si es el mismo mas uno de lo contrario sera 1
    res.status(200).json({ hello: 'world', counter: req.session.count }) //vamos a dar la respuesta con codigo 200 y le mandamos el json con hello word y en el counter accedemos a la sesion
})

//vamos a escuchar en el puerto 3000 con app.listen que recibe como primer parametro el puerto y como segundo parametro le podemos pasar un callback que nos imprima el puerto en que esta corriendo para saber que todo salio bien
app.listen(3000, () => {
    console.log('Listening http://localhost:3000')
})