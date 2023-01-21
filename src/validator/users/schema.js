import Joi from 'joi'

const UserPayloadSchema = Joi.object({
  username: Joi.string().max(50).required(),
  password: Joi.string().required(),
  fullname: Joi.string().required(),
})

export default UserPayloadSchema
