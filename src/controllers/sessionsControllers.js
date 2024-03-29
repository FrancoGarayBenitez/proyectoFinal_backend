const {usersServices, productsServices} = require('../repositories/index.repositories')
const jwt = require('jsonwebtoken');
const { isValidatePassword, createHash } = require('../utils')
const config = require('../config/config.dotenv')

//Renderizar vista de registro
const renderViewRegister = (req, res) => {
    try {
        res.render("register.handlebars")
    } catch (error) {
        res.status(500).send("Error de presentación.")
    }
}

//Renderizar vista de login
const renderViewLogin = (req, res) => {
    try {
        res.render("login.handlebars")
    } catch (error) {
        res.status(500).send("Error de presentación.")
    }
}

//--------------------------------------------------------------------//

//Registrar usuario (Estrategia local)
const registerUser = (req, res) => {
    try {
        console.log("Usuario registrado correctamente.");
        res.status(200).json({message:"Usuario registrado correctamente", payload: req.user})

    } catch (error) {
        res.status(500).send("Error de registro.")
    }
}

//Ruta por si no se logra hacer el passport register.
const failRegister = (req, res) => {
    console.log("Failed strategy");
    res.send({ error: "Failed" })
}

//--------------------------------------------------------------------//

//Autenticación con JWT
const authenticateWithJwt = async (req, res) => {
    try {
        let { email, password } = req.body

        //Buscar usuario en la base.
        let user = await usersServices.getUserByEmail(email)
        if (!user) return res.send({ message: "Usuario no registrado" })

        //Comparación del pass del usuario con el pass hasheado.
        if (!isValidatePassword(user, password)) return res.send({ message: "Contraseña incorrecta." });

        let token = jwt.sign({id: user._id}, "coderSecret", { expiresIn: "24h"})

        //El cliente envía sus credenciales mediante una cookie.
        res.cookie("jwtCookie", token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true
        })

        res.redirect("/current")

    } catch (error) {
        res.status(500).send("Error al logearse.")
    }
}

//Ruta para renderizar vista del usuario.
const currentUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect('/');
        }

        //Buscar usuario en la base.
        let user = await usersServices.getUserById(req.user.id)
        if (!user) return res.send({ message: "Usuario no registrado" })

        req.session.user = {
            _id: user._id,
            full_name: user.full_name,
            age: user.age,
            email: user.email,
            role: user.role,
            last_connection: ''
        }

        // Buscar productos
        let products = await productsServices.getProducts()

        res.render('current.handlebars', { user: req.session.user, products})

    } catch (error) {
        res.status(500).send("Error de presentación.")
    }
}

//Ruta para devolver el actual usuario en JSON.
const currentUserJson = (req, res) => {
    try {
        if (!req.user) {
            return res.redirect('/');
        }

        res.send({payload: req.user})

    } catch (error) {
        res.status(500).send("Error de presentación.")
    }
}

//--------------------------------------------------------------------//

//Autenticación. Estrategia con GitHub.
const authenticateWithGitHub = async (req, res) => {
    req.session.user = req.user;

    let token = jwt.sign({id: req.user._id}, "coderSecret", { expiresIn: "24h"})

    res.cookie("jwtCookie", token, {
        maxAge: 60 * 60 * 1000,
        httpOnly: true
    })

    res.redirect("/current")
}

//--------------------------------------------------------------------//

// Renderizar vista para enviar correo y restablecer password
const renderViewToSendEmail = (req, res) => {
    try {
        res.render('restore.handlebars')
    } catch (error) {
        res.status(500).send("Error de presentación.")   
    }
}

//Renderizar vista para cambiar password.
const renderViewChangePassword = (req, res) => {
    try {
        res.render('restorePass.handlebars')
    } catch (error) {
        res.status(500).send("Error de presentación.")
    }
}


// Enviar correo con enlace de restablecimiento de contraseña
const emailToRestorePassword = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) return res.status(400).send({ status: "error", error: "Valores inexistentes" })

        //Verificar existencia de usuario en db
        let user = await usersServices.getUserByEmail(email)
        if (!user) return res.status(400).send({ status: "error", error: "Usuario no encontrado" })

        const token = jwt.sign({ email }, config.secretOrKey, { expiresIn: '1h'})

        // Enviar un correo con el enlace para restablecer la contraseña
        const {transporter} = require('../app')

        const mailOptions = {
            from: 'Coder Tests <francogaray2314@gmail.com>',
            to: email,
            subject: "Restablecer contraseña",
            html: `
            <div>
            <h1>Restablecer contraseña</h1>
            <p>Ingrese en el siguiente enlace: 
            <a href="https://myecommerce-api-6zkf.onrender.com/restore/${token}">Haga click aquí</a>
            </p>
            </div>
            `
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log("Correo enviado", info.response);
                res.status(200).json({message: "Revise su correo, se le envió un enlace para restablecer su contraseña."})
            }
        })

    } catch (error) {
        res.status(500).send("Error al enviar correo y restablecer contraseña.")
    }
}


// Cambiar Contraseña
const changePassword = async (req, res) => {
    try {
        let { token } = req.params
        if(!token) return res.status(400).send({ status: "error", error: "Token inexistente." })

        let { newPassword } = req.body;
        if (!newPassword) return res.status(400).send({ status: "error", error: "Valores inexistentes" })

        //Verificar existencia de usuario en db
        const { email } = jwt.verify(token, config.secretOrKey)
        let user = await usersServices.getUserByEmail(email)
        if (!user) return res.status(400).send({ status: "error", error: "Usuario no encontrado" })

        // Verificar si son iguales la pass vieja con la nueva
        if (isValidatePassword(user, newPassword)) return res.status(400).json({message:"Las contraseñas son iguales."})

        //Actualizando password con hash
        user.password = createHash(newPassword);

        //Actualizamos usuario en la base con su nuevo password.
        await usersServices.updateUser(user._id, user)

        //Redirigir para logearse.
        console.log("Contraseña cambiada correctamente.");
        res.redirect("/");

    } catch (error) {
        console.log("Token expirado");
        res.redirect('/restore')
    }
}

//--------------------------------------------------------------------//

//Destruir session
const destroySession = async (req, res) => {

    // Actualizar última conexión cada vez vez que el usuario realice el proceso de logout.
    req.session.user.last_connection = new Date()
    await usersServices.updateUser(req.session.user._id, req.session.user)

    req.session.destroy(err => {
        if (!err) {
            res.redirect('/')
        } else {
            res.send("Error al intentar salir.")
        }
    })
}

//--------------------------------------------------------------------//

module.exports = {
    renderViewRegister,
    renderViewLogin,
    registerUser,
    failRegister,
    authenticateWithJwt,
    currentUser,
    currentUserJson,
    authenticateWithGitHub,
    destroySession,
    renderViewToSendEmail,
    renderViewChangePassword,
    emailToRestorePassword,
    changePassword
}