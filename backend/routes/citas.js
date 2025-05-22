const express = require('express');
const router = express.Router();
const {
  crearCita,
  obtenerCitas,
  obtenerCita,
  actualizarCita,
  eliminarCita
} = require('../controllers/citasController');

// CRUD de citas
router.post('/', crearCita);
router.get('/', obtenerCitas);
router.get('/:id', obtenerCita);
router.put('/:id', actualizarCita);
router.delete('/:id', eliminarCita);

module.exports = router;