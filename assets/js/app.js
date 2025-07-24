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

        document.getElementById("val-reprogramado").textContent = tipoRepro;
        document.getElementById("val-reagendado").textContent = tipoReagen;
        document.getElementById("val-reagendado2").textContent = tipoReagen;
        document.getElementById("val-motivo").textContent = motivo;
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

    //

    const motivosRechazo = {
        "CLIENTE NO DESEA SERVICIO": {
            pre: "PERSONA QUE CONTESTA: \nNUMERO DE CONTACTO: ",
            submotivos: [
                "Cliente ya tiene servicio de otro operador",
                "Titular no ha contratado ningun servicio a Claro",
                "Demora en la atención de la solicitud, ya no desea esperar",
                "Cliente no desea servicio por Motivos personales"
            ]
        },
        "RECHAZO POR DUPLICIDAD": {
            pre: "Cliente ya tiene un servicio activo en la misma dirección",
            submotivos: ["Se atendió con otra SOT"]
        },
        "FACILIDADES TÉCNICAS DEL CLIENTE": {
            submotivos: [
                "Dueño de casa y/o edificio no autoriza la instalación",
                "Al momento de la instalación no hay acceso al techo",
                "Al momento de la instalación se valida ducterías obstruidas",
                "Cliente cuenta con SOT de suspensión y/o baja"
            ]
        },
        "FALTA DE CONTACTO": {
            submotivos: ["No hay contacto con el cliente (números errados)"]
        },
        "MAL INGRESO DE DIRECCIÓN": {
            submotivos: ["Dirección registrada en el sistema es errada. (numero, lt, mz, nombre calle, distrito)"]
        },
        "MALA OFERTA": {
            submotivos: [
                "Tecnología incorrecta FTTH/HFC/OVERLAP Instalación/ Post Venta",
                "Velocidad de Internet no es acorde a lo solicitado por el cliente",
                "Cantidad o Modelo de Decos no es acorde a lo solicitado por el cliente",
                "Cliente solicito atención PostVenta (Decos adicionales, traslados, etc.)",
                "Cliente solicita adicionar la telefonía",
                "Decodificadores descontinuados (Básico HD, Básico, Standard, DVR)"
            ]
        },
        "MUDANZA O VIAJE": {
            submotivos: [
                "Cliente salió de viaje  y en el domicilio no tienen conocimiento de la Instalación",
                "Cliente no vive en esta dirección, se mudó",
                "Cliente indica que pronto se mudará o viajará y rechaza instalación",
                "Cliente salió de viaje  y en el domicilio no tienen conocimiento de la Instalación"
            ]
        },
        "SOT CON ERRORES EN EL SISTEMA": {
            submotivos: [
                "Sin workflow, sin tareas generadas",
                "Campaña mal configurada, no figura etiquetas correctas",
                "Solicitud mal generada (no genera reservas, duplicidad de números, duplicidad de etiquetas, Sin Co_id, sin CustomerID, Sin plano, etc.)"
            ]
        },
        "POSIBLE FRAUDE": {
            submotivos: ["Cliente ya tiene un servicio activo en la misma dirección"]
        }
    };

    function cargarMotivosRechazo() {
        const motivoSelect = document.getElementById("motivo-rechazo");
        motivoSelect.innerHTML = "";

        for (const motivo in motivosRechazo) {
            const option = document.createElement("option");
            option.value = motivo;
            option.textContent = motivo;
            motivoSelect.appendChild(option);
        }

        cargarSubmotivos(); // carga el primer motivo por defecto
    }

    function cargarSubmotivos() {
        const motivo = document.getElementById("motivo-rechazo").value;
        const submotivoGroup = document.getElementById("grupo-submotivo");
        const submotivoSelect = document.getElementById("submotivo-rechazo");

        const submotivos = motivosRechazo[motivo]?.submotivos || [];

        if (submotivos.length > 0) {
            submotivoGroup.style.display = "block";
            submotivoSelect.innerHTML = "";

            submotivos.forEach(sub => {
                const opt = document.createElement("option");
                opt.value = sub;
                opt.textContent = sub;
                submotivoSelect.appendChild(opt);
            });
        } else {
            submotivoGroup.style.display = "none";
            submotivoSelect.innerHTML = "";
        }

        actualizarPlantillaRechazo();
    }

    function actualizarPlantillaRechazo() {
        const rechazoEn = document.getElementById("rechazo-en").value;
        const pre = "";
        const motivo = document.getElementById("motivo-rechazo").value;
        const submotivo = document.getElementById("submotivo-rechazo").value || "";

        document.getElementById("val-rechazo-en").textContent = rechazoEn;
        document.getElementById("val-motivo-rechazo").textContent = pre+motivo+pre;
        document.getElementById("val-submotivo-rechazo").textContent = submotivo || "[NO APLICA]";
    }

    // Event Listeners
    document.getElementById("rechazo-en").addEventListener("change", actualizarPlantillaRechazo);
    document.getElementById("motivo-rechazo").addEventListener("change", () => {
        cargarSubmotivos();
        actualizarPlantillaRechazo();
    });
    document.getElementById("submotivo-rechazo").addEventListener("change", actualizarPlantillaRechazo);

    // Inicialización
    cargarMotivosRechazo();






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


