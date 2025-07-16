// Variables globales para nombre y usuario
let nombreAsesor = "";
let usuarioAdp = "";

// Guardar datos ingresados
function guardarDatosAdp() {
    const inputNombre = document.getElementById("input-adp").value.trim();
    const inputUsuario = document.getElementById("input-usuario").value.trim().toUpperCase();

    if (inputNombre === "" || inputUsuario.length !== 7) {
        alert("⚠️ Ingresa un nombre y un usuario válido (7 caracteres).");
        return;
    }

    nombreAsesor = inputNombre;
    usuarioAdp = inputUsuario;

    document.querySelectorAll(".adp").forEach(span => span.textContent = nombreAsesor);

    alert("✅ Datos guardados correctamente.");
}

// Función de generación de código de cambio de equipo
let correlativo = 1;
let letraActual = "A";
let codigosGenerados = [];

// Carga los datos guardados
function cargarDatosGuardados() {
    const fechaActual = new Date().toDateString();
    const fechaGuardada = localStorage.getItem("fechaGuardada");
    const datosGuardados = JSON.parse(localStorage.getItem("codigosGuardados")) || [];

    // Si es un nuevo día, limpia el almacenamiento
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
        correlativo = datosGuardados.length + 1;
        letraActual = datosGuardados.length % 2 === 0 ? "A" : "B";
    }

    mostrarUltimoCodigoGenerado();
}

function guardarDatos() {
    localStorage.setItem("codigosGuardados", JSON.stringify(codigosGenerados));
    localStorage.setItem("fechaGuardada", new Date().toDateString());
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

    document.getElementById("codigo-generado").textContent = codigo;
    codigosGenerados.push(codigo);
    guardarDatos();

    letraActual = letraActual === "A" ? "B" : "A";
    correlativo++;

    const lista = document.getElementById("lista-codigos");
    const item = document.createElement("li");
    item.textContent = codigo;
    lista.appendChild(item);

    localStorage.setItem("codigosGuardados", JSON.stringify(codigosGenerados));
}

function descargarCodigos() {
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

function eliminarUltimoCodigo() {
    const codigosGuardados = JSON.parse(localStorage.getItem("codigosGuardados")) || [];

    if (codigosGuardados.length === 0) {
        alert("⚠️ No hay códigos generados para eliminar.");
        return;
    }

    // Eliminar el último código
    codigosGuardados.pop();

    // Disminuir el correlativo (mínimo hasta 1)
    correlativo = Math.max(1, correlativo - 1);

    // Alternar la letra (vuelve a la anterior)
    letraActual = letraActual === "A" ? "B" : "A";

    // Actualizar en memoria
    codigosGenerados.pop(); // También quitarlo de la lista en memoria
    localStorage.setItem("codigosGuardados", JSON.stringify(codigosGuardados));

    // Eliminar visualmente el último <li>
    const lista = document.getElementById("lista-codigos");
    if (lista.lastElementChild) {
        lista.removeChild(lista.lastElementChild);
    }

    // Mostrar el nuevo último código en el <span>
    const ultimoCodigo = codigosGuardados[codigosGuardados.length - 1] || "";
    document.getElementById("codigo-generado").textContent = ultimoCodigo;
}

// Ejecutar al cargar la página
window.addEventListener("DOMContentLoaded", cargarDatosGuardados);


function mostrarUltimoCodigoGenerado() {
    const codigoGeneradoElDia = JSON.parse(localStorage.getItem("codigosGuardados")) || [];
    const ultimoCodigo = codigoGeneradoElDia[codigoGeneradoElDia.length - 1] || "";
    document.getElementById("codigo-generado").textContent = ultimoCodigo;
}







const listElements = document.querySelectorAll('.list__button--click');

listElements.forEach(listElement => {
    listElement.addEventListener('click', () => {
        const menu = listElement.nextElementSibling;

        // Cierra los demás desplegables
        listElements.forEach(el => {
            if (el !== listElement) {
                el.classList.remove('arrow');
                const otro = el.nextElementSibling;
                if (otro) {
                    otro.style.height = "0px";
                }
            }
        });

        const isOpen = menu.style.height && menu.style.height !== "0px";

        if (isOpen) {
            listElement.classList.remove('arrow');
            menu.style.height = "0px";
        } else {
            listElement.classList.add('arrow');
            menu.style.height = menu.scrollHeight + "px";

            // 👇 FORZAMOS actualizacion del scroll de NAV
            const nav = listElement.closest("nav");
            if (nav) {
                nav.style.overflowY = "hidden";
                void nav.offsetHeight; // Forzar reflow
                nav.style.overflowY = "auto";
            }

            // 👇 Scroll al item si se desea
            setTimeout(() => {
                listElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }, 300);
        }
    });
});

/*var nombreAsesor = prompt('Ingresa tus nombre');*/
// Obtener la fecha actual
const fecha = new Date();
const dia = fecha.getDate();
const mes = fecha.toLocaleString("es-PE", { month: "long" }); // "julio"
const anio = fecha.getFullYear();
// Hora con ceros a la izquierda si es necesario
const horas = fecha.getHours().toString().padStart(2, "0");
const minutos = fecha.getMinutes().toString().padStart(2, "0");
const hora = `${horas}:${minutos}`;

// Función para copiar la plantilla al portapapeles
function copiarPlantilla(boton) {
    const plantilla = boton.closest(".plantilla");
    const texto = plantilla.querySelector("p").innerText ||
        plantilla.querySelector("p").textContent;

    navigator.clipboard.writeText(texto).then(() => {
        const copiadoSpan = boton.parentElement.querySelector(".copiado");

        copiadoSpan.classList.remove("hidden");
        copiadoSpan.classList.add("mostrar");

        // Ocultamos el mensaje después de 2 segundos
        setTimeout(() => {
            copiadoSpan.classList.remove("mostrar");
            copiadoSpan.classList.add("hidden");
        }, 2000);
    }).catch(err => {
        console.error("Error al copiar:", err);
    });
}


// Insertar en los elementos HTML
document.querySelectorAll(".adp").forEach(span => {
    span.textContent = nombreAsesor;
});
document.querySelectorAll(".dia").forEach(el => el.textContent = dia);
document.querySelectorAll(".mes").forEach(el => el.textContent = mes);
document.querySelectorAll(".anio").forEach(el => el.textContent = anio);
document.querySelectorAll(".hora").forEach(el => el.textContent = hora);
