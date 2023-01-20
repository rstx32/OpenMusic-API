/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('playlist_songs', {
    id: {
      type: 'VARCHAR (50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR (50)',
      notNull: true,
    },
    song_id: {
      type: 'VARCHAR (50)',
      notNull: true,
    },
  })

  // foreign key playlists
  pgm.addConstraint(
    'playlist_songs',
    'fk_playlist_songs.playlist_id-pk_playlists.id',
    'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE'
  )

  // foreign key songs
  pgm.addConstraint(
    'playlist_songs',
    'fs_playlist_songs.song_id-pk_songs.id',
    'FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE'
  )
}

exports.down = (pgm) => {
  pgm.dropTable('playlist_songs')
}
