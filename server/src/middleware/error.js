// 404 for unknown routes and one JSON error shape: { message, code, details }
export function notFound(req, res) {
  res.status(404).json({ message: 'Route not found', code: 'NOT_FOUND' })
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status || 500
  if (status >= 500) console.error(err)
  res.status(status).json({
    message: status >= 500 ? 'Something went wrong' : err.message,
    code: err.code || 'SERVER_ERROR',
    ...(err.details ? { details: err.details } : {}),
  })
}
