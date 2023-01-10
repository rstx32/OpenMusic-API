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
      type: 'varchar(4)',
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
    albumId: {
      type: 'varchar(22)',
    },
  })
}

exports.down = (pgm) => {
  pgm.dropTable('albums')
  pgm.dropTable('songs')
}
