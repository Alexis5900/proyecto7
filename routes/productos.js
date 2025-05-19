const express = require('express')
const router = express.Router()
const { obtenerProductos, crearProducto, eliminarProducto } = require('../controllers/productoController')

router.get('/', obtenerProductos)
router.post('/', crearProducto)
router.delete('/:id', eliminarProducto)

module.exports = router
