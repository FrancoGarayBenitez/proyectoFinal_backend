const passport = require('passport');
//Import model
const { userModel } = require('../dao/mongo/models/userModel');
//Import utils.js
const { createHash } = require('../utils');
//Import Roles
const { ROLES } = require('../middlewares/authJwt')
//Import config dotenv
const config = require('./config.dotenv')

const initializePassport = () => {

    //-------------------------------------------------------//
    //Estrategia local para registrarse.
    const local = require('passport-local');
    const LocalStrategy = local.Strategy;
    const { usersServices, cartServices } = require('../repositories/index.repositories')

    passport.use("local", new LocalStrategy({passReqToCallback:true, usernameField: "email" },
        async (req, email, password, done) => {

            const { first_name, last_name, age, role } = req.body

                try {
                //Buscamos usuario en la base
                let user = await usersServices.getUserByEmail(email)

                //Validación si existe el usuario.
                if (user) {
                    return done("El usuario ya existe.", false);
                }

                let newEmptyCart = {
                    owner: email,
                    products_list: []
                }

                let cartResult = await cartServices.createCart(newEmptyCart)

                //Si no existe, se creará uno nuevo con los datos del body.
                const newUser = {
                    first_name,
                    last_name,
                    email,
                    age,
                    password: createHash(password),
                    cart: cartResult._id
                }

                //Validar si se ingresa un rol
                if (role) {
                    if (ROLES.includes(role)) {
                        newUser.role = role
                    } else {
                        return done("Invalid role", false);
                    }
                }

                let result = await usersServices.createUser(newUser)

                //Retorno del resultado.
                return done(null, result);

            } catch (error) {
                return done("Error al obtener el usuario." + error);
            }
    
        }))


    //-------------------------------------------------------//
    //Estrategia para autenticarse con GitHub.
    const GitHubStrategy = require('passport-github2');

    passport.use("github", new GitHubStrategy({
        clientID: config.clientId,
        clientSecret: config.clientSecret,
        callbackURL: "https://myecommerce-api-6zkf.onrender.com/githubcallback"
    },
        async (accessToken, refreshToken, profile, done) => {

            try {
                let user = await usersServices.getUserByEmail(profile._json.email)

                    if (!user) {
                        let newEmptyCart = {
                            owner: profile._json.email,
                            products_list: []
                        }
        
                        let cartResult = await cartServices.createCart(newEmptyCart)

                        let newUser = {
                            name: profile._json.name,
                            email: profile._json.email,
                            cart: cartResult._id
                        }
    
                        let result = await usersServices.createUser(newUser);
    
                        done(null, result)
                        
                    } else {
                        done(null, user)
                    }

            } catch (error) {
                return done(error);
            }
        }
    ));


    //-------------------------------------------------------//
    //Estrategia para logearse con JWT
    const jwt = require('passport-jwt');

        const cookieExtractor = req => {
            let token = null;
    
            if (req && req.cookies) {
                token = req.cookies[config.cookie_name]
            }
            
            return token;
        }
    
        const JWTStrategy = jwt.Strategy;
        const ExtractJWT = jwt.ExtractJwt;
    
        passport.use("jwt", new JWTStrategy({
    
            jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
            secretOrKey: config.secretOrKey
    
        }, async (jwt_payload, done) => {
            try {
                return done(null, jwt_payload)
            } catch (error) {
                return done(error)
            }
        }
        ))


    //-------------------------------------------------------//
    //Serializar y deserializar.
    passport.serializeUser((user, done) => {
        done(null, user._id);
    })

    passport.deserializeUser(async (id, done) => {
        let user = await userModel.findById({ _id: id });
        done(null, user);
    })

}

module.exports = initializePassport;