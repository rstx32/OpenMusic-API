/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('albums', {
    id: {
      type: 'varchar(22)',
      primaryKey: true,
    },
    name: {
      type: 'varchar(50)',
      notNull: true,
    },
    year: {
      type: 'integer',
      notNull: true,
    },
  })
}

exports.down = (pgm) => {
  pgm.dropTable('albums')
}
