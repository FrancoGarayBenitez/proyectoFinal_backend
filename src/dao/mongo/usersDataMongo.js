const { userModel } = require('./models/userModel');

class UsersMongo {
    constructor() {

    }

    create = async (newUser) => await userModel.create(newUser)

    get = async () => await userModel.find().populate('cart')

    getById = async (uid) => await userModel.findOne({ _id: uid }).populate('cart').lean()

    getByEmail = async (email) => await userModel.findOne({ email: email }).populate('cart').lean()

    update = async (uid, user) => await userModel.updateOne({ _id: uid }, user)

    deleteById = async (uid) => await userModel.deleteOne({ _id: uid})

    delete = async () => await userModel.deleteMany() 

}


module.exports = UsersMongo