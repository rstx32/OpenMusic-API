import UsersHandler from './handler.js'
import routes from './routes.js'

export default {
  name: 'users',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const usersHandler = new UsersHandler(service, validator)
    server.route(routes(usersHandler))
  },
}
