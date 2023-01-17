import PlaylistHandler from './handler.js'
import routes from './routes.js'

export default {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const playlistHandler = new PlaylistHandler(service, validator)
    server.route(routes(playlistHandler))
  },
}