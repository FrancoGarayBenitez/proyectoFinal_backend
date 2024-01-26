const { uploader }= require('../utils')

const multerArchivos = uploader.fields([
    {name:'imagenPerfil', maxCount: 1},
    {name:'imagenProducto', maxCount: 1},
    {name:'documents', maxCount:3}
])

module.exports = multerArchivos