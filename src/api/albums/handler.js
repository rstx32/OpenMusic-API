/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
import autoBind from 'auto-bind'
import { mapAlbumDBToModel } from '../../utils/index.js'

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
    const result = await this._service.getAlbumById(id)
    const album = mapAlbumDBToModel(result)

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

  async postAlbumCoverHandler(request, h) {
    const { cover } = request.payload
    const { id } = request.params
    this._validator.validateImageHeaders(cover.hapi.headers)

    await this._service.checkExistingImage(id)
    const filename = await this._service.writeFile(cover, cover.hapi)
    await this._service.addCoverAlbum(filename, id)

    return h
      .response({
        status: 'success',
        message: 'Sampul berhasil diunggah'
      })
      .code(201)
  }
}

export default AlbumsHandler
