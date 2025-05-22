const Cita = require('../models/cita');

const crearCita = async (req, res) => {
  try {
    const { servicio, fecha, telefono, notas } = req.body;
    
    // Validación de campos requeridos
    if (!servicio || !fecha) {
      return res.status(400).json({ 
        error: 'Servicio y fecha son obligatorios' 
      });
    }

    const nuevaCita = new Cita({
      servicio,
      fecha: new Date(fecha),
      telefono: telefono || '',
      notas: notas || ''
    });

    await nuevaCita.save();
    
    res.status(201).json({
      mensaje: 'Cita creada exitosamente',
      cita: nuevaCita
    });
  } catch (error) {
    console.error('Error al crear cita:', error);
    res.status(500).json({ 
      error: 'Error al crear la cita',
      detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const obtenerCitas = async (req, res) => {
  try {
    const citas = await Cita.find({})
      .sort({ fecha: 1 })
      .select('-__v');
    
    res.json(citas);
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ 
      error: 'Error al obtener las citas',
      detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const obtenerCita = async (req, res) => {
  try {
    const cita = await Cita.findById(req.params.id).select('-__v');

    if (!cita) {
      return res.status(404).json({ 
        error: 'Cita no encontrada' 
      });
    }

    res.json(cita);
  } catch (error) {
    console.error('Error al obtener cita:', error);
    res.status(500).json({ 
      error: 'Error al obtener la cita',
      detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const actualizarCita = async (req, res) => {
  try {
    const { servicio, fecha, telefono, notas } = req.body;

    const cita = await Cita.findByIdAndUpdate(
      req.params.id,
      { 
        servicio, 
        fecha: new Date(fecha), 
        telefono, 
        notas 
      },
      { 
        new: true,
        runValidators: true 
      }
    ).select('-__v');

    if (!cita) {
      return res.status(404).json({ 
        error: 'Cita no encontrada' 
      });
    }

    res.json({
      mensaje: 'Cita actualizada exitosamente',
      cita
    });
  } catch (error) {
    console.error('Error al actualizar cita:', error);
    res.status(500).json({ 
      error: 'Error al actualizar la cita',
      detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const eliminarCita = async (req, res) => {
  try {
    const cita = await Cita.findByIdAndDelete(req.params.id);

    if (!cita) {
      return res.status(404).json({ 
        error: 'Cita no encontrada' 
      });
    }

    res.json({ 
      mensaje: 'Cita eliminada exitosamente',
      id: req.params.id
    });
  } catch (error) {
    console.error('Error al eliminar cita:', error);
    res.status(500).json({ 
      error: 'Error al eliminar la cita',
      detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  crearCita,
  obtenerCitas,
  obtenerCita,
  actualizarCita,
  eliminarCita
};