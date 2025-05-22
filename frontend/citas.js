document.addEventListener('DOMContentLoaded', function() {
    // Establecer la fecha mínima como hoy
    const fechaInput = document.getElementById('fecha');
    const hoy = new Date().toISOString().split('T')[0];
    fechaInput.min = hoy;
    
    // Cargar citas existentes
    cargarCitas();
    
    // Manejar el envío del formulario
    document.getElementById('citaForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nombre = document.getElementById('nombre').value;
        const telefono = document.getElementById('telefono').value;
        const fecha = document.getElementById('fecha').value;
        const hora = document.getElementById('hora').value;
        const motivo = document.getElementById('motivo').value;
        
        // Validación básica
        if (!nombre || !telefono || !fecha || !hora || !motivo) {
            mostrarMensaje('Por favor, complete todos los campos', 'error');
            return;
        }
        
        // Preparar datos para enviar
        const datosCita = {
            nombre: nombre,
            telefono: telefono,
            fecha: fecha,
            hora: hora,
            motivo: motivo
        };
        
        // Enviar datos al servidor
        fetch('/api/citas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosCita)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(data => {
            mostrarMensaje('Cita agendada con éxito', 'success');
            document.getElementById('citaForm').reset();
            cargarCitas(); // Recargar la lista de citas
        })
        .catch(error => {
            mostrarMensaje('Error al agendar cita: ' + error.message, 'error');
        });
    });
    
    // Función para cargar las citas del usuario
    function cargarCitas() {
        fetch('/api/citas')
            .then(response => response.json())
            .then(citas => {
                const listaCitas = document.getElementById('listaCitas');
                
                if (citas.length === 0) {
                    listaCitas.innerHTML = '<p>No tienes citas agendadas</p>';
                    return;
                }
                
                let html = '';
                citas.forEach(cita => {
                    // Formatear fecha y hora para mostrar
                    const fechaFormateada = new Date(cita.fecha).toLocaleDateString();
                    
                    html += `
                        <div class="cita-card">
                            <h3>${cita.motivo}</h3>
                            <p><strong>Nombre:</strong> ${cita.nombre}</p>
                            <p><strong>Teléfono:</strong> ${cita.telefono}</p>
                            <p><strong>Fecha:</strong> ${fechaFormateada}</p>
                            <p><strong>Hora:</strong> ${cita.hora}</p>
                            <button class="btn-cancelar" data-id="${cita._id}">Cancelar</button>
                        </div>
                    `;
                });
                
                listaCitas.innerHTML = html;
                
                // Agregar eventos a los botones de cancelar
                document.querySelectorAll('.btn-cancelar').forEach(button => {
                    button.addEventListener('click', function() {
                        const citaId = this.getAttribute('data-id');
                        cancelarCita(citaId);
                    });
                });
            })
            .catch(error => {
                mostrarMensaje('Error al cargar citas: ' + error.message, 'error');
            });
    }
    
    // Función para cancelar una cita
    function cancelarCita(id) {
        if (confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
            fetch(`/api/citas/${id}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cancelar la cita');
                }
                return response.json();
            })
            .then(data => {
                mostrarMensaje('Cita cancelada con éxito', 'success');
                cargarCitas(); // Recargar la lista de citas
            })
            .catch(error => {
                mostrarMensaje('Error: ' + error.message, 'error');
            });
        }
    }
    
    // Función para mostrar mensajes
    function mostrarMensaje(texto, tipo) {
        const mensajeDiv = document.getElementById('mensaje');
        mensajeDiv.textContent = texto;
        mensajeDiv.className = tipo;
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            mensajeDiv.textContent = '';
            mensajeDiv.className = '';
        }, 3000);
    }
});