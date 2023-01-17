import { nanoid } from 'nanoid'
import pg from 'pg'
const { Pool } = pg
import bcrypt from 'bcrypt'
import InvariantError from '../exceptions/InvariantError.js'
import NotFoundError from '../exceptions/NotFoundError.js'
import AuthenticationError from '../exceptions/AuthenticationError.js'

class UsersService {
  constructor() {
    this._pool = new Pool()
  }

  async verifyNewUsername(username) {
    const query = `SELECT * FROM users WHERE username='${username}'`
    const result = await this._pool.query(query)

    if (result.rowCount > 0) {
      throw new InvariantError(
        'Gagal menambahkan user. Username sudah digunakan.'
      )
    }
  }

  async addUser({ username, password, fullname }) {
    await this.verifyNewUsername(username)
    const id = `user-${nanoid(16)}`
    const hash = await bcrypt.hash(password, 10)
    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, username, hash, fullname],
    }

    const result = await this._pool.query(query)
    if (!result.rowCount) {
      throw new InvariantError('User gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getUserById(id) {
    const query = `SELECT id, username, fullname FROM users WHERE id='${id}'`
    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('User tidak ditemukan')
    }
    return result.rows[0]
  }

  async verifyUserCredential(username, password) {
    const query = `SELECT id, password FROM users WHERE username='${username}'`
    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah')
    }

    const { id, password: hashedPassword } = result.rows[0]
    const match = await bcrypt.compare(password, hashedPassword)

    if (!match) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah')
    }

    return id
  }

  async getUsersByUsername(username) {
    const query = `SELECT id, username, fullname FROM users WHERE username LIKE '%${username}%'`
    const result = await this._pool.query(query)
    return result.rows
  }
}

export default UsersService
