import { server as _server } from '@hapi/hapi'
import Jwt from '@hapi/jwt'
import config from './utils/config.js'

// users
import users from './api/users/index.js'
import UsersService from './services/UsersService.js'
import UsersValidator from './validator/users/index.js'

// albums
import albums from './api/albums/index.js'
import AlbumsService from './services/AlbumsService.js'
import AlbumValidator from './validator/albums/index.js'

// songs
import songs from './api/songs/index.js'
import SongsService from './services/SongsService.js'
import SongValidator from './validator/songs/index.js'

// authentications
import authentications from './api/authentications/index.js'
import AuthenticationsService from './services/AuthenticationsService.js'
import TokenManager from './tokenize/TokenManager.js'
import AuthenticationsValidator from './validator/authentications/index.js'

// playlists
import playlists from './api/playlists/index.js'
import PlaylistsService from './services/PlaylistsService.js'
import PlaylistValidator from './validator/playlists/index.js'

// collaborations
import collaborations from './api/collaborations/index.js'
import CollaborationsService from './services/CollaborationsService.js'
import CollaborationsValidator from './validator/collaborations/index.js'

// activities
import activities from './api/activities/index.js'
import ActivitiesService from './services/ActivitiesService.js'

// exports
import _exports from './api/exports/index.js'
import ProducerService from './services/rabbitmq/ProducerService.js'
import ExportsValidator from './validator/exports/index.js'

// error handling
import ClientError from './exceptions/ClientError.js'

// run server immediately
;(async () => {
  const albumsService = new AlbumsService()
  const songsService = new SongsService()
  const usersService = new UsersService()
  const authenticationsService = new AuthenticationsService()
  const playlistsService = new PlaylistsService()
  const collaborationsService = new CollaborationsService()
  const activitiesService = new ActivitiesService()

  const server = new _server({
    host: config.app.host,
    port: config.app.port,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  })

  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt,
    },
  ])

  // mendefinisikan strategy autentikasi jwt
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: config.token.accessKey,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: config.token.age,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  })

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        service: collaborationsService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: activities,
      options: {
        service: activitiesService,
      },
    },
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        validator: ExportsValidator,
      },
    },
  ])

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
