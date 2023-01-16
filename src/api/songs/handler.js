/* eslint-disable object-curly-newline */
/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
import autoBind from 'auto-bind'

class SongsHandler {
  constructor(service, validator) {
    this._service = service
    this._validator = validator
    autoBind(this)
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload)
    const {
      title,
      year,
      performer,
      genre,
      duration = null,
      albumId = null,
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

  async getSongsHandler(request, h) {
    const { title, performer } = request.query
    const songs = await this._service.getSongs({ title, performer })
    return h
      .response({
        status: 'success',
        data: {
          songs,
        },
      })
      .code(200)
  }

  async getSongByIdHandler(request, h) {
    const { id } = request.params
    const song = await this._service.getSongById(id)

    return h
      .response({
        status: 'success',
        data: {
          song,
        },
      })
      .code(200)
  }

  async putSongByIdHandler(request, h) {
    this._validator.validateSongPayload(request.payload)
    const { id } = request.params
    const {
      title,
      year,
      performer,
      genre,
      duration = null,
      albumId = null,
    } = request.payload
    const song = await this._service.editSong(id, {
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
        message: 'berhasil mengedit lagu',
        data: { song },
      })
      .code(200)
  }

  async deleteSongByIdHandler(request, h) {
    const { id } = request.params
    await this._service.deleteSong(id)

    return h
      .response({
        status: 'success',
        message: 'berhasil menghapus lagu',
      })
      .code(200)
  }
}

export default SongsHandler
