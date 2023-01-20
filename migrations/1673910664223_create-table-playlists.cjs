/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('playlists', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    name: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  })

  // foreign key owner (users)
  pgm.addConstraint(
    'playlists',
    'fk_playlists.owner-pk_users.id',
    'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE'
  )
}

exports.down = (pgm) => {
  pgm.dropTable('playlists')
}
