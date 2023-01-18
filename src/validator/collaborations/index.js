import CollaborationPayloadSchema from './schema.js'
import InvariantError from '../../exceptions/InvariantError.js'

const CollaborationsValidator = {
  validateCollaborationPayload: (payload) => {
    const validationResult = CollaborationPayloadSchema.validate(payload)
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },
}

export default CollaborationsValidator
