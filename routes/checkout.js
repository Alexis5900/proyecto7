const express = require('express')
const router = express.Router()
const Stripe = require('stripe')
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)
const Compra = require('../models/Compra')
const jwt = require('jsonwebtoken')
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

router.post('/create-checkout-session', async (req, res) => {
  const { cart, token, direccion, telefono, notas } = req.body
  console.log("Cart recibido:", cart)
  console.log("Token recibido:", token)

  if (!direccion || !telefono) {
    return res.status(400).json({ error: 'La dirección y el teléfono son obligatorios.' })
  }

  const line_items = cart.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name
      },
      unit_amount: Math.round(item.price * 100)
    },
    quantity: item.quantity
  }))

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`
    })

    // Guardar la compra en la base de datos
    let usuarioId = null
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.SECRET)
        usuarioId = decoded.id
      } catch (e) {}
    }
    const productos = cart.map(item => ({ nombre: item.name, cantidad: item.quantity, precio: item.price }))
    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
    await Compra.create({
      usuario: usuarioId,
      productos,
      total,
      direccion,
      telefono,
      estado: 'pagada',
      metodoPago: 'Stripe',
      stripeId: session.id,
      notas: notas || '',
      envio: 3,
      impuestos: 0
    })

    res.json({ url: session.url })
  } catch (error) {
    console.error("Error en checkout:", error)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router 