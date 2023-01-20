import autoBind from 'auto-bind'

class CollaborationsHandler {
  constructor(service, validator) {
    this._service = service
    this._validator = validator
    autoBind(this)
  }

  async postCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload)

    const { playlistId, userId } = request.payload
    const { id: credentialId } = request.auth.credentials

    await this._service.checkExistingUser(userId)
    await this._service.checkExistingPlaylist(playlistId, credentialId)

    const collaborationId = await this._service.addCollaborations(
      playlistId,
      userId,
    )

    return h
      .response({
        status: 'success',
        data: {
          collaborationId,
        },
      })
      .code(201)
  }

  async deleteCollaborationHandler(request, h) {
    const { playlistId, userId } = request.payload
    const { id: credentialId } = request.auth.credentials

    await this._service.deleteCollaborations(playlistId, userId, credentialId)

    return {
      status: 'success',
      message: 'Kolaborator berhasil dihapus',
    }
  }
}

export default CollaborationsHandler
