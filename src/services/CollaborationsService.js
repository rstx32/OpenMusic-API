import { nanoid } from 'nanoid'
import pg from 'pg'
import AuthorizationError from '../exceptions/AuthorizationError.js'
import InvariantError from '../exceptions/InvariantError.js'
import NotFoundError from '../exceptions/NotFoundError.js'
const { Pool } = pg

class CollaborationsService {
  constructor(collaborationsService) {
    this._pool = new Pool()
    this._collaborationsService = collaborationsService
  }

  async addCollaborations(playlistId, userId) {
    const id = `collab-${nanoid(16)}`
    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Kolaborator gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async deleteCollaborations(playlistId, userId, owner) {
    let query
    let result

    // check if user is NOT the owner of collaborations
    query = `SELECT * FROM playlists WHERE owner='${owner}'`
    result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new AuthorizationError('Anda tidak dapat menghapus kolaborator')
    }

    // if user is the owner of collaborations
    query = {
      text: 'DELETE FROM collaborations WHERE playlist_id=$1 AND user_id=$2 RETURNING id',
      values: [playlistId, userId],
    }
    result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new InvariantError('Kolaborator gagal dihapus')
    }
  }

  async checkExistingUser(id) {
    const isUserExist = await this._pool.query(
      `SELECT * FROM users WHERE id='${id}'`
    )
    if (!isUserExist.rowCount) {
      throw new NotFoundError('User tidak ditemukan')
    }
  }

  async checkExistingPlaylist(id, owner) {
    const playlist = await this._pool.query(
      `SELECT * FROM playlists WHERE id='${id}'`
    )

    if (!playlist.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }

    if (playlist.rows[0].owner !== owner) {
      throw new AuthorizationError('Anda tidak dapat mengakses playlist ini')
    }
  }
}

export default CollaborationsService
