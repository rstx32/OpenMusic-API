import pg from 'pg'
import NotFoundError from '../exceptions/NotFoundError.js'
import AuthorizationError from '../exceptions/AuthorizationError.js'
const { Pool } = pg

class ActivitiesService {
  constructor(activitiesService) {
    this._pool = new Pool()
    this._activitiesService = activitiesService
  }

  async getActivity(playlistId, userId) {
    let query
    let result

    query = `
        SELECT users.username, songs.title, activity.action, activity.time
        FROM playlist_song_activities activity
        LEFT JOIN users ON users.id = activity.user_id
        LEFT JOIN songs ON songs.id = activity.song_id
        WHERE playlist_id='${playlistId}' AND user_id='${userId}'
    `
    result = await this._pool.query(query)

    if (!result.rowCount) {
      query = `
          SELECT users.username, songs.title, activity.action, activity.time
          FROM playlist_song_activities activity
          LEFT JOIN users ON users.id = activity.user_id
          LEFT JOIN songs ON songs.id = activity.song_id
          LEFT JOIN collaborations ON collaborations.id = activity.playlist_id
          WHERE collaborations.playlist_id='${playlistId}' AND collaborations.user_id='${userId}'
      `
      result = await this._pool.query(query)

      if (!result.rowCount) {
        throw new AuthorizationError('Anda tidak berhak mengakses playlist ini')
      }
    }

    return result.rows
  }

  async checkExistingPlaylist(id) {
    const result = await this._pool.query(
      `SELECT * FROM playlists WHERE id='${id}'`
    )
    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }
  }

  async getPlaylistId(id) {
    const result = await this._pool.query(
      `SELECT id FROM playlists WHERE id='${id}'`
    )

    return result.rows[0].id
  }
}

export default ActivitiesService
