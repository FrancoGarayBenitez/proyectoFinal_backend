function deleteProductOfCart(pid) {
    fetch(`http://localhost:8080/api/sessions/currentJson`)
    .then(data => data.json())
    .then(user => {
        let usuario = user.payload
        
        fetch(`http://localhost:8080/api/users/${usuario.id}`)
        .then(data => data.json())
        .then(data => {
            let user = data.payload
            let cid = user.cart._id

            fetch(`http://localhost:8080/api/cart/${cid}/${pid}`, {
                method: "DELETE",
            })
            .then(data => data.json())
            .then(data => {
                alert(data.message)
                window.location.reload()
            })

        })
    })
}


function deleteAllProductsOfCart(cid) {
    fetch(`http://localhost:8080/api/cart/${cid}`, {
        method: 'DELETE'
    })
    .then(data => data.json())
    .then(data => {
        alert(data.message)
        window.location.reload()
    })
}


function finalizePurchase(cid) {
    fetch(`http://localhost:8080/api/ticket/${cid}/purchase`, {
        method: 'POST'
    })
    .then(data => data.json())
    .then(data => {
        alert(data.message)
        window.location.reload()
    })
}