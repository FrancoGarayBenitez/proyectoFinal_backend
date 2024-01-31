const express = require('express')
const app = express()
const path = require('path')
const config = require('./config/config.dotenv')
const PORT = process.env.PORT || 8080

//Config Handlebars (Original)
const handlebars = require('express-handlebars');
app.engine("handlebars", handlebars.engine())
app.set("views", path.join(`${__dirname}/views`))
app.set("view engine", "handlebars")

// Middleware archivos estáticos
app.use(express.static(path.join(`${__dirname}/public`)))

//Persistir información de sesiones en una db.
const session = require('express-session')
const MongoDBStore = require('connect-mongo');
app.use(session({
    store: MongoDBStore.create({
        mongoUrl: config.mongo_url,
        collection: 'sessions'
    }),
    maxAge: 1000 * 60 * 60 * 7,
    secret: config.secretOrKey,
    resave: false,
    saveUninitialize: false
}))

//Middleware passport
const passport = require('passport');
const initializePassport = require('./config/passport.config');
initializePassport();
app.use(passport.initialize())
app.use(passport.session());

//Middleware cookie-parser
const cookieParser = require('cookie-parser');
app.use(cookieParser());

//Middleware para analizar el cuerpo de las solicitudes.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Config Nodemailer
const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user:"francogaray2314@gmail.com",
        pass: config.pass_gmail
    }
})

// Config Swagger
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUiExpress = require('swagger-ui-express')

const swaggerOptions = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: "Documentación API ecommerce",
            description: "ecommerce"
        },
    },
    apis: [`${__dirname}/docs/**/*.yaml`]
}
const specs = swaggerJsdoc(swaggerOptions)
app.use('/apidocs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs))


//Rutas
const cartRouter = require('./routes/cart.router')
const ticketRouter = require('./routes/ticket.router')
const productsRouter = require('./routes/products.router')
const sessionsRouter = require('./routes/sessions.router')
const usersRouter = require('./routes/users.router')

// Cors
const cors = require('cors')
app.use(cors())

app.use("/api/cart", cartRouter)
app.use("/api/ticket", ticketRouter)
app.use("/api/products", productsRouter)
app.use("/api/sessions", sessionsRouter)
app.use("/api/users", usersRouter)

//Servidor escuchando
app.listen(PORT, () => {
    console.log(`Servidor is running on port ${PORT}`);
})

module.exports = {transporter}