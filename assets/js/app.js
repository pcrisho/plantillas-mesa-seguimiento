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
