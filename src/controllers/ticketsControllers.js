const {ticketServices, usersServices, cartServices} = require('../repositories/index.repositories')


//Obtener tickets
const getTicket = async(req, res) => {
    try {
        let result = await ticketServices.getTicket()
    
        res.send({status:"Success", result:result})
    } catch (error) {
        res.send({ status: error, error: "Error al obtener los tickets." });
    }
}

//Obtener ticket por Id
const getTicketById = async(req, res) => {
    try {
        const {tid} = req.params
    
        let ticket = await ticketServices.getTicketById(tid)
    
        res.send({status:"Success", result:ticket})
    } catch (error) {
        res.send({ status: error, error: "Error al obtener ticket por su ID." });
    }
}

// Crear ticket
const createTicket = async (req, res) => {
    try {
        let {numCelular} = req.body

        let {cid} = req.params
        let resultCart = await cartServices.getCartById(cid)
        if (!resultCart) res.status(404).json({ error: "El cart con el id proporcionado no existe" })

        //Creación de un número de orden al azar
        let ticketNumber = Math.floor(Math.random() * 10000 + 1)
        let fechaActual = new Date()

        //Suma del precio total
        let sum = resultCart.products_list.reduce((acc, prev) => {
            acc += prev.product.precio * prev.quantity
            return acc
        }, 0)

        //Orden final
        let ticket = {
            code: ticketNumber,
            purchase_datetime: fechaActual,
            amount: sum,
            purchaser: resultCart.owner,
            products: resultCart.products_list
        }

        //Creación de la orden en la db
        let ticketResult = await ticketServices.createTicket(ticket)

        // Vaciar cart una vez confirmada la compra
        resultCart.products_list = []
        await cartServices.updateCart(resultCart._id, resultCart)

        // Enviar correo con el resumen de la compra
        const {transporter} = require('../app')

        const mailOptions = {
            from: 'Coder Tests <francogaray2314@gmail.com>',
            to: `${resultCart.owner}`,
            subject: "Mail de prueba",
            html: `
            <div>
                <h1>¡Gracias por su compra!</h1>

                <h2>Resumen: </h2>

                <div>
                <p><strong>Número de orden: </strong> ${ticketResult.code}</p>
                <p><strong>Fecha y hora: </strong> ${ticketResult.purchase_datetime}</p>
                <p><strong>Precio total: </strong> $${ticketResult.amount}</p>
                <p><strong>Email del comprador: </strong> ${ticketResult.purchaser}</p>

                <p><strong>Productos: </strong>
                <ul> 
                ${ticketResult.products.map((p) => `
                <li>${p.product.nombre} - $${p.product.precio} - Cantidad: ${p.quantity}</li>
                `).join('')}
                </ul>

                </div>
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

        // Enviar sms de confirmación
        const twilio = require('twilio')
        const config = require('../config/config.dotenv')
        const client = twilio(config.twilio_account_sid, config.twilio_auth_token)
        
        await client.messages.create({
            body: `¡ Gracias por su compra ! Puede ver el resumen en su correo.
            Número de orden: ${ticketResult.code}`,
            from: config.twilio_sms_number,
            to: `+54${numCelular}`
        })

        res.status(200).json({message:"Gracias por su compra. Revise su correo para ver el resumen.", result: ticketResult})

    } catch (error) {
        res.status(500).json({ message: "Error al crear ticket" });
    }
}


module.exports = {
    getTicket,
    getTicketById,
    createTicket
}


