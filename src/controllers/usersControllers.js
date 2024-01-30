const {usersServices} = require('../repositories/index.repositories')
const jwt = require('jsonwebtoken');
const { isValidatePassword, createHash } = require('../utils')
const {getUserDTO} = require('../dao/DTOs/user.dto')

// Obtener lista de usuarios
const getUsers = async (req, res) => {
    try {
        let users_list = await usersServices.getUsers()
        let mappedUsers = []

        users_list.forEach((u) => {
            mappedUsers.push(new getUserDTO(u))
        })

        res.status(200).json({message:"Success", payload:mappedUsers})

    } catch (error) {
        res.status(500).json({message:"Error al obtener lista de usuarios."})
    }
}



// Renderizar vista con lista de usuarios
const renderGetUsersList = async (req, res) => {
    try {
        let users_list = await usersServices.getUsers()
        let mappedUsersList = []

        // Por cada usuario usamos el DTO para obtener solo los datos necesarios y no exponer
        // los datos sensibles como la password.
        users_list.forEach(element => {
            if (element._id.equals(req.session.user._id)) {
                
            } else {
                mappedUsersList.push(new getUserDTO(element))
            }
        });

        res.render('admin.handlebars', {data: mappedUsersList, session: req.session.user.full_name})
        
    } catch (error) {
        res.status(500).json({message:"Error al renderizar vista con lista de usuarios."})
    }
}

// Obtener usuario por ID
const userById = async (req, res) => {
    try {
        let {uid} = req.params
        let user = await usersServices.getUserById(uid)
        if (!user) return res.send({ message: "Usuario no registrado" })

        // Uso del DTO para obtener solo los datos necesarios del usuario
        let mappedUser = new getUserDTO(user)

        res.status(200).json({message:"Success", payload:mappedUser})

    } catch (error) {
        res.status(404).json("Error al obtener usuario.")
    }
}

// Eliminar usuario por Id
const deleteById = async (req, res) => {
    try {
        let {uid} = req.params
        let user = await usersServices.getUserById(uid)
        if (!user) return res.send({ message: "Usuario no registrado" })

        let result = await usersServices.deleteById(uid)

        res.status(200).json({message:"Usuario eliminado", payload:result})
    } catch (error) {
        res.status(500).json("Error al eliminar usuario por su Id.")
    }
}

// Eliminar usuario por inactividad
const deleteUserForInactivity = async (req, res) => {
    try {
        let users_list = await usersServices.getUsers()
        let deletedUsers = 0

        users_list.forEach(async element => {
            if (element.last_connection) {

                // Última conexión en milisegundos
                let fecha1 = Date.parse(element.last_connection)

                // Fecha actual en milisegundos
                let fecha2 = new Date().getTime()

                // Diferencia en milisegundos
                let diff = fecha2 - fecha1 
                
                // Días de diferencia
                let days = diff / (1000 * 60 * 60 * 24)

                // Si la diferencia es mayor a dos días la cuenta del usuario de eliminará
                if (days < 2) {
                    deletedUsers ++
                    await usersServices.deleteById(element._id)
                    console.log("Usuario eliminado.");  

                    const {transporter} = require('../app')

                    const mailOptions = {
                        from: 'Coder Tests <francogaray2314@gmail.com>',
                        to: element.email,
                        subject: "Eliminación de cuenta",
                        html: `
                        <div>
                        <p>Por motivos de inactividad (Más de dos días inactivo) su cuenta ha sido eliminada. Regístrese de nuevo para
                        seguir utilizando nuestros servicios.
                        </p>
                        </div>
                        `
                    }

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log("Correo enviado", info.response);
                        }
                    })

                }
            }
        })

        res.status(200).json({message: "Success" , payload: `Usuarios eliminados: ${deletedUsers}`})

    } catch (error) {
        res.status(500).json("Error al eliminar usuario por inactividad.")
    }
}


// Eliminar todos los usuarios
const deleteAllUsers = async (req, res) => {
    try {
        let result = await usersServices.deleteAllUsers()
        res.status(200).json({message:"Success", payload:result})
    } catch (error) {
        res.status(500).json("Error al eliminar usuarios.")
    }
}

//--------------------------------------------------------------------//

// Subir archivos
const subirArchivos = async (req, res) => {
    try {
        let {uid} = req.params
        let user = await usersServices.getUserById(uid)
        if (!user) return res.send({ message: "Usuario no registrado" })
        if (!req.files) return res.send({ message: "Archivos no encontrados."})

        // Pushear documentos al usuario
        user.documents.push({
            name: req.files['imagenPerfil'][0].originalname,
            reference: req.files['imagenPerfil'][0].path,
            status: "Ok"
        }, {
            name: req.files['imagenProducto'][0].originalname,
            reference: req.files['imagenProducto'][0].path,
            status: "Ok"
        })

        for (let i = 0; i < req.files['documents'].length; i ++) {
            let document = {
                name: req.files['documents'][i].originalname,
                reference: req.files['documents'][i].path,
                status: "Ok"
            }
            user.documents.push(document)
        }

        // Actualizar usuario con sus documentos
        if (user.documents.length === 5) user.role = "premium"
        await usersServices.updateUser(uid, user)

        res.status(200).json({message:"Archivos subidos correctamente. Su nivel de usuario se actualizó a premium."})   

    } catch (error) {
        res.status(400).json({message: "Error al subir archivos"})   
    }
}

//--------------------------------------------------------------------//

// Renderizar vista para subir documentación y actualizar a premium
const renderDocumentsPremium = async (req, res) => {
    try {
        res.render('documents.handlebars')
    } catch (error) {
        res.status(500).json({message: "Error al renderizar vista de documentos."})
    }
}

// Cambiar de rol
const changeRole = async (req, res) => {
    try {
        let {uid} = req.params
        let user = await usersServices.getUserById(uid)
        if (!user) return res.send({ message: "Usuario no registrado" })

        // Role user ? Se verifica que tenga los documentos cargados, de ser así, su role se actualiza a premium.
        // Role premium ? Se actualiza a role user
        if (user.role === "user") {

            if (user.documents.length === 5) {
                user.role = "premium"
            } else {
                return res.status(400).json({message: "No ha terminado de procesar su documentación."})
            }

        } else {
            user.role = "user"
        } 

        //Actualizamos usuario en la base con su nuevo role.
        await usersServices.updateUser(user._id, user)

        res.status(200).json({message: "Role cambiado exitosamente."})

    } catch (error) {
        res.status(400).json({message: "Error al cambiar de role."})
    }
}


// Cambiar de rol por autoización del admin
const autorizedChangeRole = async (req, res) => {
    try {
        let {uid, option} = req.body

        let user = await usersServices.getUserById(uid)
        if (!user) return res.send({ message: "Usuario no registrado" })

        user.role = option
        await usersServices.updateUser(uid, user)
        res.json("Cambio de rol exitoso")

    } catch (error) {
        res.status(400).json({message: "Error al autorizar cambio de role."})
    }
}


module.exports = {
    getUsers,
    renderGetUsersList,
    userById,
    deleteById,
    deleteUserForInactivity,
    deleteAllUsers,
    changeRole,
    renderDocumentsPremium,
    subirArchivos,
    autorizedChangeRole
}