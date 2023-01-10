/* eslint-disable object-curly-newline */
/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
const abind = require('abind')

class SongsHandler {
  constructor(service, validator) {
    this._service = service
    this._validator = validator
    abind(this)
  }

  // POST Album
  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload)
    const {
      title,
      year,
      performer,
      genre,
      duration = 'null',
      albumId = 'null',
    } = request.payload
    const songId = await this._service.addSong({
      title,
      year,
      performer,
      genre,
      duration,
      albumId,
    })
    return h
      .response({
        status: 'success',
        data: { songId },
      })
      .code(201)
  }

  // GET All Songs
  async getSongsHandler(request, h) {
    const songs = await this._service.getSongs()
    return h
      .response({
        status: 'success',
        data: {
          songs,
        },
      })
      .code(200)
  }
}

module.exports = SongsHandler
