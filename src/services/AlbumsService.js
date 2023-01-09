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
    const createdAt = new Date().toISOString()
    const updatedAt = createdAt

    const query = {
      text: 'INSERT INTO albums VALUES ($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, year, createdAt, updatedAt],
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
    const updatedAt = new Date().toISOString()
    const query = {
      text: 'UPDATE albums SET name=$1, year=$2, updated_at=$3 WHERE id=$4 RETURNING *',
      values: [name, year, updatedAt, id],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal ditambahkan, id tidak ditemukan')
    }

    return result.rows[0]
  }
}

module.exports = AlbumsService
