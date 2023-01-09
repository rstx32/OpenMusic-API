/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
const abind = require('abind')
const ClientError = require('../../exceptions/ClientError')

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service
    this._validator = validator
    abind(this)
  }

  // POST Album
  async postAlbumHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload)
      const { name, year } = request.payload
      const albumId = await this._service.addAlbum({ name, year })
      const response = h
        .response({
          status: 'success',
          data: { albumId },
        })
        .code(201)

      return response
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h
          .response({
            status: 'fail',
            message: error.message,
          })
          .code(error.statusCode)

        return response
      }

      const response = h
        .response({
          status: 'error',
          message: 'terjadi kegagalan pada server',
        })
        .code(500)
      console.error(error)
      return response
    }
  }
}

module.exports = AlbumsHandler
