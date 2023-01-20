import ExportPlaylistsPayloadSchema from './schema.js'
import InvariantError from '../../exceptions/InvariantError.js'

const ExportsValidator = {
  validateExportPlaylistsPayload: (payload) => {
    const validationResult = ExportPlaylistsPayloadSchema.validate(payload)
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },
}

export default ExportsValidator
