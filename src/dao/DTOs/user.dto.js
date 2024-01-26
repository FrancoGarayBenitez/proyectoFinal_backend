class createUserDTO {
    constructor(user) {
        this.full_name = user.name? user.name : user.first_name + " " + user.last_name
        this.email = user.email
        this.age = user.age? user.age : 'Indefinido'
        this.password = user.password
        this.role = user.role ? user.role : "user"
        this.phone = user.phone ? user.phone.split("-").join('') : ''
        this.cart = user.cart
    }
}

class getUserDTO {
    constructor (user) {
        this._id = user._id
        this.full_name = user.full_name
        this.email = user.email
        this.role = user.role
        this.cart = user.cart
    }
}

module.exports = {createUserDTO, getUserDTO}