/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
const abind = require('abind')

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service
    this._validator = validator
    abind(this)
  }

  // POST Album
  async postAlbumHandler(request, h) {
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
  }
}

module.exports = AlbumsHandler
