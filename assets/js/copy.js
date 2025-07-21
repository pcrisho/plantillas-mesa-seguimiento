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

const toastQueue = [];
let toastVisible = false;

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

function copiarPlantilla(boton) {
    const plantilla = boton.closest(".plantilla");
    const texto = plantilla.querySelector("p").innerText || plantilla.querySelector("p").textContent;

    navigator.clipboard.writeText(texto).then(() => {
        mostrarToast("Plantilla copiada");
    }).catch(err => {
        console.error("Error al copiar:", err);
        mostrarToast("Error al copiar");
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
