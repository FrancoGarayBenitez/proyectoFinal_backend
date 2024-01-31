function deleteProductOfCart(pid) {

    const btnEliminar = document.getElementById(pid)
    btnEliminar.style.display = 'none'

    const spinnerLoader = document.getElementById('spinnerLoader')
    spinnerLoader.style.display = 'inline-block'

    setTimeout(() => {
        spinnerLoader.style.display = 'none'    
    }, 4000)

    fetch(`https://myecommerce-api-6zkf.onrender.com/currentJson`)
    .then(data => data.json())
    .then(user => {
        let usuario = user.payload
        
        fetch(`https://myecommerce-api-6zkf.onrender.com/api/users/${usuario.id}`)
        .then(data => data.json())
        .then(data => {
            let user = data.payload
            let cid = user.cart._id

            fetch(`https://myecommerce-api-6zkf.onrender.com/api/cart/${cid}/${pid}`, {
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

    const totalPrice = document.querySelector('.totalPrice')
    totalPrice.style.display = 'none'

    const btn_vaciar = document.getElementById(cid)
    btn_vaciar.style.display = 'none'

    const spinner = document.getElementById('spinnerVaciar')
    spinner.style.display = 'block'

    setTimeout(() => {
        spinner.style.display = 'none'       
    }, 4000)

    fetch(`https://myecommerce-api-6zkf.onrender.com/api/cart/${cid}`, {
        method: 'DELETE'
    })
    .then(data => data.json())
    .then(data => {
        alert(data.message)
        window.location.reload()
    })
}


function finalizePurchase(cid) {

    const btn_comprar = document.querySelector('.btn-comprar')
    btn_comprar.style.display = 'none'

    const spinnerComprar = document.getElementById('spinnerComprar')
    spinnerComprar.style.display = 'block'

    setTimeout(() => {
        spinnerComprar.style.display = 'none'       
    }, 4000)

    fetch(`https://myecommerce-api-6zkf.onrender.com/api/ticket/${cid}/purchase`, {
        method: 'POST'
    })
    .then(data => data.json())
    .then(data => {
        alert(data.message)
        window.location.reload()
    })
}