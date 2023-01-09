const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums',
    handler: (request, h) => handler.postAlbumHandler(request, h),
  },
  {
    method: 'GET',
    path: '/albums/{id}',
    handler: (request, h) => handler.getAlbumByIdHandler(request, h),
  },
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
