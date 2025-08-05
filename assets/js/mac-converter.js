function convertirMAC() {
  const input = document.getElementById("mac-input");
  const resultadoSpan = document.getElementById("mac-generada");
  const mensajeCopiado = document.getElementById("mac-copiado");

  let mac = input.value.trim().replace(/[^a-fA-F0-9]/g, "").toUpperCase();

  if (mac.length !== 12) {
    resultadoSpan.textContent = "⚠️ Ingresa una MAC de 12 caracteres.";
    resultadoSpan.style.color = "red";
    mensajeCopiado.classList.add("hidden");
    return;
  }

  const macFormateada = mac.match(/.{1,2}/g).join(":");
  resultadoSpan.textContent = macFormateada;
  resultadoSpan.style.color = "#000";
  mensajeCopiado.classList.add("hidden");
}

