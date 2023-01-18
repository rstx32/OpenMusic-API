import ActivitiesHandler from './handler.js'
import routes from './routes.js'

export default {
  name: 'activities',
  version: '1.0.0',
  register: async (server, { service }) => {
    const activitiesHandler = new ActivitiesHandler(service)
    server.route(routes(activitiesHandler))
  },
}
