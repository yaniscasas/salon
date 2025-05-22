const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Rutas
app.use('/api/citas', require('./routes/citas'));


// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
 .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error(err));
// Puerto
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
