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


let betaActual = 0;
let gammaActual = 0;

let betaOrigen = 0;
let gammaOrigen = 0;

let calibrado = false;
let encontrado = false;


/* --------------------------
   POSICIÓN DE LA SEÑAL
-------------------------- */

/*
La señal estará desplazada
respecto al punto inicial.

Puedes cambiar estos valores.
*/

const objetivoX = 20;
const objetivoY = -12;


/* --------------------------
   INICIAR
-------------------------- */

boton.addEventListener(
  "click",
  iniciarExperiencia
);


async function iniciarExperiencia() {

  await iniciarCamara();

  await iniciarOrientacion();

}


/* --------------------------
   CÁMARA
-------------------------- */

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
      "Error cámara:",
      error
    );

  }

}


/* --------------------------
   ORIENTACIÓN
-------------------------- */

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
          "Se necesita acceso a orientación."
        );

        return;

      }

    }


    window.addEventListener(
      "deviceorientation",
      leerOrientacion
    );


    mostrarCalibracion();


  } catch (error) {

    console.error(error);

  }

}


/* --------------------------
   LEER SENSOR
-------------------------- */

function leerOrientacion(evento) {

  betaActual =
    evento.beta || 0;

  gammaActual =
    evento.gamma || 0;


  betaTexto.textContent =
    betaActual.toFixed(1);

  gammaTexto.textContent =
    gammaActual.toFixed(1);


  if (calibrado && !encontrado) {

    actualizarBusqueda();

  }

}


/* --------------------------
   PANTALLA CALIBRACIÓN
-------------------------- */

function mostrarCalibracion() {

  inicio.innerHTML = `

    <h1>
      ELIGE TU<br>
      PUNTO DE PARTIDA
    </h1>

    <p>
      Apunta el teléfono hacia
      el frente y fija esta posición.
    </p>

    <button id="calibrar">
      FIJAR POSICIÓN
    </button>

  `;


  const botonCalibrar =
    document.querySelector("#calibrar");


  botonCalibrar.addEventListener(
    "click",
    calibrar
  );

}


/* --------------------------
   CALIBRAR
-------------------------- */

function calibrar() {

  /*
  Guardamos la orientación
  actual del teléfono.
  */

  betaOrigen =
    betaActual;

  gammaOrigen =
    gammaActual;


  calibrado = true;


  inicio.style.display =
    "none";


  console.log(
    "Origen:",
    betaOrigen,
    gammaOrigen
  );

}


/* --------------------------
   BÚSQUEDA
-------------------------- */

function actualizarBusqueda() {

  /*
  Movimiento relativo
  respecto al punto calibrado.
  */

  const diferenciaX =
    gammaActual - gammaOrigen;

  const diferenciaY =
    betaActual - betaOrigen;


  /*
  Distancia angular entre
  nuestra orientación actual
  y la señal.
  */

  const errorX =
    objetivoX - diferenciaX;

  const errorY =
    objetivoY - diferenciaY;


  /*
  Convertimos grados
  a píxeles.
  */
const ancho =
  window.innerWidth;

const alto =
  window.innerHeight;


/*
Convertimos el error angular
en una posición proporcional
a toda la pantalla.
*/

const rangoHorizontal = 30;
const rangoVertical = 30;


let x =
  (errorX / rangoHorizontal)
  * (ancho / 2);


let y =
  (errorY / rangoVertical)
  * (alto / 2);


/*
Permitimos recorrer
todo el viewport.
*/

x = limitar(
  x,
  -ancho / 2,
  ancho / 2
);

y = limitar(
  y,
  -alto / 2,
  alto / 2
);
 


  cursor.style.transform = `

    translate(
      calc(-50% + ${x}px),
      calc(-50% + ${y}px)
    )

  `;


  comprobarObjetivo(
    errorX,
    errorY
  );

}


/* --------------------------
   COMPROBAR OBJETIVO
-------------------------- */

function comprobarObjetivo(
  errorX,
  errorY
) {

  const distancia =
    Math.sqrt(

      errorX * errorX +

      errorY * errorY

    );


  /*
  Estamos a menos
  de 3 grados.
  */

  if (distancia < 3) {

    encontrado = true;


    cursor.style.transform = `

      translate(
        -50%,
        -50%
      )

      scale(1.8)

    `;


    revelacion.style.opacity =
      "1";

  }

}


/* --------------------------
   LIMITAR
-------------------------- */

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
