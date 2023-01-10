/* eslint-disable no-underscore-dangle */
/* eslint-disable object-curly-newline */
const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const NotFoundError = require('../exceptions/NotFoundError')
const InvariantError = require('../exceptions/InvariantError')

class SongsService {
  constructor() {
    this._pool = new Pool()
  }

  async addSong({ title, year, performer, genre, duration, albumId }) {
    const id = `song-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO songs VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId],
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getSongs() {
    const query = 'SELECT id, title, performer FROM songs'
    const result = await this._pool.query(query)

    return result.rows
  }
}

module.exports = SongsService
