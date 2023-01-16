import Joi from 'joi'

const SongPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().integer().required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number().integer(),
  albumId: Joi.string(),
})

export default SongPayloadSchema
