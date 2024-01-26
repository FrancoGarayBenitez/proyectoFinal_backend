const {Router} = require('express')
const router = Router()
const usersControllers = require('../controllers/usersControllers')
const authJwt = require('../middlewares/authJwt')
const multerArchivos = require('../middlewares/multer')

// Obtener lista de usuarios
router.get("/", usersControllers.getUsers)

// Renderizar vista con lista de usuarios (Accesible solo para los admin)
router.get("/usersView", authJwt.verifyToken, authJwt.isAdmin, usersControllers.renderGetUsersList)

// Obtener usuario por ID
router.get("/:uid", usersControllers.userById)

// Eliminar un usuario por inactividad
router.delete("/inactivity", usersControllers.deleteUserForInactivity)

// Subir archivos
router.post("/:uid/documents", multerArchivos, usersControllers.subirArchivos)

// Eliminar un usuario por su Id
router.delete("/:uid", usersControllers.deleteById)

// Cambiar de rol
router.put('/premium/:uid', authJwt.verifyToken, authJwt.isUserOrPremium, usersControllers.changeRole)

// Cambiar de rol por autorización del admin
router.put('/', usersControllers.autorizedChangeRole)

// Eliminar todos los usuarios
router.delete("/delete/allUsers", usersControllers.deleteAllUsers)

//--------------------------------------------------------------------//





module.exports = router