require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch((err) => console.error('Error de conexión a MongoDB', err))

app.use('/api/productos', require('./routes/productos'))
app.use('/api/usuarios', require('./routes/usuarios')) // <--- Esta es la nueva
const checkoutRoutes = require('./routes/checkout')
app.use('/api/checkout', checkoutRoutes)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3005
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
})
