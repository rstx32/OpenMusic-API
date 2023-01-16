import SongsPayloadSchema from './schema.js'
import InvariantError from '../../exceptions/InvariantError.js'

const SongsValidator = {
  validateSongPayload: (payload) => {
    const validationResult = SongsPayloadSchema.validate(payload)

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },
}

export default SongsValidator
