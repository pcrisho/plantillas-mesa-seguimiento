function obtenerSaludo() {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return "Buenos días";
    else if (hora >= 12 && hora < 18) return "Buenas tardes";
    else return "Buenas noches";
}

document.addEventListener("DOMContentLoaded", function () {
    const saludo = obtenerSaludo();
    const elementosSaludo = document.querySelectorAll(".saludo-dinamico");

    elementosSaludo.forEach(el => {
        el.textContent = saludo;
    });
});

function obtenerFechaActual() {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0'); // +1 porque enero = 0
    return `${dia}/${mes}`;
}

document.addEventListener("DOMContentLoaded", function () {
    const fecha = obtenerFechaActual();
    const elementosFecha = document.querySelectorAll(".fecha-dinamica");

    elementosFecha.forEach(el => {
        el.textContent = fecha;
    });
});