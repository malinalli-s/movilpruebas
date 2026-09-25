const video =
  document.querySelector("#camara");

const cursor =
  document.querySelector("#cursor");

const revelacion =
  document.querySelector("#revelacion");

const inicio =
  document.querySelector("#inicio");

const boton =
  document.querySelector("#iniciar");

const betaTexto =
  document.querySelector("#beta");

const gammaTexto =
  document.querySelector("#gamma");


let encontrado = false;


/* ----------------------
   INICIO
---------------------- */

boton.addEventListener(
  "click",
  iniciarExperiencia
);


async function iniciarExperiencia() {

  await iniciarCamara();

  await iniciarOrientacion();

}


/* ----------------------
   CÁMARA
---------------------- */

async function iniciarCamara() {

  try {

    const stream =
      await navigator.mediaDevices.getUserMedia({

        video: {
          facingMode: {
            ideal: "environment"
          }
        },

        audio: false

      });


    video.srcObject = stream;

    await video.play();


  } catch (error) {

    console.error(
      "Error de cámara:",
      error
    );

  }

}


/* ----------------------
   ORIENTACIÓN
---------------------- */

async function iniciarOrientacion() {

  try {

    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {

      const permiso =
        await DeviceOrientationEvent.requestPermission();


      if (permiso !== "granted") {

        alert(
          "Necesitamos acceso a la orientación."
        );

        return;

      }

    }


    window.addEventListener(
      "deviceorientation",
      actualizar
    );


    inicio.style.display = "none";


  } catch (error) {

    console.error(error);

  }

}


/* ----------------------
   INTERACCIÓN
---------------------- */

function actualizar(evento) {

  if (encontrado) return;


  const beta =
    evento.beta || 0;

  const gamma =
    evento.gamma || 0;


  betaTexto.textContent =
    beta.toFixed(1);

  gammaTexto.textContent =
    gamma.toFixed(1);


  /*
  Convertimos grados
  en desplazamiento.
  */

  const x =
    limitar(gamma, -30, 30) * 6;

  const y =
    limitar(beta, -30, 30) * 4;


  cursor.style.transform = `
    translate(
      calc(-50% + ${x}px),
      calc(-50% + ${y}px)
    )
  `;


  comprobarAlineacion(x, y);

}


/* ----------------------
   REGLA
---------------------- */

function comprobarAlineacion(x, y) {

  const distancia =
    Math.sqrt(
      x * x +
      y * y
    );


  /*
  Si estamos suficientemente
  cerca del centro...
  */

  if (distancia < 25) {

    encontrado = true;

    cursor.style.transform =
      "translate(-50%, -50%) scale(1.7)";


    revelacion.style.opacity = "1";

  }

}


/* ----------------------
   UTILIDAD
---------------------- */

function limitar(
  valor,
  minimo,
  maximo
) {

  return Math.min(
    Math.max(valor, minimo),
    maximo
  );

}
