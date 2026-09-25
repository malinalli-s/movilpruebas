const circulo = document.querySelector("#circulo");

const alphaTexto = document.querySelector("#alpha");
const betaTexto = document.querySelector("#beta");
const gammaTexto = document.querySelector("#gamma");

const boton = document.querySelector("#iniciar");


function iniciarSensor() {

  window.addEventListener(
    "deviceorientation",
    leerOrientacion
  );

  boton.style.display = "none";
}


function leerOrientacion(evento) {

  const alpha = evento.alpha || 0;
  const beta = evento.beta || 0;
  const gamma = evento.gamma || 0;


  // Mostrar valores

  alphaTexto.textContent = alpha.toFixed(1);
  betaTexto.textContent = beta.toFixed(1);
  gammaTexto.textContent = gamma.toFixed(1);


  // Limitar valores para que
  // el círculo no salga de pantalla

  const x = limitar(gamma, -45, 45);
  const y = limitar(beta, -45, 45);


  // Convertir grados en movimiento

  const movimientoX = x * 4;
  const movimientoY = y * 3;


  circulo.style.transform = `
    translate(
      calc(-50% + ${movimientoX}px),
      calc(-50% + ${movimientoY}px)
    )
  `;
}


function limitar(valor, minimo, maximo) {

  return Math.min(
    Math.max(valor, minimo),
    maximo
  );

}


boton.addEventListener("click", async () => {

  /*
  iPhone / iPad pueden requerir
  permiso explícito.
  */

  if (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function"
  ) {

    try {

      const permiso =
        await DeviceOrientationEvent.requestPermission();

      if (permiso === "granted") {
        iniciarSensor();
      }

    } catch (error) {

      console.error(error);

    }

  } else {

    /*
    Android y otros navegadores
    normalmente entran aquí.
    */

    iniciarSensor();

  }

});
