let formDocuments = document.getElementById('form-documents')

formDocuments.addEventListener('submit', e => {
        e.preventDefault()

        const btnSubirDocumentos = document.getElementById('btn-subirDocumentos')
        btnSubirDocumentos.style.display = 'none'

        const spinnerDocumentos = document.getElementById('spinnerDocumentos')
        spinnerDocumentos.style.display = 'block'

        setTimeout(() => {
                spinnerDocumentos.style.display = 'none'    
        }, 4000)

        fetch(`https://myecommerce-api-6zkf.onrender.com/currentJson`)
        .then(data => data.json())
        .then(data => {
                let usuario = data.payload

                let inputFiles = document.querySelectorAll('input[type="file"]')
                let formData = new FormData()

                for (let file of inputFiles) {
                        if (file.files.length > 1) {
                                for (let document of file.files) {
                                        formData.append(file.name, document)
                                }
                        } else {
                                formData.append(file.name, file.files[0])
                        }
                }

                fetch(`https://myecommerce-api-6zkf.onrender.com/api/users/${usuario.id}/documents`, {
                        method: 'POST',
                        body: formData
                })
                .then(data => data.json())
                .then(data => {
                    alert(data.message)
                    window.location.href = `https://myecommerce-api-6zkf.onrender.com/current`
                })
        })
})