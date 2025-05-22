const mongoose = require('mongoose');

const CitaSchema = new mongoose.Schema({
  servicio: {
    type: String,
    required: [true, 'El servicio es obligatorio'],
    trim: true
  },
  fecha: {
    type: Date,
    required: [true, 'La fecha es obligatoria']
  },
  telefono: {
    type: String,
    trim: true,
    default: ''
  },
  notas: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true,
  versionKey: false
});

// Validación para asegurar que la fecha es futura
CitaSchema.path('fecha').validate(function(value) {
  return value > new Date();
}, 'La cita debe ser en una fecha futura');

module.exports = mongoose.model('Cita', CitaSchema);