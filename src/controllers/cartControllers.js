const {cartServices, productsServices, usersServices } = require('../repositories/index.repositories')
const ticketsControllers = require("./ticketsControllers")

//Crear carrito
const createCart = async (req, res) => {
    try {
        let result = await cartServices.createCart([])
        res.status(200).json({ message: "Success", payload: result })

    } catch (error) {
        res.status(500).json({ status: "Error", error: "Algo salió mal al crear el carrito." })
    }
}


//Obtener carrito
const getCart = async (req, res) => {
    let result = await cartServices.getCart()

    if (!result) return res.status(500).send({status:"Error", error: "Algo salió mal al obtener carrito."})

    res.send({status:"Success", result:result})
}

//Obtener carrito por id
const getCartById = async (req,res) => {
    try {
        let { cid } = req.params;

        let result = await cartServices.getCartById(cid)

        res.send({ result: "Success", payload: result });

    } catch (error) {
        res.send({ status: error, error: "Error al obtener un carrito por su ID." });
    }
}


//Agregar producto al carrito
const addProduct = async (req, res) => {
    
    //Buscar carrito
    let { cid } = req.params
    let cart = await cartServices.getCartById(cid)
    if (!cart) {
        res.status(404).json({ error: `El carrito con el id proporcionado no existe` })
    }

    //Buscar producto
    const { productsServices } = require("../repositories/index.repositories")
    let { pid } = req.params
    let product = await productsServices.getProductById(pid)
    if (!product) {
        res.status(404).json({ error: `El producto con el id proporcionado no existe` })
    }

    //Cantidad
    let { quantity } = req.body;

    // // Validar stock del producto
    if (product.stock >= quantity) {

        // Reducción del stock
        product.stock = product.stock - quantity

        // Actualizar el stock del producto en la base
        await productsServices.updateProduct(pid, product)

        //Validamos la existencia del producto en el carrito
        const foundProductInCart = cart.products_list.find((p) => {
            if (p.product._id.equals(pid)) return p
        })

        //Si existe le actualizamos la cantidad enviada por body o sino se le agrega uno.
        //Si no existe pusheamos el nuevo producto con la cantidad enviada por body.
        const indexProduct = cart.products_list.findIndex((p) => p.product._id.equals(pid))
        if (foundProductInCart) {
            cart.products_list[indexProduct].quantity += quantity || 1;
        } else {
            cart.products_list.push({ product: pid, quantity: quantity });
        }

        //Actualizar carrito
        await cartServices.updateCart(cart._id, cart)

        //Buscar cart nuevamente para el populate
        cart = await cartServices.getCartById(cid)

        res.status(200).json({ message: "Producto agregado al carrito", result: cart })

    } else {
        res.status(500).json({ message: "Stock insuficiente" })
    }

}


//Eliminar productos del carrito
const deleteOneProduct = async (req, res) => {
    try {
        //Buscar carrito
        let { cid } = req.params
        let cart = await cartServices.getCartById(cid)
        if (!cart) {
            res.status(404).json({ error: `El carrito con el id proporcionado no existe` })
        }
    
        //Buscar producto
        let { pid } = req.params
        let product = await productsServices.getProductById(pid)
        if (!product) {
            res.status(404).json({ error: `El producto con el id proporcionado no existe` })
        }
    
        //Validar la existencia del producto en el carrito
        const foundProductInCart = cart.products_list.find((p) => {
            if (p.product._id.equals(pid)) return p
        })
        if(!foundProductInCart){
            res.status(404).json({ error: `El producto no existe en el carrito.` })
        }
    
        //Filtrando array para eliminar el producto indicado
        cart.products_list = cart.products_list.filter(p => !p.product._id.equals(pid))
    
        //Actualizar carrito
        await cartServices.updateCart(cart._id, cart)
    
        //Buscar cart nuevamente para el populate
        cart = await cartServices.getCartById(cid)
    
        res.status(200).json({message:"Producto eliminado del carrito", result:cart})
        
    } catch (error) {
        res.status(404).json({ error: `Error al eliminar un producto.` })
    }
}


//Eliminar todos los productos del carrito
const deleteAllProducts = async (req, res) => {
    try {
        //Buscar carrito
        let { cid } = req.params
        let cart = await cartServices.getCartById(cid)
        if (!cart) {
            res.status(404).json({ error: `El carrito con el id proporcionado no existe` })
        }

        //Vaciar carrito
        cart.products_list = []

        //Actualizamos las modificaciones del carrito.
        let result = await cartServices.updateCart(cart._id, cart)

        res.send({ message: "Carrito vaciado", payload: result });

    } catch (error) {
        res.status(404).json({ error: `Error al vaciar el carrito.` })
    }
}

// Eliminar todos los carritos creados
const deleteAllCarts = async (req, res) => {
    try {
        let result = await cartServices.deleteAllCarts()
        res.send({ result: "Success", payload: result });
    } catch (error) {
        res.status(500).json({ error: `Error al eliminar los carritos.` })
    }
} 


// Render view cart
const renderViewCart = async (req, res) => {
    try {
        let user = await usersServices.getUserById(req.session.user._id)
        let cart = await cartServices.getCartById(user.cart._id)

        //Suma del precio total
        let sum = cart.products_list.reduce((acc, prev) => {
            acc += prev.product.precio * prev.quantity
            return acc
        }, 0)

        res.render('cart', {cart, sum})
    } catch (error) {
        res.status(500).json({ error: `Error al renderizar la vista de cart.` })
    }
}


module.exports = {
    createCart,
    getCart,
    getCartById,
    addProduct,
    deleteOneProduct,
    deleteAllProducts,
    deleteAllCarts,
    renderViewCart
}