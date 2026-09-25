const video =
  document.querySelector("#camara");

const inicio =
  document.querySelector("#inicio");

const boton =
  document.querySelector("#iniciar");

const anguloTexto =
  document.querySelector("#angulo");


/*
Cada objeto vive en una
dirección diferente del mundo.
*/

const objetos = [

  {
    elemento: document.querySelector(".objeto1"),
    angulo: -120
  },

  {
    elemento: document.querySelector(".objeto2"),
    angulo: -60
  },

  {
    elemento: document.querySelector(".objeto3"),
    angulo: 0
  },

  {
    elemento: document.querySelector(".objeto4"),
    angulo: 70
  },

  {
    elemento: document.querySelector(".objeto5"),
    angulo: 140
  }

];


let alphaOrigen = 0;

let calibrado = false;


/* -----------------
   INICIO
----------------- */

boton.addEventListener(
  "click",
  iniciarExperiencia
);


async function iniciarExperiencia() {

  await iniciarCamara();

  await iniciarOrientacion();

}


/* -----------------
   CÁMARA
----------------- */

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


/* -----------------
   SENSOR
----------------- */

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
          "Necesitamos acceso a orientación."
        );

        return;

      }

    }


    window.addEventListener(
      "deviceorientation",
      primeraLectura,
      { once: true }
    );


  } catch (error) {

    console.error(error);

  }

}


/* -----------------
   CALIBRAR
----------------- */

function primeraLectura(evento) {

  alphaOrigen =
    evento.alpha || 0;


  calibrado = true;


  inicio.style.display =
    "none";


  window.addEventListener(
    "deviceorientation",
    actualizarMundo
  );

}


/* -----------------
   ACTUALIZAR
----------------- */

function actualizarMundo(evento) {

  if (!calibrado) return;


  const alpha =
    evento.alpha || 0;


  /*
  Diferencia respecto
  al punto inicial.
  */

  let giro =
    alpha - alphaOrigen;


  /*
  Corregimos el salto
  359° → 0°.
  */

  giro =
    normalizarAngulo(giro);


  anguloTexto.textContent =
    giro.toFixed(1);


  dibujarMundo(giro);

}


/* -----------------
   DIBUJAR MUNDO
----------------- */

function dibujarMundo(giro) {

  const ancho =
    window.innerWidth;


  /*
  Aproximamos el campo
  visible horizontal.

  70° significa que la pantalla
  representa aproximadamente
  70 grados del mundo.
  */

  const campoVision = 70;


  objetos.forEach(objeto => {

    let diferencia =
      objeto.angulo - giro;


    diferencia =
      normalizarAngulo(
        diferencia
      );


    /*
    Convertimos diferencia
    angular en posición X.
    */

    const x =
      (diferencia / campoVision)
      * ancho;


    /*
    Visible si está cerca
    de nuestra dirección.
    */

    const visible =
      Math.abs(diferencia)
      < campoVision;


    if (visible) {

      objeto.elemento.style.display =
        "block";


      objeto.elemento.style.transform = `

        translate(
          calc(-50% + ${x}px),
          -50%
        )

      `;


      /*
      Se vuelve más visible
      al acercarse al centro.
      */

      const proximidad =
        1 -
        Math.abs(diferencia)
        / campoVision;


      objeto.elemento.style.opacity =
        proximidad;

    }

    else {

      objeto.elemento.style.display =
        "none";

    }

  });

}


/* -----------------
   ÁNGULOS
----------------- */

function normalizarAngulo(
  angulo
) {

  while (angulo > 180) {

    angulo -= 360;

  }


  while (angulo < -180) {

    angulo += 360;

  }


  return angulo;

}
