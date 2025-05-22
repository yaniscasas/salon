// Variables globales
let editandoCitaId = null;

// Elementos del DOM
const citasContainer = document.getElementById('citas-container');
const citaForm = document.getElementById('cita-form');
const citaMessage = document.getElementById('cita-message');
const bienvenidaUsuario = document.getElementById('bienvenida-usuario');
const listaCitas = document.getElementById('lista-citas');

// Referencias al modal y formulario de edición
const modalEditar = document.getElementById('modal-editar');
const cerrarModal = document.getElementById('cerrar-modal');
const formEditarCita = document.getElementById('form-editar-cita');
const editarCitaMessage = document.getElementById('editar-cita-message');
let citaIdEditando = null;

// ========== FUNCIÓN PARA LLAMADAS API ==========
async function fetchAPI(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  if (body) options.body = JSON.stringify(body);

  try {
    // Cambiar la URL base a solo /api para funcionar con nginx proxy
    const res = await fetch(`/api${endpoint}`, options);
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Error en la petición');
    }
    
    return data;
  } catch (err) {
    console.error('Error en fetchAPI:', err);
    throw err;
  }
}

// ========== CRUD DE CITAS ==========
// Crear o actualizar cita
citaForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const servicio = document.getElementById('servicio').value;
  const fecha = document.getElementById('fecha').value;
  const hora = document.getElementById('hora').value;
  const telefono = document.getElementById('telefono').value;
  const notas = document.getElementById('notas').value;
  
  // Validar campos requeridos
  if (!servicio || !fecha || !hora) {
    mostrarMensajeCita('Servicio, fecha y hora son obligatorios', 'error');
    return;
  }
  
  // Combinar fecha y hora
  const fechaHora = new Date(`${fecha}T${hora}:00`);
  
  try {
    const citaData = {
      servicio,
      fecha: fechaHora.toISOString(),
      telefono,
      notas
    };
    
    if (editandoCitaId) {
      // Actualizar cita existente
      await fetchAPI(`/citas/${editandoCitaId}`, 'PUT', citaData);
      mostrarMensajeCita('Cita actualizada correctamente', 'success');
    } else {
      // Crear nueva cita
      await fetchAPI('/citas', 'POST', citaData);
      mostrarMensajeCita('Cita agendada correctamente', 'success');
    }
    
    // Limpiar formulario y recargar lista
    citaForm.reset();
    editandoCitaId = null;
    document.getElementById('btn-cita').textContent = 'AGENDAR';
    await cargarCitas();
  } catch (err) {
    mostrarMensajeCita(err.message || 'Error al guardar la cita', 'error');
    console.error('Error al guardar cita:', err);
  }
});

// Cargar citas del usuario
async function cargarCitas() {
  try {
    const citas = await fetchAPI('/citas');
    
    if (citas.length === 0) {
      listaCitas.innerHTML = '<p class="no-citas">No tienes citas agendadas</p>';
      return;
    }
    
    // Ordenar citas por fecha (más cercana primero)
    citas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    
    let html = '';
    citas.forEach(cita => {
      const fecha = new Date(cita.fecha);
      const fechaStr = fecha.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const horaStr = fecha.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      html += `
        <div class="cita-card">
          <div class="cita-info">
            <h4>${cita.servicio}</h4>
            <p><strong>Fecha:</strong> ${fechaStr}</p>
            <p><strong>Hora:</strong> ${horaStr}</p>
            ${cita.notas ? `<p><strong>Notas:</strong> ${cita.notas}</p>` : ''}
            ${cita.telefono ? `<p><strong>Teléfono:</strong> ${cita.telefono}</p>` : ''}
          </div>
          <div class="cita-acciones">
            <button class="btn-editar" data-id="${cita._id}">Editar</button>
            <button class="btn-eliminar" data-id="${cita._id}">Eliminar</button>
          </div>
        </div>
      `;
    });
    
    listaCitas.innerHTML = html;
    
    // Agregar eventos a los botones
    agregarEventosBotonesCitas();
  } catch (err) {
    mostrarMensajeCita('Error al cargar las citas', 'error');
    console.error('Error al cargar citas:', err);
  }
}

// Mostrar el modal de edición con los datos de la cita
function abrirModalEditar(cita) {
  citaIdEditando = cita._id;
  document.getElementById('editar-servicio').value = cita.servicio;
  const fechaHora = new Date(cita.fecha);
  document.getElementById('editar-fecha').value = fechaHora.toISOString().split('T')[0];
  document.getElementById('editar-hora').value = fechaHora.toTimeString().substring(0, 5);
  document.getElementById('editar-telefono').value = cita.telefono || '';
  document.getElementById('editar-notas').value = cita.notas || '';
  editarCitaMessage.textContent = '';
  modalEditar.style.display = 'block';
}

cerrarModal.onclick = function() {
  modalEditar.style.display = 'none';
  citaIdEditando = null;
};
window.onclick = function(event) {
  if (event.target === modalEditar) {
    modalEditar.style.display = 'none';
    citaIdEditando = null;
  }
};

formEditarCita.onsubmit = async function(e) {
  e.preventDefault();
  const servicio = document.getElementById('editar-servicio').value;
  const fecha = document.getElementById('editar-fecha').value;
  const hora = document.getElementById('editar-hora').value;
  const telefono = document.getElementById('editar-telefono').value;
  const notas = document.getElementById('editar-notas').value;
  if (!servicio || !fecha || !hora) {
    editarCitaMessage.textContent = 'Servicio, fecha y hora son obligatorios';
    editarCitaMessage.className = 'error';
    return;
  }
  const fechaHora = new Date(`${fecha}T${hora}:00`);
  try {
    await fetchAPI(`/citas/${citaIdEditando}`, 'PUT', {
      servicio,
      fecha: fechaHora.toISOString(),
      telefono,
      notas
    });
    editarCitaMessage.textContent = 'Cita actualizada correctamente';
    editarCitaMessage.className = 'success';
    setTimeout(() => {
      modalEditar.style.display = 'none';
      cargarCitas();
    }, 800);
  } catch (err) {
    editarCitaMessage.textContent = err.message || 'Error al actualizar la cita';
    editarCitaMessage.className = 'error';
  }
};

// Agregar eventos a botones de citas
function agregarEventosBotonesCitas() {
  // Botones de editar
  document.querySelectorAll('.btn-editar').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const citaId = e.target.dataset.id;
      try {
        const cita = await fetchAPI(`/citas/${citaId}`);
        abrirModalEditar(cita);
      } catch (err) {
        mostrarMensajeCita('Error al cargar la cita para editar', 'error');
        console.error('Error al editar cita:', err);
      }
    });
  });
  
  // Botones de eliminar
  document.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const citaId = e.target.dataset.id;
      
      if (confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
        try {
          await fetchAPI(`/citas/${citaId}`, 'DELETE');
          mostrarMensajeCita('Cita eliminada correctamente', 'success');
          await cargarCitas();
        } catch (err) {
          mostrarMensajeCita('Error al eliminar la cita', 'error');
          console.error('Error al eliminar cita:', err);
        }
      }
    });
  });
}

// Mostrar mensajes en el formulario de citas
function mostrarMensajeCita(mensaje, tipo) {
  citaMessage.textContent = mensaje;
  citaMessage.className = tipo;
  
  setTimeout(() => {
    citaMessage.textContent = '';
    citaMessage.className = '';
  }, 5000);
}

// ========== INICIALIZACIÓN ==========
// Mostrar interfaz de citas directamente
mostrarInterfazCitas();
cargarCitas();

// Mostrar interfaz de citas
function mostrarInterfazCitas() {
  citasContainer.style.display = 'block';
  bienvenidaUsuario.textContent = 'Agenda tu cita';
  // Establecer fecha mínima como hoy
  const hoy = new Date().toISOString().split('T')[0];
  document.getElementById('fecha').min = hoy;
}