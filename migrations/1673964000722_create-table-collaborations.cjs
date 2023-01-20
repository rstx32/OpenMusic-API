/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('collaborations', {
    id: {
      type: 'VARCHAR (50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR (50)',
      required: true,
    },
    user_id: {
      type: 'VARCHAR (50)',
      required: true,
    },
  })

  pgm.addConstraint(
    'collaborations',
    'fk_collaborations.playlist_id-pk_playlists.id',
    'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE'
  )

  pgm.addConstraint(
    'collaborations',
    'fk_collaborations.user_id-pk_users.id',
    'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE'
  )
}

exports.down = (pgm) => {
  pgm.dropTable('collaborations')
}
