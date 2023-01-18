/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.createTable('playlist_song_activities', {
    id: {
      type: 'VARCHAR (50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR (50)',
      required: true,
    },
    song_id: {
      type: 'VARCHAR (50)',
      required: true,
    },
    user_id: {
      type: 'VARCHAR (50)',
      required: true,
    },
    action: {
      type: 'VARCHAR (50)',
      required: true,
    },
    time: {
      type: 'date',
      required: true,
    },
  })

  pgm.addConstraint(
    'playlist_song_activities',
    'fk_playlist_song_activities.playlist_id-pk_playlists.id',
    'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE'
  )
}

exports.down = (pgm) => {
  pgm.dropTable('playlist_song_activities')
}
