import ExportsHandler from './handler.js'
import routes from './routes.js'

export default {
  name: 'exports',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const exportsHandler = new ExportsHandler(service, validator)
    server.route(routes(exportsHandler))
  },
}
