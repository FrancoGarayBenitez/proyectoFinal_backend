const {app} = require('./src/app')
const PORT = process.env.PORT || 8080

//Servidor escuchando
app.listen(PORT, () => {
    console.log(`Servidor is running on port ${PORT}`);
})