import dotenv from 'dotenv'
dotenv.config({ path: '.env' })

const config = {
  app: {
    host: process.env.HOST,
    port: process.env.PORT,
  },
  token: {
    accessKey: process.env.ACCESS_TOKEN_KEY,
    refreshKey: process.env.REFRESH_TOKEN_KEY,
    age: process.env.ACCESS_TOKEN_AGE,
  },
  rabbitMq: {
    server: process.env.RABBITMQ_SERVER,
  },
  redis: {
    host: process.env.REDIS_SERVER,
  },
}

export default config
