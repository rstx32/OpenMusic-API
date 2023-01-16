import AlbumPayloadSchema from './schema.js'
import InvariantError from '../../exceptions/InvariantError.js'

const AlbumValidator = {
  validateAlbumPayload: (payload) => {
    const validationResult = AlbumPayloadSchema.validate(payload)

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },
}

export default AlbumValidator
