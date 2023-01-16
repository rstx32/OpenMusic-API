/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.createTable('songs', {
    id: {
      type: 'varchar(21)',
      primaryKey: true,
    },
    title: {
      type: 'varchar(50)',
      notNull: true,
    },
    year: {
      type: 'integer',
      notNull: true,
    },
    performer: {
      type: 'varchar(50)',
      notNull: true,
    },
    genre: {
      type: 'varchar(50)',
      notNull: true,
    },
    duration: {
      type: 'integer',
    },
    album_id: {
      type: 'varchar(22)',
    },
  })
}

exports.down = (pgm) => {
  pgm.dropTable('songs')
}
