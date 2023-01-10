/* eslint-disable no-underscore-dangle */
/* eslint-disable object-curly-newline */
const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const NotFoundError = require('../exceptions/NotFoundError')
const InvariantError = require('../exceptions/InvariantError')
const mapDBToModel = require('../utils')

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
      throw new InvariantError('Lagu gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getSongs({ title, performer }) {
    let query = ''
    if (title !== undefined && performer !== undefined) {
      query = `SELECT id, title, performer
               FROM songs
               WHERE (
                LOWER(title) LIKE LOWER('%${title}%')
                AND
                LOWER(performer) LIKE LOWER('%${performer}%')
               )`
    } else if (title !== undefined || performer !== undefined) {
      query = `SELECT id, title, performer
               FROM songs
               WHERE (
                LOWER(title) LIKE LOWER('%${title}%')
                OR
                LOWER(performer) LIKE LOWER('%${performer}%')
               )`
    } else {
      query = 'SELECT id, title, performer FROM songs'
    }
    const result = await this._pool.query(query)

    return result.rows
  }

  async getSongById(id) {
    const query = `SELECT * FROM songs WHERE id='${id}'`
    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan')
    }

    return result.rows.map(mapDBToModel)[0]
  }

  async editSong(id, { title, year, performer, genre, duration, albumId }) {
    const query = {
      text: 'UPDATE songs SET title=$1, year=$2, performer=$3, genre=$4, duration=$5, album_id=$6 WHERE id=$7 RETURNING *',
      values: [title, year, performer, genre, duration, albumId, id],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal diubah, id tidak ditemukan')
    }

    return result.rows.map(mapDBToModel)[0]
  }

  async deleteSong(id) {
    const query = `DELETE FROM songs WHERE id='${id}' RETURNING id`
    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus, id tidak ditemukan')
    }
  }
}

module.exports = SongsService
