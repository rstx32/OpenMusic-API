/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
import autoBind from 'auto-bind'

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service
    this._validator = validator
    autoBind(this)
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload)
    const { name, year } = request.payload
    const albumId = await this._service.addAlbum({ name, year })
    return h
      .response({
        status: 'success',
        data: { albumId },
      })
      .code(201)
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params
    const album = await this._service.getAlbumById(id)

    return h
      .response({
        status: 'success',
        data: {
          album,
        },
      })
      .code(200)
  }

  async putAlbumByIdHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload)
    const { id } = request.params
    const { name, year } = request.payload
    const album = await this._service.editAlbum(id, { name, year })

    return h
      .response({
        status: 'success',
        message: 'berhasil mengedit album',
        data: { album },
      })
      .code(200)
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params
    await this._service.deleteNoteById(id)

    return h
      .response({
        status: 'success',
        message: 'berhasil menghapus album',
      })
      .code(200)
  }
}

export default AlbumsHandler
