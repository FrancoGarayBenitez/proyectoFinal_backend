const {Router} = require('express')
const router = Router()
const authJwt = require('../middlewares/authJwt')
const cartControllers = require('../controllers/cartControllers')

// Renderizar vista del cart
router.get("/renderCart", cartControllers.renderViewCart)

//Crear carrito
router.post("/", cartControllers.createCart)

//Obtener carrito
router.get("/", cartControllers.getCart)

//Obtener carrito por su ID
router.get("/:cid", cartControllers.getCartById)

//Agregar producto al carrito
router.post("/:cid/:pid", authJwt.verifyToken, authJwt.isUser, cartControllers.addProduct)

//Eliminar producto del carrito
router.delete("/:cid/:pid", authJwt.verifyToken, authJwt.isUser, cartControllers.deleteOneProduct)

//Vaciar carrito
router.delete("/:cid", authJwt.verifyToken, authJwt.isUser, cartControllers.deleteAllProducts)

// Eliminar todos los carritos
router.delete("/", cartControllers.deleteAllCarts)


module.exports = router