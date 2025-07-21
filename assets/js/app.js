document.addEventListener("DOMContentLoaded", () => {
    // ELEMENTOS
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

    // VARIABLES
    let nombreAsesor = "";
    let usuarioAdp = "";

    // CARGA CREDENCIALES GUARDADAS
    const adpGuardado = localStorage.getItem("adpNombre");
    const usuarioGuardado = localStorage.getItem("adpUsuario");

    if (adpGuardado && usuarioGuardado) {
        nombreAsesor = adpGuardado;
        usuarioAdp = usuarioGuardado;
        spanAdp.textContent = nombreAsesor;
        spanUsuario.textContent = usuarioAdp;
        userCredentials.style.display = "flex";
        btnAbrirModal.style.display = "none"; // 👈 aquí

        document.querySelectorAll(".adp").forEach(span => {
            span.textContent = nombreAsesor;
        });
    } else {
        modal.showModal();
    }

    // ABRIR MODAL MANUAL
    btnAbrirModal.addEventListener("click", () => {
        modal.showModal();
    });

    // GUARDAR CREDENCIALES
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
            userCredentials.style.display = "flex";
            btnAbrirModal.style.display = "none";

            document.querySelectorAll(".adp").forEach(span => {
                span.textContent = nombreAsesor;
            });

            modal.close();
        } else {
            alert("⚠️ Por favor, completa los datos correctamente.");
        }
    });

    // ACCEDER SIN CREDENCIALES
    btnSinCredenciales.addEventListener("click", () => {
        modal.close();
    });

    // CERRAR SESIÓN
    btnCerrarSesion.addEventListener("click", () => {
        localStorage.removeItem("adpNombre");
        localStorage.removeItem("adpUsuario");

        userCredentials.style.display = "none";
        btnAbrirModal.style.display = "flex"; // o "flex", según tu estilo original

        spanAdp.textContent = "";
        spanUsuario.textContent = "";

        document.querySelectorAll(".adp").forEach(span => {
            span.textContent = "";
        });

        nombreAsesor = "";
        usuarioAdp = "";

        modal.showModal();
    });

    // ---------- GENERACIÓN DE CÓDIGOS ----------
    let correlativo = 1;
    let letraActual = "A";
    let codigosGenerados = [];

    function guardarDatos() {
        localStorage.setItem("codigosGuardados", JSON.stringify(codigosGenerados));
        localStorage.setItem("fechaGuardada", new Date().toDateString());
    }

    function mostrarUltimoCodigoGenerado() {
        const ult = codigosGenerados[codigosGenerados.length - 1] || "";
        document.getElementById("codigo-generado").textContent = ult;
    }

    function cargarDatosGuardados() {
        const fechaActual = new Date().toDateString();
        const fechaGuardada = localStorage.getItem("fechaGuardada");
        const datosGuardados = JSON.parse(localStorage.getItem("codigosGuardados")) || [];

        if (fechaActual !== fechaGuardada) {
            localStorage.removeItem("codigosGuardados");
            localStorage.setItem("fechaGuardada", fechaActual);
            codigosGenerados = [];
            correlativo = 1;
            letraActual = "A";
            document.getElementById("lista-codigos").innerHTML = "";
        } else {
            codigosGenerados = datosGuardados;
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

    cargarDatosGuardados();
});