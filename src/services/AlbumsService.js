/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const NotFoundError = require('../exceptions/NotFoundError')
const InvariantError = require('../exceptions/InvariantError')

class AlbumsService {
  constructor() {
    this._pool = new Pool()
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(15)}`

    const query = {
      text: 'INSERT INTO albums VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, year],
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getAlbumById(id) {
    const query = `SELECT * FROM albums WHERE id='${id}'`
    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan')
    }

    return result.rows[0]
  }

  async editAlbum(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name=$1, year=$2 WHERE id=$3 RETURNING *',
      values: [name, year, id],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal diubah, id tidak ditemukan')
    }

    return result.rows[0]
  }

  async deleteNoteById(id) {
    const query = `DELETE FROM albums WHERE id='${id}' RETURNING id`
    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus, id tidak ditemukan')
    }
  }
}

module.exports = AlbumsService
