function eliminarUsuario(uid) {
    fetch(`http://localhost:8080/api/users/${uid}`, {
            method: 'DELETE'
    })
    .then(result => result.json())
    .then(json => {
            alert('Usuario eliminado')
            window.location.reload()
    })
}


function cambiarRole(uid) {
    const option = document.getElementById(uid)

    let optionSelected = {
            uid,
            option: option.value
    }

    fetch(`http://localhost:8080/api/users`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(optionSelected)
    })
    .then(result => result.json())
    .then(json => {
            alert(json)
            window.location.reload()
    })
}