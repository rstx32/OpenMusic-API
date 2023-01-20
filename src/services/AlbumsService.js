/* eslint-disable no-underscore-dangle */
import { nanoid } from 'nanoid'
import fs from 'fs'
import pg from 'pg'
const { Pool } = pg
import NotFoundError from '../exceptions/NotFoundError.js'
import InvariantError from '../exceptions/InvariantError.js'

class AlbumsService {
  constructor(folder) {
    this._pool = new Pool()
    this._folder = folder

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

    // if album has songs
    if (!result2.rowCount) {
      result.rows[0].songs = result2.rows
    }

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
        'Sampul album gagal ditambahkan, id tidak ditemukan'
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
}

export default AlbumsService
