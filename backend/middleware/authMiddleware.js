const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const token = req.header('x-token');
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Acceso denegado. Token no proporcionado' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.uid = decoded.id;
    next();
  } catch (error) {
    console.error('Error al verificar token:', error);
    res.status(401).json({ 
      error: 'Token inválido o expirado' 
    });
  }
};

module.exports = verificarToken;