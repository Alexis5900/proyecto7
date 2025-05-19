const mongoose = require('mongoose')

const CompraSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  productos: [
    {
      nombre: String,
      cantidad: Number,
      precio: Number
    }
  ],
  total: { type: Number, required: true },
  fecha: { type: Date, default: Date.now },
  direccion: { type: String, required: true },
  telefono: { type: String, required: true },
  estado: { type: String, default: "pagada" },
  metodoPago: { type: String, default: "Stripe" },
  stripeId: { type: String },
  notas: { type: String },
  envio: { type: Number, default: 3 },
  impuestos: { type: Number, default: 0 }
})

module.exports = mongoose.model('Compra', CompraSchema) 