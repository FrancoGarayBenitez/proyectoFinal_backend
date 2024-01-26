let formSignUp = document.getElementById('form-signup')

formSignUp.addEventListener('submit', e => {
    e.preventDefault()

    const user = {
        first_name: formSignUp.first_name.value,
        last_name: formSignUp.last_name.value,
        email: formSignUp.email.value,
        age: formSignUp.age.value,
        password: formSignUp.password.value,
        role: formSignUp.role.value
    }

    fetch(`http://localhost:8080/api/sessions/register`, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    })
        .then(data => data.json())
        .then(json => {
            alert(json.message)
            window.location = `http://localhost:8080/api/sessions/`
        })
})
