/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('user_album_likes', {
    id: {
      type: 'VARCHAR (50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR (50)',
      required: true,
    },
    album_id: {
      type: 'VARCHAR (50)',
      required: true,
    },
  })
}

exports.down = (pgm) => {
  pgm.dropTable('user_album_likes')
}
