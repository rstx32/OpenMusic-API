import { nanoid } from 'nanoid'
import pg from 'pg'
import InvariantError from '../exceptions/InvariantError.js'
import NotFoundError from '../exceptions/NotFoundError.js'
import AuthorizationError from '../exceptions/AuthorizationError.js'
import ClientError from '../exceptions/ClientError.js'
const { Pool } = pg

class PlaylistsService {
  constructor(playlistService) {
    this._pool = new Pool()
    this._playlistService = playlistService
  }

  async addPlaylist({ name, owner }) {
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
    const query = `
      SELECT id, name, owner AS username
      FROM playlists
      WHERE owner='${owner}'
    `
    const result = await this._pool.query(query)

    return result.rows
  }

  async getPlaylistById(id, owner) {
    const query = `
      SELECT playlists.id, playlists.name, users.username
      FROM playlists
      LEFT JOIN users ON users.id = '${owner}'
      WHERE playlists.id='${id}' AND playlists.owner='${owner}'
    `
    const result = await this._pool.query(query)
    return result.rows[0]
  }

  async deletePlaylistById(id) {
    const query = `DELETE FROM playlists WHERE id='${id}' RETURNING id`
    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus, id tidak ditemukan')
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = `SELECT * FROM playlists WHERE id='${id}'`
    const result = await this._pool.query(query)
    
    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }

    const playlist = result.rows[0]

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini')
    }
  }

  async addPlaylistSong(playlistId, songId) {
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

  async verifyExistingSong(id) {
    const query = `SELECT * FROM songs WHERE id='${id}'`
    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan')
    }
  }

  async getPlaylistSongs(id, owner) {
    const query = `
      SELECT songs.id, songs.title, songs.performer
      FROM songs
      INNER JOIN playlist_songs ON playlist_songs.song_id = songs.id
      INNER JOIN playlists ON playlists.id = playlist_songs.playlist_id
      WHERE
        playlist_songs.playlist_id = '${id}'
        AND
        playlists.owner = '${owner}'
    `

    const result = await this._pool.query(query)

    return result.rows
  }

  async deletePlaylistSongById(playlistId, songId) {
    const query = `
      DELETE FROM playlist_songs
      WHERE playlist_id = '${playlistId}' AND song_id = '${songId}'
    `
    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new ClientError(
        'Lagu gagal dihapus dari playlist, lagu tidak ditemukan'
      )
    }
  }
}

export default PlaylistsService
