import { server as _server } from '@hapi/hapi'
import albums from './api/albums/index.js'
import songs from './api/songs/index.js'
import AlbumsService from './services/AlbumsService.js'
import SongsService from './services/SongsService.js'
import AlbumValidator from './validator/albums/index.js'
import SongValidator from './validator/songs/index.js'
import ClientError from './exceptions/ClientError.js'
import { config } from 'dotenv'
config({ path: '.env' })

;(async () => {
  const albumsService = new AlbumsService()
  const songsService = new SongsService()

  const server = new _server({
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
  await server.register({
    plugin: songs,
    options: {
      service: songsService,
      validator: SongValidator,
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
      console.error(response)
      return newResponse
    }
    // jika bukan error, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return h.continue
  })

  await server.start()
  console.log(`server running at ${server.info.uri}`)
})()
