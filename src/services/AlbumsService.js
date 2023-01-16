/* eslint-disable no-underscore-dangle */
import { nanoid } from 'nanoid'
import pg from 'pg'
const { Pool } = pg
import NotFoundError from '../exceptions/NotFoundError.js'
import InvariantError from '../exceptions/InvariantError.js'

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
    const query2 = `SELECT id, title, performer FROM songs WHERE album_id='${id}'`
    const result = await this._pool.query(query)
    const result2 = await this._pool.query(query2)

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan')
    }

    result.rows[0].songs = result2.rows

    return result.rows[0]
  }

  async editAlbum(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name=$1, year=$2 WHERE id=$3 RETURNING *',
      values: [name, year, id],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Album gagal diubah, id tidak ditemukan')
    }

    return result.rows[0]
  }

  async deleteNoteById(id) {
    const query = `DELETE FROM albums WHERE id='${id}' RETURNING id`
    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Album gagal dihapus, id tidak ditemukan')
    }
  }
}

export default AlbumsService
