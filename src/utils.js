// -------------------------- //

// Bcrypt
const bcrypt = require('bcrypt');

//Creación del hasheo.
const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

//Comparación del pass del usuario con el pass hasheado.
const isValidatePassword = (user, password) => bcrypt.compareSync(password, user.password);


// -------------------------- //

// Multer
const multer = require('multer')
const path = require('path')

// Los archivos se guardarán en carpetas diferentes según su tipo
const storage = multer.diskStorage({
    destination: function (req, file, cb) { 

        if (file.fieldname === "imagenPerfil") {
            cb(null, path.join(__dirname, "public", "profiles"))
        }

        if (file.fieldname === "imagenProducto") {
            cb(null, path.join(__dirname, "public", "products"))
        }

        if (file.fieldname === "documents") {
            cb(null, path.join(__dirname, "public", "documents"))
        }
        
    },

    filename: function (req, file, cb) {
        cb (null, file.originalname)
    }
})

const uploader = multer({storage: storage})


// -------------------------- //

//  FAKER
const {faker} = require('@faker-js/faker')

const generateProduct = () => {
    return {
        title: faker.commerce.productName(),
        categoria: faker.commerce.productMaterial(),
        precio: faker.commerce.price(),
        stock: faker.number.int(50),
        imagen: 'urlImage'
    }
}



module.exports = {
    createHash,
    isValidatePassword,
    uploader,
    generateProduct
}