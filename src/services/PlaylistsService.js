import { nanoid } from 'nanoid'
import pg from 'pg'
import InvariantError from '../exceptions/InvariantError.js'
import NotFoundError from '../exceptions/NotFoundError.js'
import AuthorizationError from '../exceptions/AuthorizationError.js'
import ClientError from '../exceptions/ClientError.js'
const { Pool } = pg

class PlaylistsService {
  constructor(playlistsService) {
    this._pool = new Pool()
    this._playlistService = playlistsService
  }

  async addPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getPlaylists(owner) {
    let query
    let result

    query = `
      SELECT id, name, owner AS username
      FROM playlists
      WHERE owner='${owner}'
    `
    result = await this._pool.query(query)

    // if collaborator trying to get playlist
    if (result.rowCount === 0) {
      query = `
          SELECT playlists.id, playlists.name, users.username
          FROM collaborations
          LEFT JOIN playlists ON playlists.id = collaborations.playlist_id
          LEFT JOIN users ON users.id = playlists.owner
          WHERE user_id='${owner}'
        `

      result = await this._pool.query(query)
    }

    return result.rows
  }

  async getPlaylistById(id, owner) {
    let query
    let result

    query = `
      SELECT playlists.id, playlists.name, users.username
      FROM playlists
      LEFT JOIN users ON users.id = '${owner}'
      WHERE playlists.id='${id}' AND playlists.owner='${owner}'
    `
    result = await this._pool.query(query)

    // if collaborator trying to get playlist
    if (!result.rowCount) {
      const getOwner = await this.checkCollaboration(id, owner)

      query = `
        SELECT playlists.id, playlists.name, users.username
        FROM playlists
        LEFT JOIN users ON users.id = '${getOwner}'
        WHERE playlists.id='${id}' AND playlists.owner='${getOwner}'
      `

      result = await this._pool.query(query)
    }

    return result.rows[0]
  }

  async deletePlaylistById(id, owner) {
    let query
    let result

    // if user is NOT the owner (collaborator)
    query = `SELECT * FROM playlists WHERE owner='${owner}'`
    result = await this._pool.query(query)
    if (!result.rowCount) {
      throw new AuthorizationError('Anda tidak berhak menghapus playlist ini')
    }

    // if user is the owner
    query = `DELETE FROM playlists WHERE id='${id}' RETURNING id`
    result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus, id tidak ditemukan')
    }
  }

  async addPlaylistSong(playlistId, songId) {
    // check if ID song are valid
    await this.verifyExistingSong(songId)

    const id = `playlistSong-${nanoid(16)}`
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    }

    const result = await this._pool.query(query)
    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist')
    }
  }

  async getPlaylistSongs(id, owner) {
    let query
    let result

    // if owner trying to get song of playlist
    query = `
      SELECT songs.id, songs.title, songs.performer
      FROM songs
      INNER JOIN playlist_songs ON playlist_songs.song_id = songs.id
      INNER JOIN playlists ON playlists.id = playlist_songs.playlist_id
      WHERE
        playlist_songs.playlist_id = '${id}'
        AND
        playlists.owner = '${owner}'
    `
    result = await this._pool.query(query)

    // if collaborator trying to get song of playlist
    if (!result.rowCount) {
      const getOwner = await this.checkCollaboration(id, owner)

      query = `
      SELECT songs.id, songs.title, songs.performer
      FROM songs
      INNER JOIN playlist_songs ON playlist_songs.song_id = songs.id
      INNER JOIN playlists ON playlists.id = playlist_songs.playlist_id
      WHERE
        playlist_songs.playlist_id = '${id}'
        AND
        playlists.owner = '${getOwner}'
      `

      result = await this._pool.query(query)
    }

    return result.rows
  }

  async deletePlaylistSongById(playlistId, songId) {
    const query = `
      DELETE FROM playlist_songs
      WHERE
        playlist_id = '${playlistId}'
        AND
        song_id = '${songId}'
    `
    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new ClientError(
        'Lagu gagal dihapus dari playlist, lagu tidak ditemukan'
      )
    }
  }

  async insertActivity(userId, playlistId, songId, type) {
    const id = `activity-${nanoid(16)}`
    const time = new Date().toISOString()
    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, type, time],
    }
    await this._pool.query(query)
  }

  // only access by owner or collaborator
  async verifyPlaylistAccess(id, owner) {
    let query
    let result

    query = `SELECT * FROM playlists WHERE id='${id}'`
    result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }

    const playlist = result.rows[0]

    if (playlist.owner !== owner) {
      query = `
        SELECT *
        FROM collaborations
        WHERE playlist_id='${id}' AND user_id='${owner}'
      `
      result = await this._pool.query(query)

      if (!result.rowCount) {
        throw new AuthorizationError('Anda tidak berhak mengakses resource ini')
      }
    }
  }

  // check if user is the collaborator
  async checkCollaboration(playlistId, collaboratorId) {
    const query = `
      SELECT *
      FROM collaborations
      LEFT JOIN playlists ON playlists.id = collaborations.playlist_id
      WHERE playlist_id='${playlistId}' AND user_id='${collaboratorId}'
    `

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new AuthorizationError('Anda tidak berhak mengakses playlist ini')
    }

    return result.rows[0].owner
  }

  // check if song is exist
  async verifyExistingSong(id) {
    const query = `SELECT * FROM songs WHERE id='${id}'`
    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan')
    }
  }
}

export default PlaylistsService
