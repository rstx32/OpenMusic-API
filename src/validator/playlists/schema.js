import Joi from 'joi'

const PlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
})

const PlaylistSongPayloadSchema = Joi.object({
  songId: Joi.string().required(),
})

export { PlaylistPayloadSchema, PlaylistSongPayloadSchema }
