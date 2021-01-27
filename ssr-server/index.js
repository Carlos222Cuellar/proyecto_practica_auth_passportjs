const express = require("express"); //nuestra app correra con express
const passport = require("passport"); //manejar nuestras autorizaciones y autentificaciones
const session = require("express-session");
const boom = require("@hapi/boom"); //manejar los errores
const cookieParser = require("cookie-parser");
const axios = require("axios");

const { config } = require("./config");

const app = express();

// body parser para que por ejemploc uando creemos una pelicula-usuario podamos leer del cuerpo el json con la informacion que queremos
app.use(express.json());
app.use(cookieParser()); //agregando el middleware de cookieParser
app.use(session({ secret: config.sessionSecret }));
app.use(passport.initialize());
app.use(passport.session());

//  Basic strategy
require("./utils/auth/strategies/basic");

// OAuth strategy
require("./utils/auth/strategies/oauth");

// Twitter strategy
require("./utils/auth/strategies/twitter");

app.post("/auth/sign-in", async function(req, res, next) {
    passport.authenticate("basic", function(error, data) { //sutom callback
        //try catch para manejar nuestros errores
        try {
            if (error || !data) {
                next(boom.unauthorized());
            }

            req.login(data, { session: false }, async function(error) { //Sesion false porque no se maneja estado en estea app
                if (error) {
                    next(error);
                }

                const { token, ...user } = data;

                //vamos a definir nuestra cookie
                res.cookie("token", token, { //la cookie se va llamar token y va recibir un token
                    httpOnly: !config.dev, //solo cuando estamos en modo produccion
                    secure: !config.dev //debe de ser seguro debe de correr por https
                });

                //respondemos con estatus 200 y en el json mandamos el user
                res.status(200).json(user);
            });
        } catch (error) { //Capturamos el error
            next(error); //le demos next para que pasa al siguiente middleware
        }
    })(req, res, next);
});

//muy similar a la parte de arriba
app.post("/auth/sign-up", async function(req, res, next) {
    const { body: user } = req; //obtenemos el user del body del request

    //manejar errores
    try {
        await axios({
            url: `${config.apiUrl}/api/auth/sign-up`,
            method: "post",
            data: user
        });

        //Verificamos si esta todo correcto y devolvemos usuario creado
        res.status(201).json({ message: "user created" });
    } catch (error) {
        next(error); //Capturamos el error y lo devolvemos en el callback
    }
});

app.get("/movies", async function(req, res, next) {});

app.post("/user-movies", async function(req, res, next) {
    try {
        const { body: userMovie } = req;
        const { token } = req.cookies;

        const { data, status } = await axios({
            url: `${config.apiUrl}/api/user-movies`,
            headers: { Authorization: `Bearer ${token}` },
            method: "post",
            data: userMovie
        });

        if (status !== 201) {
            return next(boom.badImplementation());
        }

        res.status(201).json(data);
    } catch (error) {
        next(error);
    }
});

app.delete("/user-movies/:userMovieId", async function(req, res, next) {
    try {
        const { userMovieId } = req.params;
        const { token } = req.cookies;

        const { data, status } = await axios({
            url: `${config.apiUrl}/api/user-movies/${userMovieId}`,
            headers: { Authorization: `Bearer ${token}` },
            method: "delete"
        });

        if (status !== 200) {
            return next(boom.badImplementation());
        }

        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
});

app.get(
    "/auth/google-oauth",
    passport.authenticate("google-oauth", {
        scope: ["email", "profile", "openid"]
    })
);

app.get(
    "/auth/google-oauth/callback",
    passport.authenticate("google-oauth", { session: false }),
    function(req, res, next) {
        if (!req.user) {
            next(boom.unauthorized());
        }

        const { token, ...user } = req.user;

        res.cookie("token", token, {
            httpOnly: !config.dev,
            secure: !config.dev
        });

        res.status(200).json(user);
    }
);

app.get("/auth/twitter", passport.authenticate("twitter"));

app.get(
    "/auth/twitter/callback",
    passport.authenticate("twitter", { session: false }),
    function(req, res, next) {
        if (!req.user) {
            next(boom.unauthorized());
        }

        const { token, ...user } = req.user;

        res.cookie("token", token, {
            httpOnly: !config.dev,
            secure: !config.dev
        });

        res.status(200).json(user);
    }
);

//correremos nuesta app en el puerto que configuramos en nuestras variables de entorno
app.listen(config.port, function() {
    console.log(`Listening http://localhost:${config.port}`);
});