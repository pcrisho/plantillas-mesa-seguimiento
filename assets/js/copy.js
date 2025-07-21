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
