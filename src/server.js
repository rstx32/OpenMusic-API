/* eslint-disable new-cap */
/* eslint-disable semi-style */
/* eslint-disable no-console */

const { config } = require('dotenv')
const Hapi = require('@hapi/hapi')
const albums = require('./api/albums')
const AlbumsService = require('./services/AlbumsService')
const AlbumValidator = require('./validator/albums')

config({ path: '.env' })
;(async () => {
  const albumsService = new AlbumsService()

  const server = new Hapi.server({
    host: process.env.HOST,
    port: process.env.PORT,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  })

  await server.register({
    plugin: albums,
    options: {
      service: albumsService,
      validator: AlbumValidator,
    },
  })

  await server.start()
  console.log(`server running at ${server.info.uri}`)
})()
