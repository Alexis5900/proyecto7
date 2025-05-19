const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
  const token = req.header('x-auth-token')
  if (!token) return res.status(401).json({ mensaje: 'No token, acceso denegado' })

  try {
    const decoded = jwt.verify(token, process.env.SECRET)
    req.usuario = decoded
    next()
  } catch (error) {
    res.status(401).json({ mensaje: 'Token inválido' })
  }
}

module.exports = verifyToken
