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

    // === TO-DO APP ===
    const openBtn = document.querySelector("#open-todo-btn");
    const closeBtn = document.querySelector("#close-todo-btn");
    const dialog = document.querySelector("#todo-dialog");
    const taskListContainer = document.querySelector("#task-list");
    const addTaskBtn = document.querySelector("#add-task-btn");

    const TODO_STORAGE_KEY = `todo_${localStorage.getItem("adpUsuario") || "anonimo"}`;

    // Cargar tareas desde localStorage
    const loadTasks = () => {
        const data = localStorage.getItem(TODO_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    };

    // Guardar tareas en localStorage
    const saveTasks = (tasks) => {
        localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(tasks));
    };

    // Renderizar una sola tarea
    const renderTask = (task) => {
        const taskItem = document.createElement("div");
        taskItem.className = `task-item ${task.status}`;
        taskItem.dataset.id = task.id;

        const titleDiv = document.createElement("div");
        titleDiv.className = "task-title";
        titleDiv.contentEditable = true;
        titleDiv.textContent = task.title;

        const descriptionDiv = document.createElement("div");
        descriptionDiv.className = "task-description";
        descriptionDiv.contentEditable = true;
        descriptionDiv.innerHTML = task.description.replace(/\n/g, "<br>");

        // Soporte para pegar saltos de línea como <br>
        descriptionDiv.addEventListener("paste", (e) => {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData("text");
            document.execCommand("insertHTML", false, text.replace(/\n/g, "<br>"));
        });

        const actionsDiv = document.createElement("div");
        actionsDiv.className = "task-actions";

        const statusBtn = document.createElement("button");
        statusBtn.className = `status-btn ${task.status}`;
        statusBtn.textContent = task.status === "in-attention" ? "Marcar como Atendido" : "Marcar como En Atención";

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Eliminar";

        actionsDiv.appendChild(statusBtn);
        actionsDiv.appendChild(deleteBtn);

        taskItem.appendChild(titleDiv);
        taskItem.appendChild(descriptionDiv);
        taskItem.appendChild(actionsDiv);
        taskListContainer.appendChild(taskItem);
    };

    // Renderizar todas las tareas
    const renderAllTasks = (tasks) => {
        taskListContainer.innerHTML = "";
        tasks.forEach(renderTask);
    };

    // Añadir nueva tarea
    addTaskBtn.addEventListener("click", () => {
        const tasks = loadTasks();
        const newTask = {
            id: Date.now(),
            title: "Nueva Tarea",
            description: "",
            status: "in-attention"
        };
        tasks.push(newTask);
        saveTasks(tasks);
        renderTask(newTask);
    });

    // Cambiar estado o eliminar
    taskListContainer.addEventListener("click", (e) => {
        const target = e.target;
        const taskItem = target.closest(".task-item");
        if (!taskItem) return;

        const taskId = parseInt(taskItem.dataset.id);
        const tasks = loadTasks();
        const index = tasks.findIndex(t => t.id === taskId);
        if (index === -1) return;

        if (target.classList.contains("delete-btn")) {
            tasks.splice(index, 1);
            saveTasks(tasks);
            taskItem.remove();
        }

        if (target.classList.contains("status-btn")) {
            const newStatus = tasks[index].status === "in-attention" ? "attended" : "in-attention";
            tasks[index].status = newStatus;
            saveTasks(tasks);
            taskItem.className = `task-item ${newStatus}`;
            target.textContent = newStatus === "in-attention" ? "Marcar como Atendido" : "Marcar como En Atención";
            target.className = `status-btn ${newStatus}`;
        }
    });

    // Guardar ediciones de texto
    taskListContainer.addEventListener("input", (e) => {
        const target = e.target;
        const taskItem = target.closest(".task-item");
        if (!taskItem) return;

        const taskId = parseInt(taskItem.dataset.id);
        const tasks = loadTasks();
        const index = tasks.findIndex(t => t.id === taskId);
        if (index === -1) return;

        if (target.classList.contains("task-title")) {
            tasks[index].title = target.textContent;
        }

        if (target.classList.contains("task-description")) {
            // Elimina saltos dobles convirtiendo <br><br> o <div><br></div> a uno solo
            const cleanText = target.innerHTML
                .replace(/<div><br><\/div>/gi, '\n') // En caso se use <div><br></div>
                .replace(/<div>/gi, '\n')            // En caso de divs normales
                .replace(/<\/div>/gi, '')            // Cierra divs
                .replace(/<br\s*\/?>/gi, '\n')       // Reemplaza <br> con \n
                .replace(/\n{2,}/g, '\n');           // Previene saltos dobles
            tasks[index].description = cleanText.trim(); // Guarda limpio
        }

        saveTasks(tasks);
    });

    // Abrir y cerrar el panel
    openBtn.addEventListener("click", () => {
        renderAllTasks(loadTasks());
        dialog.showModal();
    });

    closeBtn.addEventListener("click", () => {
        dialog.classList.add("closing");
    });

    // Cerrar con animación
    dialog.addEventListener("transitionend", (event) => {
        if (event.propertyName === 'transform' && dialog.classList.contains("closing")) {
            dialog.classList.remove("closing");
            dialog.close();
        }
    });

    // Atajo de teclado Ctrl+B
    window.addEventListener("keydown", (event) => {
        const isCtrlCmd = event.ctrlKey || event.metaKey;
        const isB = event.key.toLowerCase() === 'b';

        if (isCtrlCmd && isB) {
            event.preventDefault();
            if (!dialog.open) {
                renderAllTasks(loadTasks());
                dialog.showModal();
            }
        }
    });


    //Termina TODO

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


