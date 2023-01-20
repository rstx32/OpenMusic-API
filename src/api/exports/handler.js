import autoBind from 'auto-bind'

class ExportsHandler {
  constructor(service, validator) {
    this._service = service
    this._validator = validator
    autoBind(this)
  }

  async postExportPlaylistsHandler(request, h) {
    const { id: credentialId } = request.auth.credentials
    const { playlistId } = request.params

    this._validator.validateExportPlaylistsPayload(request.payload)
    await this._service.verifyPlaylistOwner(credentialId, playlistId)

    const message = {
      userId: credentialId,
      targetEmail: request.payload.targetEmail,
    }

    await this._service.sendMessage('export:playlists', JSON.stringify(message))

    return h
      .response({
        status: 'success',
        message: 'Permintaan Anda dalam antrean',
      })
      .code(201)
  }
}

export default ExportsHandler
