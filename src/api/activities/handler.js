import autoBind from 'auto-bind'

class ActivitiesHandler {
  constructor(service) {
    this._service = service
    autoBind(this)
  }

  async getActivitiesHandler(request, h) {
    const { id } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._service.checkExistingPlaylist(id)
    const activities = await this._service.getActivity(id, credentialId)
    const playlistId = await this._service.getPlaylistId(id)

    return h.response({
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    })
  }
}

export default ActivitiesHandler
