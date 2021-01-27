//vamos a definir nuestra estrategia
const passport = require("passport");
const axios = require("axios");
const boom = require("@hapi/boom"); //para manejar errores
const { OAuth2Strategy } = require("passport-oauth");

const { config } = require("../../../config"); //par usar nuestras variables de entorno

//hacen parte de todo el flujo de authorization de google
const GOOGLE_AUTHORIZATION_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://www.googleapis.com/oauth2/v4/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";


//estrategiad e openAuthorization
const oAuth2Strategy = new OAuth2Strategy({
        authorizationURL: GOOGLE_AUTHORIZATION_URL,
        tokenURL: GOOGLE_TOKEN_URL,
        //estos son los que tenemos en el .env
        clientID: config.googleClientId,
        clientSecret: config.googleClientSecret,
        callbackURL: "/auth/google-oauth/callback"
    },
    //funcion callback
    async function(accessToken, refreshToken, profile, cb) {
        const { data, status } = await axios({ //hacemos un request con axios a nuestra api
            url: `${config.apiUrl}/api/auth/sign-provider`,
            method: "post",
            data: {
                name: profile.name, //nos lo devuelve google pero le tenemos que decir como lo queremos
                email: profile.email,
                password: profile.id,
                apiKeyToken: config.apiKeyToken
            }
        });

        //validando si hay data
        if (!data || status !== 200) {
            return cb(boom.unauthorized(), false); //manejo el error con boom
        }

        return cb(null, data);
    }
);

//aqui le decimos a google como queremos el profile
oAuth2Strategy.userProfile = function(accessToken, done) {
    this._oauth2.get(GOOGLE_USERINFO_URL, accessToken, (err, body) => {
        //si hay error lo capturo
        if (err) {
            return done(err);
        }

        try {
            const { sub, name, email } = JSON.parse(body);

            const profile = {
                id: sub,
                name,
                email
            };

            done(null, profile); //si no hay error mando nulo el error y devuelve el profiles
        } catch (parseError) { //devuelvo el error
            return done(parseError);
        }
    });
};

passport.use("google-oauth", oAuth2Strategy); //passport va usar nuestra autentificacion de tipo google