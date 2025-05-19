const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Usuario = require('../models/Usuario')
const verifyToken = require('../middleware/verifyToken')
const nodemailer = require('nodemailer')
const Compra = require('../models/Compra')

router.post('/registro', async (req, res) => {
  try {
    const { username, email, password } = req.body
    const existeUsuario = await Usuario.findOne({ email })
    if (existeUsuario) {
      return res.status(400).json({ mensaje: 'El usuario ya existe' })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const nuevoUsuario = new Usuario({
      username,
      email,
      password: hashedPassword
    })

    await nuevoUsuario.save()

    const payload = { id: nuevoUsuario._id }
    const token = jwt.sign(payload, process.env.SECRET, { expiresIn: '1d' })

    res.status(201).json({ token })
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const usuario = await Usuario.findOne({ email })
    if (!usuario) {
      return res.status(400).json({ mensaje: 'Credenciales inválidas' })
    }

    const isMatch = await bcrypt.compare(password, usuario.password)
    if (!isMatch) {
      return res.status(400).json({ mensaje: 'Credenciales inválidas' })
    }

    const token = jwt.sign({ id: usuario._id }, process.env.SECRET, {
      expiresIn: '1d'
    })

    res.json({ token })
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión' })
  }
})

router.get('/verificar-usuario', verifyToken, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select('-password')
    res.json({ usuario })
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al verificar usuario' })
  }
})

function generarPasswordTemporal(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

router.post('/recuperar-password', async (req, res) => {
  const { email } = req.body
  try {
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ mensaje: 'Debes ingresar un correo electrónico válido.' })
    }
    const usuario = await Usuario.findOne({ email })
    if (!usuario) {
      return res.status(404).json({ mensaje: 'No existe una cuenta con ese correo.' })
    }
    // Generar contraseña temporal
    const nuevaPassword = generarPasswordTemporal(10)
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(nuevaPassword, salt)
    usuario.password = hashedPassword
    await usuario.save()

    // Crear cuenta de Ethereal
    const testAccount = await nodemailer.createTestAccount()
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    })
    const mailOptions = {
      from: `Pizzas Molina <no-reply@pizzasmolina.com>`,
      to: email,
      subject: 'Recuperación de contraseña - Pizzas Molina',
      text: `Estimado ${usuario.username || usuario.email}\n\nSu contraseña temporal es:\n${nuevaPassword}\n\nPor favor, cámbiela después de iniciar sesión.`
    }
    const info = await transporter.sendMail(mailOptions)
    const etherealUrl = nodemailer.getTestMessageUrl(info)
    return res.json({ mensaje: 'Se ha enviado un correo con la contraseña temporal.', url: etherealUrl })
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al procesar la solicitud.' })
  }
})

router.get('/compras', verifyToken, async (req, res) => {
  try {
    const compras = await Compra.find({ usuario: req.usuario.id }).sort({ fecha: -1 })
    res.json(compras)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el historial de compras' })
  }
})

module.exports = router
