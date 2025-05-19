// Controlador básico para productos

const Producto = require('../models/Producto')

exports.obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.find()
    res.json(productos)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos' })
  }
}

exports.getProducto = (req, res) => {
  res.json({})
}

exports.crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, imagen, precio, codigo } = req.body
    const nuevoProducto = new Producto({ nombre, descripcion, imagen, precio, codigo })
    await nuevoProducto.save()
    res.status(201).json(nuevoProducto)
  } catch (error) {
    res.status(400).json({ message: 'Error al crear producto' })
  }
}

exports.actualizarProducto = (req, res) => {
  res.json({ message: "Producto actualizado" })
}

exports.eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await Producto.findByIdAndDelete(id)
    if (!eliminado) return res.status(404).json({ message: 'Producto no encontrado' })
    res.json({ message: 'Producto eliminado' })
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar producto' })
  }
} 