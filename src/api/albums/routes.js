const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums',
    handler: (request, h) => handler.postAlbumHandler(request, h),
  },
  // {
  //   method: 'GET',
  //   path: '/albums/{id}',
  //   handler: handler.getAlbumByIdHandler,
  // },
  // {
  //   method: 'PUT',
  //   path: '/albums/{id}',
  //   handler: handler.editAlbumByIdHandler,
  // },
  // {
  //   method: 'DELETE',
  //   path: '/albums/{id}',
  //   handler: handler.deleteAlbumByIdHandler,
  // },
]

module.exports = routes
