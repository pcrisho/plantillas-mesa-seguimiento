function mostrarToast(mensaje = "Plantilla copiada") {
    const toast = document.getElementById("toast");

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

            // Verificamos si hay más mensajes en la cola
            if (toastQueue.length > 0) {
                const siguienteMensaje = toastQueue.shift();
                mostrarToast(siguienteMensaje);
            }
        }, 300); // espera a que termine la animación de salida
    }, 2000);
}


document.addEventListener("DOMContentLoaded", () => {

    const modal = document.querySelector("#modal");
    const btnGuardar = document.querySelector("#btn-guardar");
    const btnSinCredenciales = document.querySelector("#btn-sin-credenciales");
    const btnAbrirModal = document.querySelector("#btn-abrir-modal");
    const btnCerrarSesion = document.querySelector("#cerrar-sesion");

    const inputAdp = document.querySelector("#input-adp");
    const inputUsuario = document.querySelector("#input-usuario");

    const userCredentials = document.querySelector("#user-credentials");
    const spanAdp = userCredentials.querySelector(".adp");
    const spanUsuario = userCredentials.querySelector("span:last-child");

    // Confirmar cierre de sesión
    const confirmDialog = document.querySelector("#confirmar-cierre-sesion");
    const btnConfirmarCerrarSesion = document.querySelector("#confirmar-cerrar-sesion");
    const btnCancelarCerrarSesion = document.querySelector("#cancelar-cerrar-sesion");


    ///

    let nombreAsesor = "";
    let usuarioAdp = "";

    let correlativo = 1;
    let letraActual = "A";
    let codigosGenerados = [];

    // --- FUNCIONES PARA CÓDIGOS ---
    function claveUsuario() {
        return `codigos_${usuarioAdp}`;
    }

    function guardarDatos() {
        const fecha = new Date().toDateString();
        const clave = `codigos_${usuarioAdp}`;
        localStorage.setItem(clave, JSON.stringify({
            fecha,
            codigos: codigosGenerados
        }));
    }


    function mostrarUltimoCodigoGenerado() {
        const ult = codigosGenerados[codigosGenerados.length - 1] || "";
        document.getElementById("codigo-generado").textContent = ult;
    }

    function cargarDatosGuardados() {
        if (!usuarioAdp) return;

        const clave = `codigos_${usuarioAdp}`;
        const data = JSON.parse(localStorage.getItem(clave));

        const fechaActual = new Date().toDateString();

        if (!data || data.fecha !== fechaActual) {
            codigosGenerados = [];
            correlativo = 1;
            letraActual = "A";
            localStorage.setItem(clave, JSON.stringify({ fecha: fechaActual, codigos: [] }));
            document.getElementById("lista-codigos").innerHTML = "";
        } else {
            codigosGenerados = data.codigos;
            document.getElementById("lista-codigos").innerHTML = "";

            codigosGenerados.forEach(codigo => {
                const item = document.createElement("li");
                item.textContent = codigo;
                document.getElementById("lista-codigos").appendChild(item);
            });

            correlativo = codigosGenerados.length + 1;
            letraActual = codigosGenerados.length % 2 === 0 ? "A" : "B";
        }

        mostrarUltimoCodigoGenerado();
    }



    function generarCodigo() {
        if (!usuarioAdp || usuarioAdp.length !== 7) {
            alert("⚠️ Primero guarda tu usuario correctamente.");
            return;
        }

        const fecha = new Date();
        const dia = fecha.getDate().toString().padStart(2, "0");
        const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
        const anio = fecha.getFullYear();
        const codigo = `${correlativo}${usuarioAdp}${dia}${mes}${anio}${letraActual}`;

        codigosGenerados.push(codigo);
        guardarDatos();

        document.getElementById("codigo-generado").textContent = codigo;

        letraActual = letraActual === "A" ? "B" : "A";
        correlativo++;

        const lista = document.getElementById("lista-codigos");
        const item = document.createElement("li");
        item.textContent = codigo;
        lista.appendChild(item);
    }

    function eliminarUltimoCodigo() {
        if (codigosGenerados.length === 0) {
            alert("⚠️ No hay códigos para eliminar.");
            return;
        }

        codigosGenerados.pop();
        correlativo = Math.max(1, correlativo - 1);
        letraActual = letraActual === "A" ? "B" : "A";

        guardarDatos();

        const lista = document.getElementById("lista-codigos");
        if (lista.lastElementChild) {
            lista.removeChild(lista.lastElementChild);
        }

        mostrarUltimoCodigoGenerado();
    }

    function limpiarCodigosVisuales() {
        document.getElementById("lista-codigos").innerHTML = "";
        document.getElementById("codigo-generado").textContent = "";
    }

    // --- FUNCIONES DE SESIÓN ---
    function cargarCredenciales() {
        const adpGuardado = localStorage.getItem("adpNombre");
        const usuarioGuardado = localStorage.getItem("adpUsuario");

        if (adpGuardado && usuarioGuardado) {
            nombreAsesor = adpGuardado;
            usuarioAdp = usuarioGuardado;

            spanAdp.textContent = nombreAsesor;
            spanUsuario.textContent = usuarioAdp;

            userCredentials.style.display = "flex";
            btnAbrirModal.style.display = "none";

            document.querySelectorAll(".adp").forEach(span => {
                span.textContent = nombreAsesor;
            });

            cargarDatosGuardados();
        } else {
            modal.showModal();
        }
    }

    // --- EVENTOS ---
    btnAbrirModal.addEventListener("click", () => {
        modal.showModal();
    });

    btnGuardar.addEventListener("click", () => {
        const nombre = inputAdp.value.trim();
        const usuario = inputUsuario.value.trim().toUpperCase();

        if (nombre && usuario.length === 7) {
            localStorage.setItem("adpNombre", nombre);
            localStorage.setItem("adpUsuario", usuario);

            nombreAsesor = nombre;
            usuarioAdp = usuario;

            spanAdp.textContent = nombreAsesor;
            spanUsuario.textContent = usuarioAdp;
            toggleElementVisibility(userCredentials, true);
            toggleElementVisibility(btnAbrirModal, false);

            document.querySelectorAll(".adp").forEach(span => {
                span.textContent = nombreAsesor;
            });

            cerrarDialogConAnimacion(modal);;
            cargarDatosGuardados();
        } else {
            alert("⚠️ Por favor, completa los datos correctamente.");
        }

        cargarDatosGuardados();
    });

    btnSinCredenciales.addEventListener("click", () => {
        cerrarDialogConAnimacion(modal);;
    });

    btnCerrarSesion.addEventListener("click", () => {
        confirmDialog.showModal();
    });

    // Confirmar cierre
    btnConfirmarCerrarSesion.addEventListener("click", () => {
        localStorage.removeItem("adpNombre");
        localStorage.removeItem("adpUsuario");

        toggleElementVisibility(userCredentials, false);
        toggleElementVisibility(btnAbrirModal, true);

        spanAdp.textContent = "";
        spanUsuario.textContent = "";

        document.querySelectorAll(".adp").forEach(span => {
            span.textContent = "";
        });

        nombreAsesor = "";
        usuarioAdp = "";

        // Limpiar códigos de usuario actual de la vista
        codigosGenerados = [];
        document.getElementById("lista-codigos").innerHTML = "";
        document.getElementById("codigo-generado").textContent = "";

        confirmDialog.close();
        modal.showModal();
    });

    // Cancelar cierre
    btnCancelarCerrarSesion.addEventListener("click", () => {
        confirmDialog.close();
    });

    // --- DESCARGA CÓDIGOS ---
    window.generarCodigo = generarCodigo;
    window.eliminarUltimoCodigo = eliminarUltimoCodigo;
    window.descargarCodigos = function () {
        if (codigosGenerados.length === 0) {
            alert("No hay códigos generados aún.");
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

    cargarCredenciales(); // Inicializa todo

    //inicia TODO

    // Lista de tareas (To-Do List)
    const openTodoBtn = document.getElementById('open-todo-btn');
    const closeTodoBtn = document.getElementById('close-todo-btn');
    const todoDialog = document.getElementById('todo-dialog');
    const newTaskInput = document.getElementById('new-task-input');
    const taskList = document.getElementById('task-list');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const clearAllTasksBtn = document.getElementById('clear-all-tasks-btn');
    const downloadTasksBtn = document.getElementById('download-tasks-btn');


    const adp = localStorage.getItem("adpUsuario") || "anonimo";
    const KEY_TODOS = `tareas_${adp}`;
    const KEY_FILTER = `filtro_tareas_${adp}`;

    let tareas = JSON.parse(localStorage.getItem(KEY_TODOS)) || [];
    let filtroActual = localStorage.getItem(KEY_FILTER) || 'all';

    function saveTareas() {
        localStorage.setItem(KEY_TODOS, JSON.stringify(tareas));
        localStorage.setItem(KEY_FILTER, filtroActual);
    }

    function renderTareas() {
        taskList.innerHTML = '';

        const filtradas = tareas.filter(task => {
            if (filtroActual === 'all') return true;
            if (filtroActual === 'pending') return !task.completada;
            if (filtroActual === 'completed') return task.completada;
        });

        if (filtradas.length === 0) {
            taskList.innerHTML = `<p class="empty-state-message">No hay tareas para mostrar.</p>`;
            return;
        }

        filtradas.forEach(task => {
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

    function addTarea() {
        const texto = newTaskInput.value.trim();
        if (!texto) return;

        let tareasPorAtender = 6;

        // ✅ Validación: máximo 6 tareas pendientes
        const pendientes = tareas.filter(t => !t.completada);
        if (pendientes.length >= tareasPorAtender) {
            mostrarToast("Regulariza tus plantillas antes de agregar más");
            return;
        }

        const nueva = {
            id: Date.now(),
            titulo: texto,
            descripcion: '',
            completada: false
        };

        tareas.push(nueva);
        newTaskInput.value = '';
        saveTareas();
        renderTareas();
    }

    taskList.addEventListener('click', (e) => {
        const taskId = e.target.closest('.task-item')?.dataset.id;

        // ✅ Alternar completado
        if (e.target.tagName === 'INPUT') {
            const index = tareas.findIndex(t => t.id == taskId);
            tareas[index].completada = !tareas[index].completada;
            saveTareas();
            renderTareas();
            return;
        }

        // ✅ Eliminar con closest()
        const deleteBtn = e.target.closest('.delete-task-btn');
        if (deleteBtn) {
            tareas = tareas.filter(t => t.id != taskId);
            saveTareas();
            renderTareas();
        }
    });

    taskList.addEventListener('input', (e) => {
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

        saveTareas();
    });

    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTarea();
        }
    });

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filtroActual = btn.id.replace('filter-', '');
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            saveTareas();
            renderTareas();
        });
    });

    clearAllTasksBtn.addEventListener('click', () => {
        tareas = [];
        saveTareas();
        renderTareas();
        mostrarToast("⚠️ Todas las tareas han sido eliminadas.");
    });

    openTodoBtn.addEventListener('click', () => {
        renderTareas();
        todoDialog.showModal();
    });

    closeTodoBtn.addEventListener('click', () => {
        cerrarDialogConAnimacion(todoDialog);
    });

    // Ctrl + B → abrir to-do
    window.addEventListener('keydown', (event) => {
        const isCtrlCmd = event.ctrlKey || event.metaKey;
        const isB = event.key.toLowerCase() === 'b';

        if (isCtrlCmd && isB) {
            event.preventDefault();
            if (!todoDialog.open) {
                renderTareas();
                todoDialog.showModal();
            }
        }
    });

    document.addEventListener('paste', function (e) {
        if (!e.target.classList.contains('task-title')) return;

        e.preventDefault(); // Evita el pegado por defecto con estilos

        const plainText = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, plainText);
    });

    // Render al cargar
    renderTareas();


    //Termina TODO

    // REAGENDAMIENTO
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
        const tipo = document.getElementById("tipo-reagendado").value;
        const escenarioSelect = document.getElementById("escenario");
        escenarioSelect.innerHTML = "";

        for (const esc in datosReagendamiento[tipo]) {
            const opt = document.createElement("option");
            opt.value = esc;
            opt.textContent = esc;
            escenarioSelect.appendChild(opt);
        }

        cargarMotivos(); // actualiza los motivos del primer escenario
    }

    function cargarMotivos() {
        const tipo = document.getElementById("tipo-reagendado").value;
        const escenario = document.getElementById("escenario").value;
        const motivoSelect = document.getElementById("motivo");
        motivoSelect.innerHTML = "";

        datosReagendamiento[tipo][escenario].forEach(motivo => {
            const opt = document.createElement("option");
            opt.value = motivo;
            opt.textContent = motivo;
            motivoSelect.appendChild(opt);
        });

        actualizarPlantilla(); // actualiza la vista
    }

    function actualizarPlantilla() {
        const tipoRepro = document.getElementById("tipo-reprogramado").value;
        const tipoReagen = document.getElementById("tipo-reagendado").value;
        const motivo = document.getElementById("motivo").value;
        const idLlamada = document.getElementById("id-llamada").value;
        const observacion = document.getElementById("observacion").value;
        const fechaVisita = document.getElementById("fecha-visita").value;
        const franjaVisita = document.getElementById("franja-visita").value;

        const nombreCliente = document.getElementById("nombre-cliente").value.trim() || "";
        const numeroCliente = document.getElementById("numero-cliente").value.trim() || "";

        // Formatear la fecha a dd/mm
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

        document.getElementById("texto-plantilla-dinamica").innerHTML = plantillaTexto;
    }

    // Inicializar cuando el DOM esté listo
    cargarEscenarios();

    document.getElementById("tipo-reprogramado").addEventListener("change", actualizarPlantilla);
    document.getElementById("tipo-reagendado").addEventListener("change", () => {
        cargarEscenarios();
        actualizarPlantilla();
    });
    document.getElementById("escenario").addEventListener("change", () => {
        cargarMotivos();
        actualizarPlantilla();
    });
    document.getElementById("motivo").addEventListener("change", actualizarPlantilla);

    // Nuevos event listeners para los campos añadidos
    document.getElementById("id-llamada").addEventListener("input", actualizarPlantilla);
    document.getElementById("observacion").addEventListener("input", actualizarPlantilla);
    document.getElementById("fecha-visita").addEventListener("change", actualizarPlantilla);
    document.getElementById("franja-visita").addEventListener("change", actualizarPlantilla);
    document.getElementById("nombre-cliente").addEventListener("input", actualizarPlantilla);
    document.getElementById("numero-cliente").addEventListener("input", actualizarPlantilla);


    //





    const fecha = new Date();

    const dia = fecha.getDate();
    const mes = fecha.toLocaleString("es-PE", { month: "long" }); // mes en español
    const anio = fecha.getFullYear();

    const horas = fecha.getHours().toString().padStart(2, "0");
    const minutos = fecha.getMinutes().toString().padStart(2, "0");
    const hora = `${horas}:${minutos}`;

    document.querySelectorAll(".dia").forEach(el => el.textContent = dia);
    document.querySelectorAll(".mes").forEach(el => el.textContent = mes);
    document.querySelectorAll(".anio").forEach(el => el.textContent = anio);
    document.querySelectorAll(".hora").forEach(el => el.textContent = hora);

    downloadTasksBtn.addEventListener('click', () => {
        if (tareas.length === 0) {
            alert("No hay tareas para descargar.");
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

});

function verificarFechaUsuario() {
    const hoy = new Date().toDateString();
    const claveFecha = `fecha_${usuarioAdp}`;
    const fechaGuardada = localStorage.getItem(claveFecha);

    if (fechaGuardada !== hoy) {
        // Es un nuevo día → limpia los códigos de este usuario
        codigosGenerados = [];
        correlativo = 1;
        letraActual = "A";

        localStorage.setItem(claveUsuario(), JSON.stringify([]));
        localStorage.setItem(claveFecha, hoy);

        limpiarCodigosVisuales();
    }
}

function cerrarDialogConAnimacion(dialog) {
    dialog.classList.add("closing");
    setTimeout(() => {
        dialog.classList.remove("closing");
        dialog.close();
    }, 300); // tiempo exacto de animación
}

function toggleElementVisibility(element, visible, displayMode = "flex") {
    if (visible) {
        element.style.display = displayMode;
        element.classList.remove("fade-out"); // por si acaso
        element.classList.add("fade-in");
    } else {
        element.classList.remove("fade-in"); // elimina animación de entrada
        element.style.display = "none"; // oculta inmediatamente sin animación
    }
}






dialog.classList.add("closing");
setTimeout(() => {
    dialog.close();
    dialog.classList.remove("closing");
}, 300); // igual a duración del zoomOut


