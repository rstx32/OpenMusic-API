import amqp from 'amqplib'
import pg from 'pg'
import NotFoundError from '../../exceptions/NotFoundError.js'
import AuthorizationError from '../../exceptions/AuthorizationError.js'
import config from '../../utils/config.js'

const { Pool } = pg

const ProducerService = {
  sendMessage: async (queue, message) => {
    const connection = await amqp.connect(config.rabbitMq.server)
    const channel = await connection.createChannel()

    await channel.assertQueue(queue, {
      durable: true,
    })

    channel.sendToQueue(queue, Buffer.from(message))

    setTimeout(() => {
      connection.close()
    }, 1000)
  },

  verifyPlaylistOwner: async (owner, id) => {
    const query = 'SELECT * FROM playlists'
    const result = await new Pool().query(query)

    if (result.rows[0].id !== id) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('Anda tidak dapat mengakses playlist ini')
    }
  },
}

export default ProducerService
