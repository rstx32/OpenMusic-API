import Jwt from '@hapi/jwt'
import InvariantError from '../exceptions/InvariantError.js'
import config from '../utils/config.js'

const TokenManager = {
  generateAccessToken: (payload) =>
    Jwt.token.generate(payload, config.token.accessKey),
  generateRefreshToken: (payload) =>
    Jwt.token.generate(payload, config.token.refreshKey),
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = Jwt.token.decode(refreshToken)
      Jwt.token.verifySignature(artifacts, config.token.refreshKey)
      const { payload } = artifacts.decoded
      
      return payload
    } catch (error) {
      throw new InvariantError('Refresh token tidak valid')
    }
  },
}

export default TokenManager
