/* eslint-disable camelcase */
const mapDBToModel = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id,
})

const mapAlbumDBToModel = ({ id, name, year, cover_url, songs }) => ({
  id,
  name,
  year,
  coverUrl: cover_url,
  songs,
})

export { mapDBToModel, mapAlbumDBToModel }
