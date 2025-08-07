// app.js
import {
    abrirIndexedDB,
    guardarTareaIndexedDB,
    eliminarTareaIndexedDB,
    obtenerTodasTareasIndexedDB,
    obtenerTareasPorFecha,
    eliminarTodasLasTareasIndexedDB
} from './indexeddb.js';

// === VARIABLES GLOBALES ===
let toastVisible = false;
const toastQueue = [];
let nombreAsesor = "";
let usuarioAdp = "";
let correlativo = 1;
let letraActual = "A";
let codigosGenerados = [];
let tareas = [];
let filtroActual = 'all';

// --- NUEVAS VARIABLES PARA EL FILTRO POR FECHA ---
let fechaSeleccionada = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
const fechaHoy = fechaSeleccionada; // Guarda la fecha actual para comparar

// === FUNCIONES DE UTILIDAD ===
function mostrarToast(mensaje = "Plantilla copiada") {
    const toast = document.getElementById("toast");
    if (!toast) return;

    if (toastVisible) {
        toastQueue.push(mensaje);
        return;
    }

    toast.textContent = mensaje;
    toast.classList.remove("hide");
    toast.classList.add("show");
    toast.show();
    toastVisible = true;

    setTimeout(() => {
        toast.classList.remove("show");
        toast.classList.add("hide");
        setTimeout(() => {
            toast.close();
            toastVisible = false;
            if (toastQueue.length > 0) {
                const siguienteMensaje = toastQueue.shift();
                mostrarToast(siguienteMensaje);
            }
        }, 300);
    }, 2000);
}

// Función copiarEnlace fusionada de copy.js
function copiarEnlace(event) {
    event.preventDefault();
    const url = event.currentTarget.getAttribute("data-url");
    const tempInput = document.createElement('textarea');
    tempInput.value = url;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
        document.execCommand('copy');
        mostrarToast("🔗 Enlace copiado al portapapeles");
    } catch (err) {
        console.error("Error al copiar el enlace:", err);
        mostrarToast("❌ No se pudo copiar el enlace");
    } finally {
        document.body.removeChild(tempInput);
    }
}

function cerrarDialogConAnimacion(dialog) {
    if (!dialog) return;
    dialog.classList.add("closing");
    setTimeout(() => {
        dialog.classList.remove("closing");
        dialog.close();
    }, 300);
}

function toggleElementVisibility(element, visible, displayMode = "flex") {
    if (!element) return;
    if (visible) {
        element.style.display = displayMode;
        element.classList.remove("fade-out");
        element.classList.add("fade-in");
    } else {
        element.classList.remove("fade-in");
        element.style.display = "none";
    }
}

// === LÓGICA DE SESIÓN Y CÓDIGOS ===
function claveUsuario() { return `codigos_${usuarioAdp}`; }
function guardarDatos() {
    const fecha = new Date().toDateString();
    const clave = `codigos_${usuarioAdp}`;
    localStorage.setItem(clave, JSON.stringify({ fecha, codigos: codigosGenerados }));
}
function mostrarUltimoCodigoGenerado() {
    const ult = codigosGenerados[codigosGenerados.length - 1] || "";
    const codigoGenerado = document.getElementById("codigo-generado");
    if (codigoGenerado) codigoGenerado.textContent = ult;
}
function cargarDatosGuardados() {
    if (!usuarioAdp) return;
    const clave = `codigos_${usuarioAdp}`;
    const data = JSON.parse(localStorage.getItem(clave));
    const fechaActual = new Date().toDateString();
    const listaCodigos = document.getElementById("lista-codigos");

    if (!data || data.fecha !== fechaActual) {
        codigosGenerados = [];
        correlativo = 1;
        letraActual = "A";
        localStorage.setItem(clave, JSON.stringify({ fecha: fechaActual, codigos: [] }));
        if (listaCodigos) listaCodigos.innerHTML = "";
    } else {
        codigosGenerados = data.codigos;
        if (listaCodigos) listaCodigos.innerHTML = "";
        codigosGenerados.forEach(codigo => {
            const item = document.createElement("li");
            item.textContent = codigo;
            if (listaCodigos) listaCodigos.appendChild(item);
        });
        correlativo = codigosGenerados.length + 1;
        letraActual = codigosGenerados.length % 2 === 0 ? "A" : "B";
    }
    mostrarUltimoCodigoGenerado();
}
function generarCodigo() {
    if (!usuarioAdp || usuarioAdp.length !== 7) {
        mostrarToast("⚠️ Primero guarda tu usuario correctamente.");
        return;
    }
    const fecha = new Date();
    const dia = fecha.getDate().toString().padStart(2, "0");
    const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
    const anio = fecha.getFullYear();
    const codigo = `${correlativo}${usuarioAdp}${dia}${mes}${anio}${letraActual}`;
    codigosGenerados.push(codigo);
    guardarDatos();
    const codigoGenerado = document.getElementById("codigo-generado");
    if (codigoGenerado) codigoGenerado.textContent = codigo;
    letraActual = letraActual === "A" ? "B" : "A";
    correlativo++;
    const lista = document.getElementById("lista-codigos");
    const item = document.createElement("li");
    item.textContent = codigo;
    if (lista) lista.appendChild(item);
}
function eliminarUltimoCodigo() {
    if (codigosGenerados.length === 0) {
        mostrarToast("⚠️ No hay códigos para eliminar.");
        return;
    }
    codigosGenerados.pop();
    correlativo = Math.max(1, correlativo - 1);
    letraActual = letraActual === "A" ? "B" : "A";
    guardarDatos();
    const lista = document.getElementById("lista-codigos");
    if (lista && lista.lastElementChild) {
        lista.removeChild(lista.lastElementChild);
    }
    mostrarUltimoCodigoGenerado();
}
function limpiarCodigosVisuales() {
    const listaCodigos = document.getElementById("lista-codigos");
    if (listaCodigos) listaCodigos.innerHTML = "";
    const codigoGenerado = document.getElementById("codigo-generado");
    if (codigoGenerado) codigoGenerado.textContent = "";
}

// === LÓGICA DE TO-DO LIST ===
function saveTareas() {
    localStorage.setItem(`filtro_tareas_${usuarioAdp || 'anonimo'}`, filtroActual);
}

function renderTareas() {
    const taskList = document.getElementById('task-list');
    if (!taskList) return;

    taskList.innerHTML = '';

    const tareasFiltradas = tareas.filter(task => {
        if (filtroActual === 'all') return true;
        if (filtroActual === 'pending') return !task.completada;
        if (filtroActual === 'completed') return task.completada;
    });

    if (tareasFiltradas.length === 0) {
        taskList.innerHTML = `<p class="empty-state-message">No hay tareas para mostrar en esta fecha.</p>`;
        return;
    }

    tareasFiltradas.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.classList.add(task.completada ? 'attended' : 'in-attention');
        li.dataset.id = task.id;

        li.innerHTML = `
            <input type="checkbox" ${task.completada ? 'checked' : ''}>
            <div class="task-text-container" style="width: 100%;">
                <div class="task-title" contenteditable="true">${task.titulo}</div>
                <div class="task-description" contenteditable="true">${task.descripcion}</div>
            </div>
            <button class="delete-task-btn" title="Eliminar">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#EA3323">
                    <path d="M280-120q-33 0-56.5-23.5T200-200v-520q-17 0-28.5-11.5T160-760q0-17 11.5-28.5T200-800h160q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800h160q17 0 28.5 11.5T800-760q0 17-11.5 28.5T760-720v520q0 33-23.5 56.5T680-120H280Zm120-160q17 0 28.5-11.5T440-320v-280q0-17-11.5-28.5T400-640q-17 0-28.5 11.5T360-600v280q0 17 11.5 28.5T400-280Zm160 0q17 0 28.5-11.5T600-320v-280q0-17-11.5-28.5T560-640q-17 0-28.5 11.5T520-600v280q0 17 11.5 28.5T560-280Z"/>
                </svg>
            </button>
        `;
        taskList.appendChild(li);
    });
}

// MODIFICADA: Si estás filtrando por otra fecha, al añadir una nueva tarea, vuelve al día de hoy.
async function addTarea() {
    const newTaskInput = document.getElementById('new-task-input');
    if (!newTaskInput) return;
    const texto = newTaskInput.value.trim();
    if (!texto) return;

    const pendientes = tareas.filter(t => !t.completada);
    if (pendientes.length >= 6) {
        mostrarToast("Regulariza tus plantillas antes de agregar más");
        return;
    }

    const nueva = {
        id: Date.now(),
        titulo: texto,
        descripcion: '',
        completada: false,
        fechaCreacion: new Date().toISOString()
    };

    tareas.push(nueva);
    await guardarTareaIndexedDB(nueva);
    newTaskInput.value = '';
    
    // Si la fecha seleccionada no es hoy, vuelve a la fecha de hoy al agregar una nueva tarea
    if (fechaSeleccionada !== fechaHoy) {
      fechaSeleccionada = fechaHoy;
      const dateInput = document.getElementById('date-input');
      const fechaDisplay = document.getElementById('fecha-display');
      if (dateInput) dateInput.value = fechaHoy;
      if (fechaDisplay) fechaDisplay.textContent = "Hoy";
      await actualizarVistaTareas(fechaSeleccionada);
    } else {
      renderTareas();
    }
}

// === FUNCIÓN CORREGIDA ===
async function actualizarVistaTareas(fecha) {
    try {
        // La función obtenerTareasPorFecha espera la fecha en formato 'YYYY-MM-DD'
        tareas = await obtenerTareasPorFecha(fecha);
        renderTareas();
    } catch (error) {
        console.error("Error al cargar las tareas para la fecha seleccionada:", error);
        mostrarToast("❌ Error al cargar las tareas.");
    }
}

// === CÓDIGO PRINCIPAL: INICIALIZACIÓN ===
document.addEventListener("DOMContentLoaded", async () => {
    // === Variables y elementos del DOM para la sesión ===
    const modal = document.querySelector("#modal");
    const btnGuardar = document.querySelector("#btn-guardar");
    const btnSinCredenciales = document.querySelector("#btn-sin-credenciales");
    const btnAbrirModal = document.querySelector("#btn-abrir-modal");
    const btnCerrarSesion = document.querySelector("#cerrar-sesion");
    const inputAdp = document.querySelector("#input-adp");
    const inputUsuario = document.querySelector("#input-usuario");
    const userCredentials = document.querySelector("#user-credentials");
    const spanAdp = userCredentials ? userCredentials.querySelector(".adp") : null;
    const spanUsuario = userCredentials ? userCredentials.querySelector("span:last-child") : null;
    const confirmDialog = document.querySelector("#confirmar-cierre-sesion");
    const btnConfirmarCerrarSesion = document.querySelector("#confirmar-cerrar-sesion");
    const btnCancelarCerrarSesion = document.querySelector("#cancelar-cerrar-sesion");

    // === Carga e inicialización de la To-Do List ===
    const openTodoBtn = document.getElementById('open-todo-btn');
    const closeTodoBtn = document.getElementById('close-todo-btn');
    const todoDialog = document.getElementById('todo-dialog');
    const newTaskInput = document.getElementById('new-task-input');
    const taskList = document.getElementById('task-list');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const clearAllTasksBtn = document.getElementById('clear-all-tasks-btn');
    const downloadTasksBtn = document.getElementById('download-tasks-btn');
    
    // --- NUEVOS ELEMENTOS PARA EL FILTRO POR FECHA ---
    const dateSelectorBtn = document.getElementById('date-selector-btn');
    const dateInputContainer = document.getElementById('date-input-container');
    const dateInput = document.getElementById('date-input');
    const fechaDisplay = document.getElementById('fecha-display');

    try {
        await abrirIndexedDB();
        // Inicializamos la vista con las tareas de hoy por defecto
        await actualizarVistaTareas(fechaHoy);
    } catch (error) {
        console.error("Error al inicializar la To-Do List:", error);
        mostrarToast("❌ Error al cargar las tareas iniciales.");
    }
    
    // Inicializar el input de fecha con la fecha de hoy
    if (dateInput) dateInput.value = fechaHoy;
    if (fechaDisplay) fechaDisplay.textContent = "Hoy";

    // === Lógica inicial de carga de sesión ===
    function cargarCredenciales() { // Movida aquí para que tenga acceso a los elementos del DOM
        const adpGuardado = localStorage.getItem("adpNombre");
        const usuarioGuardado = localStorage.getItem("adpUsuario");
        if (adpGuardado && usuarioGuardado) {
            nombreAsesor = adpGuardado;
            usuarioAdp = usuarioGuardado;
            if (spanAdp) spanAdp.textContent = nombreAsesor;
            if (spanUsuario) spanUsuario.textContent = usuarioAdp;
            toggleElementVisibility(userCredentials, true);
            toggleElementVisibility(btnAbrirModal, false);
            document.querySelectorAll(".adp").forEach(span => {
                span.textContent = nombreAsesor;
            });
            cargarDatosGuardados();
        } else {
            if (modal) modal.showModal();
        }
    }
    cargarCredenciales(); // Llamada a la función

    // === Event listeners para la sesión ===
    if (btnAbrirModal) {
        btnAbrirModal.addEventListener("click", () => {
            if (modal) modal.showModal();
        });
    }
    if (btnGuardar) {
        btnGuardar.addEventListener("click", () => {
            const nombre = inputAdp.value.trim();
            const usuario = inputUsuario.value.trim().toUpperCase();
            if (nombre && usuario.length === 7) {
                localStorage.setItem("adpNombre", nombre);
                localStorage.setItem("adpUsuario", usuario);
                nombreAsesor = nombre;
                usuarioAdp = usuario;
                if (spanAdp) spanAdp.textContent = nombreAsesor;
                if (spanUsuario) spanUsuario.textContent = usuarioAdp;
                toggleElementVisibility(userCredentials, true);
                toggleElementVisibility(btnAbrirModal, false);
                document.querySelectorAll(".adp").forEach(span => {
                    span.textContent = nombreAsesor;
                });
                cerrarDialogConAnimacion(modal);
                cargarDatosGuardados();
            } else {
                mostrarToast("⚠️ Por favor, completa los datos correctamente.");
            }
        });
    }
    if (btnSinCredenciales) {
        btnSinCredenciales.addEventListener("click", () => {
            cerrarDialogConAnimacion(modal);
        });
    }
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", () => {
            if (confirmDialog) confirmDialog.showModal();
        });
    }
    if (btnConfirmarCerrarSesion) {
        btnConfirmarCerrarSesion.addEventListener("click", () => {
            localStorage.removeItem("adpNombre");
            localStorage.removeItem("adpUsuario");
            toggleElementVisibility(userCredentials, false);
            toggleElementVisibility(btnAbrirModal, true);
            if (spanAdp) spanAdp.textContent = "";
            if (spanUsuario) spanUsuario.textContent = "";
            document.querySelectorAll(".adp").forEach(span => {
                span.textContent = "";
            });
            nombreAsesor = "";
            usuarioAdp = "";
            codigosGenerados = [];
            const listaCodigos = document.getElementById("lista-codigos");
            if (listaCodigos) listaCodigos.innerHTML = "";
            const codigoGenerado = document.getElementById("codigo-generado");
            if (codigoGenerado) codigoGenerado.textContent = "";
            if (confirmDialog) confirmDialog.close();
            if (modal) modal.showModal();
        });
    }
    if (btnCancelarCerrarSesion) {
        btnCancelarCerrarSesion.addEventListener("click", () => {
            if (confirmDialog) confirmDialog.close();
        });
    }

    // === Event listeners para la To-Do List ===
    if (openTodoBtn) {
        openTodoBtn.addEventListener('click', () => {
            if (todoDialog) {
                // Siempre que se abre el modal, cargamos las tareas de hoy
                fechaSeleccionada = fechaHoy;
                if (dateInput) dateInput.value = fechaHoy;
                if (fechaDisplay) fechaDisplay.textContent = "Hoy";
                actualizarVistaTareas(fechaSeleccionada);
                todoDialog.showModal();
            }
        });
    }
    if (closeTodoBtn) {
        closeTodoBtn.addEventListener('click', () => {
            cerrarDialogConAnimacion(todoDialog);
        });
    }
    if (taskList) {
        taskList.addEventListener('click', async (e) => {
            const li = e.target.closest('.task-item');
            if (!li) return;
            const id = parseInt(li.dataset.id);
            if (e.target.tagName === 'INPUT') {
                const tarea = tareas.find(t => t.id === id);
                if (tarea) {
                    tarea.completada = !tarea.completada;
                    await guardarTareaIndexedDB(tarea);
                    renderTareas();
                }
                return;
            }
            if (e.target.closest('.delete-task-btn')) {
                tareas = tareas.filter(t => t.id !== id);
                await eliminarTareaIndexedDB(id);
                renderTareas();
            }
        });
        taskList.addEventListener('input', async (e) => {
            const li = e.target.closest('.task-item');
            if (!li) return;
            const id = parseInt(li.dataset.id);
            const tarea = tareas.find(t => t.id === id);
            if (!tarea) return;
            if (e.target.classList.contains('task-title')) {
                tarea.titulo = e.target.textContent.trim();
            }
            if (e.target.classList.contains('task-description')) {
                tarea.descripcion = e.target.textContent.trim();
            }
            await guardarTareaIndexedDB(tarea);
        });
    }
    if (newTaskInput) {
        newTaskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTarea();
            }
        });
    }
    filterButtons.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                filtroActual = btn.id.replace('filter-', '');
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                saveTareas();
                renderTareas();
            });
        }
    });
    if (clearAllTasksBtn) {
        clearAllTasksBtn.addEventListener('click', async () => {
            tareas = [];
            await eliminarTodasLasTareasIndexedDB();
            renderTareas();
        });
    }
    if (downloadTasksBtn) {
        downloadTasksBtn.addEventListener('click', () => {
            if (tareas.length === 0) {
                mostrarToast("No hay tareas para descargar.");
                return;
            }
            let contenido = "LISTA DE PLANTILLAS\n====================\n\n";
            tareas.forEach((t, i) => {
                const estado = t.completada ? "✅ Completada" : "⏳ Pendiente";
                contenido += `Plantilla ${i + 1}\nTítulo: ${t.titulo}\n${t.descripcion || "(Sin descripción)"}\nEstado: ${estado}\n\n`;
            });
            const blob = new Blob([contenido], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tareas-${new Date().toLocaleDateString('es-PE')}.txt`;
            a.click();
            URL.revokeObjectURL(url);
            mostrarToast("Plantillas descargadas");
        });
    }

    // === NUEVOS EVENT LISTENERS PARA EL FILTRO POR FECHA ===
    if (dateSelectorBtn && dateInputContainer && dateInput) {
        dateSelectorBtn.addEventListener('click', () => {
            dateInput.click();
        });

        dateInput.addEventListener('change', (event) => {
            const nuevaFecha = event.target.value;
            fechaSeleccionada = nuevaFecha;
            const fechaTitulo = new Date(nuevaFecha + 'T00:00:00').toLocaleDateString();
            if (fechaDisplay) fechaDisplay.textContent = nuevaFecha === fechaHoy ? "Hoy" : fechaTitulo;
            actualizarVistaTareas(fechaSeleccionada);
        });
    }
    
    // === Lógica de reagendamiento ===
    const datosReagendamiento = {
        CLARO: {
            "Errores en la generación de la SOT": [
                "Pérdida de fecha de agendamiento",
                "Caída masiva en sistemas Claro"
            ],
            "Inconvenientes con la contratista": [
                "Inasistencia de cuadrillas de la contratista",
                "Retraso de técnicos de la contratista",
                "Incidencias en el campo durante la instalación",
                "Falta de materiales: Detallar material",
                "Retiro anticipado de cuadrillas en campo",
                "Falta de herramientas"
            ],
            "Configuraciones de TOA (OFSC)": [
                "Sobreegandamiento de cuotas",
                "Problemas con las configuraciones de zonas de trabajo",
                "Cuota configurada incorrectamente"
            ]
        },
        CLIENTE: {
            "A solicitud del Cliente": [
                "Cambios en las fechas y franjas solicitadas",
                "Cliente se encuentra de viaje",
                "Solo puede domingos, horarios especiales, noche.",
                "Cliente desconoce su fecha de agendamiento"
            ],
            "Facilidades del cliente": [
                "Cliente no cuenta con equipos en nuevo domicilio",
                "No brinda facilidades técnicas (ductos, permisos, etc.)",
                "Factores climatológicos"
            ],
            "Falta de contacto": ["Cliente no responde los 4 intentos de llamada"],
            "Ausente": ["Cliente Ausente en Campo"]
        }
    };
    function cargarEscenarios() {
        const tipoSelect = document.getElementById("tipo-reagendado");
        const escenarioSelect = document.getElementById("escenario");
        if (!tipoSelect || !escenarioSelect) return;

        const tipo = tipoSelect.value;
        escenarioSelect.innerHTML = "";
        const escenarios = datosReagendamiento[tipo];
        if (escenarios) {
            for (const esc in escenarios) {
                const opt = document.createElement("option");
                opt.value = esc;
                opt.textContent = esc;
                escenarioSelect.appendChild(opt);
            }
        }
        cargarMotivos();
    }
    function cargarMotivos() {
        const tipoSelect = document.getElementById("tipo-reagendado");
        const escenarioSelect = document.getElementById("escenario");
        const motivoSelect = document.getElementById("motivo");
        if (!tipoSelect || !escenarioSelect || !motivoSelect) return;

        const tipo = tipoSelect.value;
        const escenario = escenarioSelect.value;
        
        if (!datosReagendamiento[tipo] || !datosReagendamiento[tipo][escenario]) return;

        motivoSelect.innerHTML = "";
        datosReagendamiento[tipo][escenario].forEach(motivo => {
            const opt = document.createElement("option");
            opt.value = motivo;
            opt.textContent = motivo;
            motivoSelect.appendChild(opt);
        });
        actualizarPlantilla();
    }
    function actualizarPlantilla() {
        const tipoRepro = document.getElementById("tipo-reprogramado")?.value || "";
        const tipoReagen = document.getElementById("tipo-reagendado")?.value || "";
        const motivo = document.getElementById("motivo")?.value || "";
        const idLlamada = document.getElementById("id-llamada")?.value || "";
        const observacion = document.getElementById("observacion")?.value || "";
        const fechaVisita = document.getElementById("fecha-visita")?.value || "";
        const franjaVisita = document.getElementById("franja-visita")?.value || "";
        const nombreCliente = document.getElementById("nombre-cliente")?.value.trim() || "";
        const numeroCliente = document.getElementById("numero-cliente")?.value.trim() || "";
        let fechaFormateada = "";
        if (fechaVisita) {
            const [año, mes, dia] = fechaVisita.split('-');
            fechaFormateada = `${dia}/${mes}`;
        }
        const plantillaTexto = `MESA DE PROGRAMACIONES HITSS<br>
REPROGRAMADO EN ${tipoRepro} / REAGENDADO POR ${tipoReagen}<br>
CLIENTE:&nbsp;${nombreCliente}<br>
NÚMERO:&nbsp;${numeroCliente}<br>
NUEVA FECHA Y FRANJA DE VISITA:&nbsp;${fechaFormateada} - ${franjaVisita}<br>
MOTIVO DE REPROGRAMACIÓN: ${tipoReagen} # ${motivo}<br>
CONTRATA:&nbsp;<br>
ID DE LLAMADA:&nbsp;${idLlamada}<br>
OBSERVACIÓN:&nbsp;${observacion}<br>
REALIZADO POR: ${nombreAsesor || ""} - ADP MULTISKILL HITSS`;
        const plantillaContainer = document.getElementById("texto-plantilla-dinamica");
        if (plantillaContainer) plantillaContainer.innerHTML = plantillaTexto;
    }
    cargarEscenarios();
    document.getElementById("tipo-reprogramado")?.addEventListener("change", actualizarPlantilla);
    document.getElementById("tipo-reagendado")?.addEventListener("change", () => {
        cargarEscenarios();
        actualizarPlantilla();
    });
    document.getElementById("escenario")?.addEventListener("change", () => {
        cargarMotivos();
        actualizarPlantilla();
    });
    document.getElementById("motivo")?.addEventListener("change", actualizarPlantilla);
    document.getElementById("id-llamada")?.addEventListener("input", actualizarPlantilla);
    document.getElementById("observacion")?.addEventListener("input", actualizarPlantilla);
    document.getElementById("fecha-visita")?.addEventListener("change", actualizarPlantilla);
    document.getElementById("franja-visita")?.addEventListener("change", actualizarPlantilla);
    document.getElementById("nombre-cliente")?.addEventListener("input", actualizarPlantilla);
    document.getElementById("numero-cliente")?.addEventListener("input", actualizarPlantilla);
    
    // Actualización de fecha y hora en el DOM
    const fecha = new Date();
    const dia = fecha.getDate();
    const mes = fecha.toLocaleString("es-PE", { month: "long" });
    const anio = fecha.getFullYear();
    const horas = fecha.getHours().toString().padStart(2, "0");
    const minutos = fecha.getMinutes().toString().padStart(2, "0");
    const hora = `${horas}:${minutos}`;
    document.querySelectorAll(".dia").forEach(el => el.textContent = dia);
    document.querySelectorAll(".mes").forEach(el => el.textContent = mes);
    document.querySelectorAll(".anio").forEach(el => el.textContent = anio);
    document.querySelectorAll(".hora").forEach(el => el.textContent = hora);
    const copiarBtns = document.querySelectorAll(".copiar-enlace-btn");
    copiarBtns.forEach(btn => btn.addEventListener("click", copiarEnlace));
    
    // Funciones globales (window.generarCodigo, etc.)
    window.generarCodigo = generarCodigo;
    window.eliminarUltimoCodigo = eliminarUltimoCodigo;
    window.descargarCodigos = function () {
        if (codigosGenerados.length === 0) {
            mostrarToast("No hay códigos generados aún.");
            return;
        }
        const contenido = codigosGenerados.join("\n");
        const blob = new Blob([contenido], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement("a");
        enlace.href = url;
        enlace.download = "codigos-cambio-equipo.txt";
        enlace.click();
        URL.revokeObjectURL(url);
    }
    
    // Atajo de teclado para abrir la To-Do List
    window.addEventListener('keydown', (event) => {
        const isCtrlCmd = event.ctrlKey || event.metaKey;
        const isB = event.key.toLowerCase() === 'b';
        const todoDialog = document.getElementById('todo-dialog');
        if (isCtrlCmd && isB && todoDialog) {
            event.preventDefault();
            if (!todoDialog.open) {
                renderTareas();
                todoDialog.showModal();
            }
        }
    });
    
    // Manejo de pegado en campos editables
    document.addEventListener('paste', function (e) {
        if (!e.target.classList.contains('task-title')) return;
        e.preventDefault();
        const plainText = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, plainText);
    });

});