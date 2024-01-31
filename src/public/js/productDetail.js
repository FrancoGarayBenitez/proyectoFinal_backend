let inputQuantity = document.getElementById("inputQuantity")

function sumar(stock) {
    if (parseInt(inputQuantity.value) + 1 <= stock) {
        inputQuantity.value = parseInt(inputQuantity.value) + 1
    } else {
        const parrafo = document.getElementById('stockMaximo')
        parrafo.innerHTML = "Stock máximo disponible"
        parrafo.style.display = "block"
    }
}

function restar(stock) {
    if (inputQuantity.value > 1) {
        inputQuantity.value = parseInt(inputQuantity.value) - 1
        if (inputQuantity.value <= stock) {
            const parrafo = document.getElementById('stockMaximo')
            parrafo.style.display = "none"
        }
    }
    
}


function compra(pid) {

    const spinner = document.getElementById('spinner')
    spinner.style.display = 'block'

    setTimeout(() => {
        spinner.style.display = 'none'        
    }, 4000)
    
    fetch(`https://myecommerce-api-6zkf.onrender.com/api/sessions/currentJson`)
    .then(data => data.json())
    .then(user => {
        let usuario = user.payload
        
        fetch(`https://myecommerce-api-6zkf.onrender.com/api/users/${usuario.id}`)
        .then(data => data.json())
        .then(data => {
            let user = data.payload
            let cid = user.cart._id
            let body = {
                quantity: parseInt(inputQuantity.value)
            }

            fetch(`https://myecommerce-api-6zkf.onrender.com/api/cart/${cid}/${pid}`, {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(body)
            })
            .then(data => data.json())
            .then(data => {
                alert(data.message)
                window.location.reload()
            })

        })
    })
}
