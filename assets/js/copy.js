// Obtener la fecha actual
const fecha = new Date();
const dia = fecha.getDate();
const mes = fecha.toLocaleString("es-PE", { month: "long" }); // "julio"
const anio = fecha.getFullYear();
// Hora con ceros a la izquierda si es necesario
const horas = fecha.getHours().toString().padStart(2, "0");
const minutos = fecha.getMinutes().toString().padStart(2, "0");
const hora = `${horas}:${minutos}`;

// Cola de mensajes para copiar
let copiaEnProgreso = false;
let colaMensajes = 0;

function copiarPlantilla(boton) {
    const plantilla = boton.closest(".plantilla");
    const texto = plantilla.querySelector("p")?.innerText || plantilla.querySelector("p")?.textContent;

    if (!texto) return;

    navigator.clipboard.writeText(texto).then(() => {
        colaMensajes++;

        // Si ya hay uno en progreso, salimos, se procesará después
        if (copiaEnProgreso) return;

        mostrarDialogoCopia();

    }).catch(err => {
        console.error("Error al copiar:", err);
    });
}

function mostrarDialogoCopia() {
    if (colaMensajes === 0) return;

    const dialog = document.getElementById("copiado-dialog");
    if (!dialog) return;

    copiaEnProgreso = true;

    dialog.show();
    dialog.classList.remove("hide");

    setTimeout(() => {
        dialog.close();
        colaMensajes--; // Restamos uno de la cola
        copiaEnProgreso = false;

        // Si hay más en cola, mostramos el siguiente
        if (colaMensajes > 0) {
            setTimeout(() => mostrarDialogoCopia(), 200);
        }

    }, 2000);
}


// Insertar en los elementos HTML
document.querySelectorAll(".adp").forEach(span => {
    span.textContent = nombreAsesor;
});
document.querySelectorAll(".dia").forEach(el => el.textContent = dia);
document.querySelectorAll(".mes").forEach(el => el.textContent = mes);
document.querySelectorAll(".anio").forEach(el => el.textContent = anio);
document.querySelectorAll(".hora").forEach(el => el.textContent = hora);
