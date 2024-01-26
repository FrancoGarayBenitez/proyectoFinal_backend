const {createUserDTO} = require('../dao/DTOs/user.dto')

class UserRepository {
    constructor(dao) {
        this.dao = dao
    }

    getUsers = async () => {
        let result = await this.dao.get()
        return result
    }

    getUserById = async (uid) => {
        let result = await this.dao.getById(uid)
        return result
    }

    getUserByEmail = async (email) => {
        let result = await this.dao.getByEmail(email)
        return result
    }

    updateUser = async (uid, user) => {
        let result = await this.dao.update(uid, user)
        return result
    }

    createUser = async (user) => {
        let userToInsert = new createUserDTO(user)
        let result = await this.dao.create(userToInsert)
        return result
    }

    deleteById = async (uid) => {
        let result = await this.dao.deleteById(uid)
        return result
    }

    deleteAllUsers = async () => {
        let result = await this.dao.delete()
        return result
    }

}

module.exports = UserRepository