import autoBind from 'auto-bind'

class UsersHandler {
  constructor(service, validator) {
    this._service = service
    this._validator = validator
    autoBind(this)
  }

  async postUserHandler(request, h) {
    this._validator.validateUserPayload(request.payload)

    const { username, password, fullname } = request.payload
    const userId = await this._service.addUser({
      username,
      password,
      fullname,
    })

    return h
      .response({
        status: 'success',
        message: 'User berhasil ditambahkan',
        data: { userId },
      })
      .code(201)
  }

  async getUserByIdHandler(request, h) {
    const { id } = request.params
    const user = await this._service.getUserById(id)

    return h.response({
      status: 'success',
      data: { user },
    })
  }

  async getUsersByUsernameHandler(request, h) {
    const { username = '' } = request.query
    const users = await this._service.getUsersByUsername(username)
    return {
      status: 'success',
      data: {
        users,
      },
    }
  }
}

export default UsersHandler
