/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const NotFoundError = require('../exceptions/NotFoundError')
const InvariantError = require('../exceptions/InvariantError')

class AlbumsService {
  constructor() {
    this._pool = new Pool()
  }

  // add an album
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

  // get single album by id
  // print all songs that has the album id
  async getAlbumById(id) {
    const query = `SELECT * FROM albums WHERE id='${id}'`
    const query2 = `SELECT id, title, performer FROM songs WHERE album_id='${id}'`
    const result = await this._pool.query(query)
    const result2 = await this._pool.query(query2)

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan')
    }

    result.rows[0].songs = result2.rows

    return result.rows[0]
  }

  // edit an album
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

  // delete an album
  async deleteNoteById(id) {
    const query = `DELETE FROM albums WHERE id='${id}' RETURNING id`
    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus, id tidak ditemukan')
    }
  }
}

module.exports = AlbumsService
