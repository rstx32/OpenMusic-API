/* eslint-disable new-cap */
/* eslint-disable semi-style */
/* eslint-disable no-console */

const { config } = require('dotenv')
const Hapi = require('@hapi/hapi')
const albums = require('./api/albums')
const AlbumsService = require('./services/AlbumsService')
const AlbumValidator = require('./validator/albums')
const ClientError = require('./exceptions/ClientError')

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

  // error handling
  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request
    if (response instanceof Error) {
      // penanganan client error secara internal.
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        })
        newResponse.code(response.statusCode)
        return newResponse
      }
      // mempertahankan penanganan client error oleh hapi secara native, seperti 404, etc.
      if (!response.isServer) {
        return h.continue
      }
      // penanganan server error sesuai kebutuhan
      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      })
      newResponse.code(500)
      return newResponse
    }
    // jika bukan error, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return h.continue
  })

  await server.start()
  console.log(`server running at ${server.info.uri}`)
})()
