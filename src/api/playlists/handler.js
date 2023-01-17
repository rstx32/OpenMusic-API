import autoBind from 'auto-bind'
import NotFoundError from '../../exceptions/NotFoundError.js'

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service
    this._validator = validator
    autoBind(this)
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload)

    const { name } = request.payload
    const { id: credentialId } = request.auth.credentials
    const playlistId = await this._service.addPlaylist({
      name,
      owner: credentialId,
    })

    return h
      .response({
        status: 'success',
        data: { playlistId },
      })
      .code(201)
  }

  async getPlaylistsHandler(request, h) {
    const { id: credentialId } = request.auth.credentials
    const playlists = await this._service.getPlaylists(credentialId)

    return {
      status: 'success',
      data: {
        playlists,
      },
    }
  }

  async deletePlaylistByIdHandler(request, h) {
    const { id } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._service.verifyPlaylistOwner(id, credentialId)
    await this._service.deletePlaylistById(id)

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    }
  }

  async postPlaylistSongHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload)

    const { id } = request.params
    const { songId } = request.payload
    const { id: credentialId } = request.auth.credentials

    await this._service.verifyPlaylistOwner(id, credentialId)
    await this._service.addPlaylistSong(id, songId)

    return h
      .response({
        status: 'success',
        message: 'Berhasil menambahkan lagu ke dalam playlist',
      })
      .code(201)
  }

  async getPlaylistSongsHandler(request, h) {
    const { id } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._service.verifyPlaylistOwner(id, credentialId)
    const playlist = await this._service.getPlaylistById(id, credentialId)
    const songs = await this._service.getPlaylistSongs(id, credentialId)

    playlist.songs = songs

    return {
      status: 'success',
      data: { playlist },
    }
  }

  async deletePlaylistSongHandler(request, h) {
    const { id } = request.params
    const { id: credentialId } = request.auth.credentials
    const { songId } = request.payload
    
    await this._service.verifyPlaylistOwner(id, credentialId)

    try {
      await this._service.deletePlaylistSongById(id, songId)

      return {
        status: 'success',
        message: 'Lagu berhasil dihapus dari playlist',
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        return h
          .response({
            status: 'fail',
            message: 'Lagu gagal dihapus dari playlist, lagu tidak ditemukan',
          })
          .code(400)
      }
    }
  }
}

export default PlaylistsHandler
