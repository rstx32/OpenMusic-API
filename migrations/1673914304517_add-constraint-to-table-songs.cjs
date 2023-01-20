/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.sql(
    "INSERT INTO albums VALUES ('old_songs', 'old_songs', '111')"
  )
  pgm.sql("UPDATE songs SET album_id='old_songs' WHERE album_id IS NULL")
  pgm.addConstraint(
    'songs',
    'fk_songs.album_id-pk_albums.id',
    'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE'
  )
}

exports.down = (pgm) => {
  pgm.dropConstraint('songs', 'fk_songs.album_id-pk_albums.id')
}
