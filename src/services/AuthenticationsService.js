import pg from 'pg'
const { Pool } = pg
import InvariantError from '../exceptions/InvariantError.js'

class AuthenticationsService {
  constructor() {
    this._pool = new Pool()
  }

  async addRefreshToken(token) {
    const query = `INSERT INTO authentications VALUES('${token}')`
    await this._pool.query(query)
  }

  async verifyRefreshToken(token) {
    const query = `SELECT token FROM authentications WHERE token='${token}'`
    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new InvariantError('Refresh token tidak valid')
    }
  }

  async deleteRefreshToken(token) {
    const query = `DELETE FROM authentications WHERE token='${token}'`
    await this._pool.query(query)
  }
}

export default AuthenticationsService
