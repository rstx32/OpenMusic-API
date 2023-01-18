import CollaborationsHandler from './handler.js'
import routes from './routes.js'

export default {
  name: 'collaborations',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const collaborationsHandler = new CollaborationsHandler(service, validator)
    server.route(routes(collaborationsHandler))
  },
}
