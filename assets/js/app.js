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

// --- VARIABLES PARA EL FILTRO POR FECHA ---
// Usamos el formato YYYY-MM-DD para compatibilidad
const hoy = new Date();
const anio = hoy.getFullYear();
const mes = String(hoy.getMonth() + 1).padStart(2, '0');
const dia = String(hoy.getDate()).padStart(2, '0');
const fechaHoy = `${anio}-${mes}-${dia}`;

let fechaSeleccionada = fechaHoy; // Guarda la fecha actual para comparar

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
                <div class="task-description" contenteditable="true"></div>
            </div>
            <button class="delete-task-btn" title="Eliminar">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#EA3323">
                    <path d="M280-120q-33 0-56.5-23.5T200-200v-520q-17 0-28.5-11.5T160-760q0-17 11.5-28.5T200-800h160q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800h160q17 0 28.5 11.5T800-760q0 17-11.5 28.5T760-720v520q0 33-23.5 56.5T680-120H280Zm120-160q17 0 28.5-11.5T440-320v-280q0-17-11.5-28.5T400-640q-17 0-28.5 11.5T360-600v280q0 17 11.5 28.5T400-280Zm160 0q17 0 28.5-11.5T600-320v-280q0-17-11.5-28.5T560-640q-17 0-28.5 11.5T520-600v280q0 17 11.5 28.5T560-280Z"/>
                </svg>
            </button>
        `;

        // Configurar la descripción preservando saltos de línea
        const descripcionElement = li.querySelector('.task-description');

        if (descripcionElement && task.descripcion) {
            // Usar directamente la descripción sin necesidad de limpiar
            descripcionElement.textContent = task.descripcion;
        }

        taskList.appendChild(li);
    });

    // Configurar event listeners usando delegation (solo una vez)
    setupTaskEditingListeners();
}

// Configurar event listeners para edición de tareas usando delegation
function setupTaskEditingListeners() {
    // Solo configurar una vez, no en cada render
    if (setupTaskEditingListeners.configured) return;
    setupTaskEditingListeners.configured = true;

    // Event listener para pegado en descripciones
    document.addEventListener('paste', function (event) {
        if (event.target.classList.contains('task-description')) {
            manejarPegadoDescripcion(event);
        } else if (event.target.classList.contains('task-title')) {
            manejarPegadoTitulo(event);
        }
    });

    // Event listener para guardado al perder foco
    document.addEventListener('blur', function (event) {
        if (event.target.classList.contains('task-description')) {
            const taskId = event.target.closest('.task-item').dataset.id;
            if (taskId) {
                actualizarTareaDescripcion(taskId, event.target.textContent);
            }
        } else if (event.target.classList.contains('task-title')) {
            const taskId = event.target.closest('.task-item').dataset.id;
            const tarea = tareas.find(t => t.id == taskId);
            if (tarea) {
                tarea.titulo = event.target.textContent;
                guardarTareaIndexedDB(tarea);
            }
        }
    }, true);
}

// Función para manejar pegado en títulos
function manejarPegadoTitulo(event) {
    event.preventDefault();
    const pasteData = (event.clipboardData || window.clipboardData).getData('text');
    if (pasteData) {
        // Limpiar saltos de línea del texto pegado para el título
        const textoLimpio = pasteData.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        // Insertar texto plano sin formato
        if (document.execCommand) {
            document.execCommand('insertText', false, textoLimpio);
        } else {
            // Fallback
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(document.createTextNode(textoLimpio));
                range.collapse(false);
            }
        }
    }
}

// Función para inicializar el sistema de tareas en todas las plantillas
function inicializarSistemaTareas() {
    const copiadores = document.querySelectorAll('.copiar-contenedor');

    copiadores.forEach(contenedor => {
        // Verificar si ya tiene el sistema de add-task
        const existeAddTask = contenedor.querySelector('.add-task');

        if (!existeAddTask) {
            // Crear el sistema de add-task
            const addTaskDiv = document.createElement('div');
            addTaskDiv.className = 'add-task';
            addTaskDiv.innerHTML = `
                <input type="text" class="input-task" placeholder="Agregar tarea">
                <span class="material-symbols-outlined add-task-btn" style="color: rgb(101, 101, 101); cursor: pointer;">add</span>
            `;

            // Insertar antes del copy-icon
            const copyIcon = contenedor.querySelector('.copy-icon');
            if (copyIcon) {
                contenedor.insertBefore(addTaskDiv, copyIcon);
            } else {
                contenedor.appendChild(addTaskDiv);
            }
        }
    });

    // Event delegation para manejar todos los inputs y botones de tareas
    setupTaskEventListeners();
}

// Configurar event listeners usando delegation
function setupTaskEventListeners() {
    // Event listener para inputs de tareas (Enter key)
    document.addEventListener('keypress', function (event) {
        if (event.target.classList.contains('input-task') && event.key === 'Enter') {
            agregarTarea(event.target);
        }
    });

    // Event listener para botones de agregar tarea
    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('add-task-btn')) {
            const input = event.target.parentElement.querySelector('.input-task');
            if (input) {
                agregarTarea(input);
            }
        }
    });
}

// Función para agregar tarea desde plantilla
async function agregarTarea(inputElement) {
    if (!inputElement) return;

    const texto = inputElement.value.trim();
    if (!texto) {
        mostrarToast("Por favor ingresa un título para la tarea");
        return;
    }

    // Verificar límite de tareas pendientes
    const pendientes = tareas.filter(t => !t.completada);
    if (pendientes.length >= 6) {
        mostrarToast("Regulariza tus plantillas antes de agregar más");
        return;
    }

    // Buscar la plantilla asociada al input
    const plantillaContainer = inputElement.closest('.plantilla');
    if (!plantillaContainer) {
        mostrarToast("No se pudo encontrar la plantilla asociada");
        return;
    }

    // Buscar el texto de la plantilla de manera más flexible
    let plantillaTexto = plantillaContainer.querySelector('#texto-plantilla');
    if (!plantillaTexto) {
        // Buscar cualquier párrafo que contenga contenido de plantilla
        const paragrafos = plantillaContainer.querySelectorAll('p');
        plantillaTexto = Array.from(paragrafos).find(p =>
            p.innerHTML.length > 50 && // Debe tener contenido sustancial
            !p.closest('.copiar-contenedor') // No debe estar en el contenedor de copia
        );
    }

    if (!plantillaTexto) {
        mostrarToast("No se pudo encontrar el texto de la plantilla");
        return;
    }

    // Obtener el texto de la plantilla usando la misma lógica que copiarPlantilla()
    let descripcionPlantilla = plantillaTexto.innerText || plantillaTexto.textContent;

    // Reemplazar placeholders dinámicos DESPUÉS de obtener el texto limpio
    if (nombreAsesor) {
        descripcionPlantilla = descripcionPlantilla.replace(/ADP MULTISKILL HITSS/g, `${nombreAsesor} - ADP MULTISKILL HITSS`);
    }

    // Reemplazar fechas dinámicas en el texto limpio
    const fecha = new Date();
    const dia = fecha.getDate();
    const mes = fecha.toLocaleString("es-PE", { month: "long" });
    const anio = fecha.getFullYear();
    const horas = fecha.getHours().toString().padStart(2, "0");
    const minutos = fecha.getMinutes().toString().padStart(2, "0");
    const hora = `${horas}:${minutos}`;

    // Generar saludo dinámico
    const saludoDinamico = obtenerSaludoDinamico();

    // Reemplazar todos los placeholders dinámicos de manera más eficiente
    const replacements = [
        { pattern: /\[dia\]/g, value: dia },
        { pattern: /\[mes\]/g, value: mes },
        { pattern: /\[anio\]/g, value: anio },
        { pattern: /\[hora\]/g, value: hora },
        { pattern: /\[saludo-dinamico\]/g, value: saludoDinamico }
    ];

    // Aplicar todos los reemplazos
    replacements.forEach(({ pattern, value }) => {
        descripcionPlantilla = descripcionPlantilla.replace(pattern, value);
    });

    // Crear nueva tarea
    const nueva = {
        id: Date.now(),
        titulo: texto,
        descripcion: descripcionPlantilla,
        completada: false,
        fechaCreacion: new Date().toISOString()
    };

    try {
        tareas.push(nueva);
        await guardarTareaIndexedDB(nueva);

        // Limpiar el input
        inputElement.value = '';

        mostrarToast("✅ Tarea creada exitosamente");

        // Abrir el modal de lista de tareas (usar el selector correcto)
        const todoDialog = document.getElementById('todo-dialog');
        if (todoDialog) {
            todoDialog.showModal();
        }

        // Actualizar vista de tareas si es necesario
        if (fechaSeleccionada !== fechaHoy) {
            fechaSeleccionada = fechaHoy;
            const dateInput = document.getElementById('date-input');
            if (dateInput) dateInput.value = fechaHoy;
            await actualizarVistaTareas(fechaSeleccionada);
        } else {
            renderTareas();
        }
    } catch (error) {
        console.error("Error al guardar la tarea:", error);
        mostrarToast("❌ Error al guardar la tarea");
    }
}

// Función para manejar pegado en descripciones de tareas
function manejarPegadoDescripcion(event) {
    event.preventDefault();

    // Obtener el texto del portapapeles
    const pasteData = (event.clipboardData || window.clipboardData).getData('text');
    if (!pasteData) return;

    // Ya no necesitamos limpiar HTML porque innerText ya devuelve texto limpio
    // Usar execCommand para insertar el texto en la posición del cursor
    if (document.execCommand) {
        document.execCommand('insertText', false, pasteData);
    } else {
        // Fallback para navegadores que no soportan execCommand
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(pasteData));
            range.collapse(false);
        }
    }

    // Guardar cambios
    setTimeout(() => {
        const taskId = event.target.closest('.task-item').dataset.id;
        if (taskId) {
            actualizarTareaDescripcion(taskId, event.target.textContent);
        }
    }, 10);
}

// Función para actualizar la descripción de una tarea
function actualizarTareaDescripcion(taskId, nuevaDescripcion) {
    const tarea = tareas.find(t => t.id == taskId);
    if (tarea) {
        tarea.descripcion = nuevaDescripcion;
        guardarTareaIndexedDB(tarea);
    }
}

// Función auxiliar para obtener saludo dinámico
function obtenerSaludoDinamico() {
    const hora = new Date().getHours();
    if (hora >= 6 && hora < 12) {
        return "Buenos días";
    } else if (hora >= 12 && hora < 18) {
        return "Buenas tardes";
    } else {
        return "Buenas noches";
    }
}

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
        fechaCreacion: new Date().toISOString() // Debe guardar la hora exacta
    };
    tareas.push(nueva);
    await guardarTareaIndexedDB(nueva);
    newTaskInput.value = '';
    if (fechaSeleccionada !== fechaHoy) {
        fechaSeleccionada = fechaHoy;
        const dateInput = document.getElementById('date-input');
        if (dateInput) dateInput.value = fechaHoy;
        await actualizarVistaTareas(fechaSeleccionada);
    } else {
        renderTareas();
    }
}

async function actualizarVistaTareas(fecha) {
    try {
        tareas = await obtenerTareasPorFecha(fecha);
        renderTareas();
    } catch (error) {
        console.error("Error al cargar las tareas para la fecha seleccionada:", error);
        mostrarToast("❌ Error al cargar las tareas.");
    }
}

// === CÓDIGO PRINCIPAL: INICIALIZACIÓN ===
document.addEventListener("DOMContentLoaded", async () => {
    // Inicializar sistema de tareas en todas las plantillas
    inicializarSistemaTareas();

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

    // --- ELEMENTO PARA EL FILTRO POR FECHA ---
    const dateInput = document.getElementById('date-input');

    if (dateInput) {
        // Configurar el valor inicial
        dateInput.value = fechaHoy;

        // Manejar el cambio de fecha
        dateInput.addEventListener('change', (e) => {
            const nuevaFecha = e.target.value;
            fechaSeleccionada = nuevaFecha;

            // Actualizar la vista de tareas
            actualizarVistaTareas(fechaSeleccionada);
        });
    }




    try {
        await abrirIndexedDB();
        await actualizarVistaTareas(fechaHoy);
    } catch (error) {
        console.error("Error al inicializar la To-Do List:", error);
        mostrarToast("❌ Error al cargar las tareas iniciales.");
    }

    if (dateInput) dateInput.value = fechaHoy;

    // === Lógica inicial de carga de sesión ===
    function cargarCredenciales() {
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
    cargarCredenciales();

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
                fechaSeleccionada = fechaHoy;
                if (dateInput) dateInput.value = fechaHoy;
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

    // === PDF limpio estilo Notion con jsPDF ===
    // === PDF limpio estilo Notion con jsPDF ===
    // === PDF limpio estilo Notion con jsPDF ===
    function descargarTareasPDF(tareas) {
        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();

            // Configurar metadatos
            pdf.setProperties({
                title: 'Plantillas Mesa de Seguimiento',
                author: nombreAsesor || 'Usuario',
                subject: 'Hitss Peru'
            });

            // Variables de layout
            let yPos = 25;
            const margen = 20;
            const anchoPage = 170;
            const fecha = new Date().toLocaleDateString('es-PE');
            const usuario = nombreAsesor || 'Usuario';

            // === HEADER PRINCIPAL ===
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(24);
            pdf.setTextColor(0, 102, 204); // Azul similar a la imagen
            pdf.text("Plantillas Mesa de Seguimiento", margen, yPos);

            yPos += 10;
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(12);
            pdf.setTextColor(120, 120, 120);
            pdf.text("Reporte generado desde Hitss Peru", margen, yPos);

            yPos += 12; // Reducido de 20 a 12

            // === LÍNEA SEPARADORA ===
            pdf.setDrawColor(200, 200, 200);
            pdf.setLineWidth(0.5); // Reducido de 1 a 0.5 - más delgado
            pdf.line(margen, yPos, margen + anchoPage, yPos);

            yPos += 12; // Reducido de 15 a 12 - aún menos espaciado

            // === INFORMACIÓN SIMPLE ===
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(11);
            pdf.setTextColor(80, 80, 80);

            pdf.text(`Fecha de generación:`, margen, yPos);
            pdf.text(`${fecha}`, margen + 80, yPos);

            yPos += 8;
            pdf.text(`Usuario:`, margen, yPos);
            pdf.text(`${usuario}`, margen + 80, yPos);

            yPos += 8;
            pdf.text(`Total de plantillas:`, margen, yPos);
            pdf.text(`${tareas.length}`, margen + 80, yPos);

            yPos += 25;

            // === TAREAS ESTILO NOTION ===
            tareas.forEach((tarea, index) => {
                // Calcular altura estimada de la tarea completa
                let alturaEstimada = 35; // Altura base (título + estado + divider)

                if (tarea.descripcion) {
                    const lineasDesc = pdf.splitTextToSize(tarea.descripcion, anchoPage - 15);
                    alturaEstimada += Math.min(lineasDesc.length * 4, 50) + 8;
                } else {
                    alturaEstimada += 18; // Quote vacío
                }

                // Verificar si la tarea completa cabe en la página actual
                if (yPos + alturaEstimada > 270) { // Margen inferior más conservador
                    pdf.addPage();
                    yPos = 25;
                }

                // === H2 CON FONDO DE COLOR (estilo Notion) ===
                const colorFondo = tarea.completada ? [40, 167, 69] : [255, 193, 7]; // Verde o Amarillo
                const colorTexto = tarea.completada ? [255, 255, 255] : [33, 37, 41]; // Blanco o Negro

                // Fondo del título (como highlight en Notion)
                pdf.setFillColor(...colorFondo);
                const tituloTexto = `${index + 1}. ${tarea.titulo}`;
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(14);
                const anchoTitulo = pdf.getTextWidth(tituloTexto) + 8;
                const altoTitulo = 10; // Aumentado de 8 a 10 para mejor centrado

                // Rectángulo redondeado personalizado
                const x = margen;
                const y = yPos - 6;
                const w = anchoTitulo;
                const h = altoTitulo;
                const r = 3; // Radio de las esquinas redondeadas

                // Crear rectángulo con bordes redondeados
                pdf.roundedRect(x, y, w, h, r, r, 'F');

                // Texto del título sobre el fondo - mejor centrado
                pdf.setTextColor(...colorTexto);
                pdf.text(tituloTexto, margen + 4, yPos + 1); // Ajustado +1 para centrado vertical

                yPos += 8; // Reducido de 12 a 8

                // === ESTADO SIMPLE ===
                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(10);
                pdf.setTextColor(100, 100, 100);
                const estado = tarea.completada ? "Completado" : "Pendiente";
                pdf.text(estado, margen, yPos);

                yPos += 6; // Reducido de 10 a 6

                // === QUOTE BLOCK (como en Notion) ===
                if (tarea.descripcion) {
                    // Línea lateral del quote (como en Notion)
                    pdf.setDrawColor(200, 200, 200);
                    pdf.setLineWidth(1);

                    // Calcular altura del contenido
                    pdf.setFont("consolas", "bold"); // Fuente monoespaciada Consolas
                    pdf.setFontSize(10); // Aumentado de 9 a 10
                    const lineas = pdf.splitTextToSize(tarea.descripcion, anchoPage - 15);
                    const alturaQuote = Math.min(lineas.length * 4, 50);

                    // Línea lateral izquierda del quote
                    pdf.line(margen, yPos, margen, yPos + alturaQuote);

                    // Contenido del quote con padding - texto más oscuro
                    pdf.setTextColor(40, 40, 40); // Cambiado de (70, 70, 70) a (40, 40, 40) - más oscuro
                    pdf.text(lineas.slice(0, 12), margen + 8, yPos + 3);

                    yPos += alturaQuote + 2; // Reducido de 3 a 2
                } else {
                    // Quote vacío estilo Notion
                    pdf.setDrawColor(200, 200, 200);
                    pdf.setLineWidth(3);
                    pdf.line(margen, yPos, margen, yPos + 8);

                    pdf.setFont("helvetica", "italic");
                    pdf.setFontSize(9);
                    pdf.setTextColor(150, 150, 150);
                    pdf.text("Sin contenido", margen + 8, yPos + 5);

                    yPos += 10; // Reducido de 12 a 10
                }

                // === DIVIDER ENTRE TAREAS ===
                pdf.setDrawColor(180, 180, 180); // Cambiado de (240, 240, 240) a gris más oscuro
                pdf.setLineWidth(0.3);
                pdf.line(margen, yPos, margen + anchoPage, yPos);
                yPos += 8; // Reducido de 15 a 8
            });

            // === FOOTER MINIMALISTA ===
            const totalPaginas = pdf.internal.getNumberOfPages();
            for (let i = 1; i <= totalPaginas; i++) {
                pdf.setPage(i);

                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(9); // Ligeramente más grande
                pdf.setTextColor(120, 120, 120); // Un poco más oscuro

                // Footer izquierda: "Documento - Empresa"
                const footerLeft = "Plantillas Mesa de Seguimiento - Hitss Peru";
                pdf.text(footerLeft, margen, 285);

                // Footer derecha: "X de Y"
                if (totalPaginas > 1) {
                    const footerRight = `${i} de ${totalPaginas}`;
                    const rightWidth = pdf.getTextWidth(footerRight);
                    pdf.text(footerRight, margen + anchoPage - rightWidth, 285);
                }
            }

            // Guardar PDF
            const nombreArchivo = `plantillas-notion-${fecha.replace(/\//g, '-')}.pdf`;
            pdf.save(nombreArchivo);

            mostrarToast('📄 PDF estilo Notion generado');

        } catch (error) {
            console.error('Error al generar PDF:', error);
            mostrarToast('❌ Error al generar PDF');
        }
    }

    // === Función para generar contenido Markdown ===
    function generarMarkdown(tareas) {
        const fecha = new Date().toLocaleDateString('es-PE');
        const usuario = nombreAsesor || 'Usuario';

        let markdown = `# 📋 Plantillas Mesa de Seguimiento

> **Reporte generado desde Hitss Peru**

---

## 📊 Información del Reporte

| Campo | Valor |
|-------|-------|
| **Fecha de generación** | ${fecha} |
| **Usuario** | ${usuario} |
| **Total de plantillas** | ${tareas.length} |

---

## 📝 Plantillas

`;

        // Agregar cada tarea
        tareas.forEach((tarea, index) => {
            const estado = tarea.completada ? '✅ **COMPLETADA**' : '⏳ **PENDIENTE**';
            const estadoClass = tarea.completada ? 'status-completed' : 'status-pending';

            markdown += `### ${index + 1}. ${tarea.titulo}

**Estado:** <span class="${estadoClass}">${estado}</span>

`;

            if (tarea.descripcion) {
                // Escapar caracteres especiales en el código
                const descripcionEscapada = tarea.descripcion
                    .replace(/`/g, '\\`')
                    .replace(/\*/g, '\\*')
                    .replace(/_/g, '\\_');

                markdown += `**Contenido de la plantilla:**

\`\`\`
${descripcionEscapada}
\`\`\`

`;
            } else {
                markdown += `*Sin descripción disponible*

`;
            }

            markdown += `---

`;
        });

        // Footer
        markdown += `## 📞 Información de Contacto

**Plantillas Mesa de Seguimiento - Hitss Peru**

*Documento generado automáticamente el ${fecha}*
`;

        return markdown;
    }

    if (downloadTasksBtn) {
        downloadTasksBtn.addEventListener('click', async () => {
            if (tareas.length === 0) {
                mostrarToast("No hay tareas para descargar.");
                return;
            }

            // Generar PDF estilo Notion directamente
            descargarTareasPDF(tareas);
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
        const contrata = document.getElementById("contrata")?.value || "";
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
CONTRATA:&nbsp;${contrata}<br>
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
    document.getElementById("contrata")?.addEventListener("change", actualizarPlantilla);
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

    window.generarCodigo = generarCodigo;
    window.eliminarUltimoCodigo = eliminarUltimoCodigo;
    window.copiarEnlace = copiarEnlace; // Agregar esta línea
    window.agregarTarea = agregarTarea; // Agregar función para crear tareas desde plantillas
    window.descardarCodigos = function () {
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

    // app.js

    // ... (resto del código anterior)

    // === LÓGICA DE PEGADO (CORRECCIÓN FINAL) ===
    document.addEventListener('paste', function (e) {
        // Verificamos si el foco está en un elemento editable
        if (e.target.classList.contains('task-title') ||
            e.target.classList.contains('input-task') ||
            e.target.classList.contains('task-description') ||
            e.target.tagName === 'TEXTAREA') {

            e.preventDefault();

            // Obtenemos el texto plano del portapapeles
            const textoParaPegar = (e.clipboardData || window.clipboardData).getData('text/plain');

            // Limpiamos el texto pegado de espacios y otros caracteres no deseados
            const textoLimpio = textoParaPegar
                .replace(/\u00A0/g, ' ')
                .replace(/[ \t]+/g, ' ')
                .replace(/\n[ \t]+/g, '\n')
                .replace(/[ \t]+\n/g, '\n')
                .trim();

            // Usamos document.execCommand para insertar el texto plano
            // en la posición actual del cursor. Esto evita que se borre
            // el contenido existente y que se pegue el formato.
            if (document.execCommand) {
                document.execCommand('insertText', false, textoLimpio);
            } else {
                // Fallback para navegadores que no soportan execCommand
                const start = e.target.selectionStart;
                const end = e.target.selectionEnd;
                e.target.value = e.target.value.substring(0, start) + textoLimpio + e.target.value.substring(end);
                e.target.selectionStart = e.target.selectionEnd = start + textoLimpio.length;
            }
        }
    });

    // ... (resto del código, después de esta función)

    // Función utilitaria para limpiar tareas existentes con formato corrupto
    window.limpiarTareasExistentes = async function () {
        try {
            const todasLasTareas = await obtenerTodasTareasIndexedDB();
            let tareasLimpiadas = 0;

            for (const tarea of todasLasTareas) {
                if (tarea.descripcion && tarea.descripcion.includes('<')) {
                    const descripcionLimpia = limpiarHTMLParaTarea(tarea.descripcion);
                    if (descripcionLimpia !== tarea.descripcion) {
                        tarea.descripcion = descripcionLimpia;
                        await guardarTareaIndexedDB(tarea);
                        tareasLimpiadas++;
                    }
                }
            }

            if (tareasLimpiadas > 0) {
                mostrarToast(`✅ ${tareasLimpiadas} tareas limpiadas`);
                // Recargar las tareas actuales
                await actualizarVistaTareas(fechaSeleccionada);
            } else {
                mostrarToast("ℹ️ No se encontraron tareas para limpiar");
            }
        } catch (error) {
            console.error("Error limpiando tareas:", error);
            mostrarToast("❌ Error al limpiar tareas");
        }
    };

    // Función para limpiar el formulario de reprogramación
    window.limpiarFormularioReprogramacion = function () {
        // Resetear selects a valores por defecto
        const tipoReprogramado = document.getElementById("tipo-reprogramado");
        if (tipoReprogramado) tipoReprogramado.value = "MESA";

        const tipoReagendado = document.getElementById("tipo-reagendado");
        if (tipoReagendado) tipoReagendado.value = "CLARO";

        // Resetear contrata al primer valor (Saval)
        const contrata = document.getElementById("contrata");
        if (contrata) contrata.value = "Saval";

        // Limpiar inputs de texto
        const nombreCliente = document.getElementById("nombre-cliente");
        if (nombreCliente) nombreCliente.value = "";

        const numeroCliente = document.getElementById("numero-cliente");
        if (numeroCliente) numeroCliente.value = "";

        const idLlamada = document.getElementById("id-llamada");
        if (idLlamada) idLlamada.value = "";

        // Limpiar fecha de visita
        const fechaVisita = document.getElementById("fecha-visita");
        if (fechaVisita) fechaVisita.value = "";

        // Resetear franja de visita al primer valor
        const franjaVisita = document.getElementById("franja-visita");
        if (franjaVisita) franjaVisita.value = "AM1";

        // Limpiar textarea de observación
        const observacion = document.getElementById("observacion");
        if (observacion) observacion.value = "";

        // Recargar escenarios para resetear los selects dependientes
        cargarEscenarios();

        // Actualizar la plantilla con los valores por defecto
        actualizarPlantilla();

        // Mostrar mensaje de confirmación
        mostrarToast("✅ Formulario limpiado correctamente");
    };

});