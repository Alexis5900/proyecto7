const mongoose = require('mongoose')

const ProductoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    required: true
  },
  imagen: {
    type: String,
    required: true
  },
  precio: {
    type: Number,
    required: true
  },
  codigo: {
    type: Number
  }
})

module.exports = mongoose.model('Producto', ProductoSchema)
