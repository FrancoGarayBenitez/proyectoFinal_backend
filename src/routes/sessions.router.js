const {Router} = require('express')
const router = Router()
const passport = require('passport');
const sessionsControllers = require('../controllers/sessionsControllers')

//Renderizar vista de registro
router.get("/register", sessionsControllers.renderViewRegister)

//Renderizar vista de login
router.get("/", sessionsControllers.renderViewLogin)

//--------------------------------------------------------------------//

//Registrar usuario (Estrategia local)
router.post("/register", passport.authenticate('local', { failureRedirect: "/failRegister" }), sessionsControllers.registerUser)

//Ruta por si no se logra hacer el passport register.
router.get('/failRegister', sessionsControllers.failRegister)

//--------------------------------------------------------------------//

//Autenticación con JWT
router.post("/", sessionsControllers.authenticateWithJwt)

//Ruta para renderizar vista con los datos del usuario.
router.get("/current", passport.authenticate("jwt", { session: false }), sessionsControllers.currentUser)

// Ruta para devolver el actual usuario en JSON
router.get("/currentJson", passport.authenticate("jwt", { session: false }), sessionsControllers.currentUserJson)

//--------------------------------------------------------------------//

//Autenticación. Estrategia con GitHub.
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }), async (req, res) => { })

router.get("/githubcallback", passport.authenticate("github", { failureRedirect: "/" }), sessionsControllers.authenticateWithGitHub)

//--------------------------------------------------------------------//

// Renderizar vista para enviar correo con enlace para restablecer contraseña
router.get('/restore', sessionsControllers.renderViewToSendEmail)

// Restablecer contraseña
router.post('/restore', sessionsControllers.emailToRestorePassword)

//Renderizar vista para cambiar password.
router.get('/restore/:token', sessionsControllers.renderViewChangePassword)

//Cambiar contraseña.
router.post('/restore/:token', sessionsControllers.changePassword)

//--------------------------------------------------------------------//

//Destruir session
router.get("/logout", sessionsControllers.destroySession)

//--------------------------------------------------------------------//


module.exports = router