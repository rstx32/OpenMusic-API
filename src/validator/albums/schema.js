import Joi from 'joi'

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().integer().required(),
})

const ImageHeadersSchema = Joi.object({
  'content-type': Joi.string()
    .valid(
      'image/png',
      'image/avif',
      'image/gif',
      'image/jpg',
      'image/jpeg',
      'image/png',
      'image/webp'
    )
    .required(),
}).unknown()

export { AlbumPayloadSchema, ImageHeadersSchema }
