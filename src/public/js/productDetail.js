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
    fetch(`http://localhost:8080/api/sessions/currentJson`)
    .then(data => data.json())
    .then(user => {
        let usuario = user.payload
        
        fetch(`http://localhost:8080/api/users/${usuario.id}`)
        .then(data => data.json())
        .then(data => {
            let user = data.payload
            let cid = user.cart._id
            let body = {
                quantity: parseInt(inputQuantity.value)
            }

            fetch(`http://localhost:8080/api/cart/${cid}/${pid}`, {
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
