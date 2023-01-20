/* eslint-disable import/extensions */
/* eslint-disable no-underscore-dangle */
import { nanoid } from 'nanoid'
import fs from 'fs'
import pg from 'pg'
import NotFoundError from '../exceptions/NotFoundError.js'
import InvariantError from '../exceptions/InvariantError.js'

const { Pool } = pg

class AlbumsService {
  constructor(folder, cacheService) {
    this._pool = new Pool()
    this._folder = folder
    this._cacheService = cacheService

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true })
    }
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

    // add songs to album
    result.rows[0].songs = result2.rows

    // check if cover_url is not empty
    // then add URL for file address
    const temp = result.rows[0].cover_url
    if (temp !== null) {
      result.rows[0].cover_url = `http://${process.env.HOST}:${process.env.PORT}/albums/images/${temp}`
    }

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

  async writeFile(file, meta) {
    const filename = +new Date() + meta.filename
    const path = `${this._folder}/${filename}`
    const fileStream = fs.createWriteStream(path)

    return new Promise((resolve, reject) => {
      fileStream.on('error', (error) => reject(error))
      file.pipe(fileStream)
      file.on('end', () => resolve(filename))
    })
  }

  async addCoverAlbum(filename, albumId) {
    const query = {
      text: 'UPDATE albums SET cover_url=$1 WHERE id=$2 RETURNING *',
      values: [filename, albumId],
    }
    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new NotFoundError(
        'Sampul album gagal ditambahkan, id tidak ditemukan',
      )
    }
  }

  async checkExistingImage(albumId) {
    const query = `SELECT cover_url FROM albums WHERE id='${albumId}'`
    const result = await this._pool.query(query)
    const { cover_url: filename } = result.rows[0]
    const imageList = fs.readdirSync(this._folder)

    // if old file exist, then delete
    imageList.forEach((imageList) => {
      if (imageList === filename) {
        fs.unlinkSync(`${this._folder}/${filename}`)
      }
    })
  }

  async actionLike(userId, albumId) {
    let query

    // check if user was like the album
    query = `
      SELECT * FROM user_album_likes
      WHERE user_id='${userId}' AND album_id='${albumId}'
    `
    const result = await this._pool.query(query)

    if (!result.rowCount) {
      const id = `user_album-${nanoid(10)}`
      query = {
        text: 'INSERT INTO user_album_likes values($1, $2, $3) RETURNING id',
        values: [id, userId, albumId],
      }
      await this._pool.query(query)
      await this._cacheService.delete(`album-likes:${albumId}`)

      return 'Berhasil menambah like'
    }

    query = `
      DELETE FROM user_album_likes
      WHERE user_id='${userId}' AND album_id='${albumId}'
    `
    await this._pool.query(query)
    await this._cacheService.delete(`album-likes:${albumId}`)

    return 'Berhasil menghapus like'
  }

  async checkExistingAlbum(albumId) {
    const query = `SELECT * FROM albums WHERE id='${albumId}'`
    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan')
    }
  }

  async getLikesAlbum(albumId) {
    try {
      const result = await this._cacheService.get(`album-likes:${albumId}`)
      const toNumber = parseInt(result)

      return { likes: toNumber, cache: true }
    } catch (error) {
      const query = `
        SELECT COUNT(*)
        FROM user_album_likes
        WHERE album_id='${albumId}'
      `

      const result = await this._pool.query(query)
      const toNumber = parseInt(result.rows[0].count)

      await this._cacheService.set(`album-likes:${albumId}`, toNumber)

      return { likes: toNumber, cache: false }
    }
  }
}

export default AlbumsService
