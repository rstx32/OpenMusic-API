/* eslint-disable new-cap */
/* eslint-disable semi-style */
/* eslint-disable no-console */

const { config } = require('dotenv')
const Hapi = require('@hapi/hapi')

config({ path: '.env' })
;(async () => {
  const server = new Hapi.server({
    host: process.env.HOST,
    port: process.env.PORT,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  })

  await server.start()
  console.log(`server running at ${server.info.uri}`)
})()
