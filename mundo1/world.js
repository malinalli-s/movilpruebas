const video = document.querySelector("#camara");
const inicio = document.querySelector("#inicio");
const boton = document.querySelector("#iniciar");
const anguloTexto = document.querySelector("#angulo");


/* =========================================
   MUNDO GRÁFICO

   horizontal:
   izquierda (-) / derecha (+)

   vertical:
   arriba (-) / abajo (+)

   profundidad:
   0.5 = lejos
   1   = medio
   1.8 = cerca
========================================= */

const objetos = [

  {
    elemento: document.querySelector(".objeto1"),

    horizontal: -70,
    vertical: -25,

    profundidad: 0.5
  },

  {
    elemento: document.querySelector(".objeto2"),

    horizontal: -35,
    vertical: 20,

    profundidad: 1
  },

  {
    elemento: document.querySelector(".objeto3"),

    horizontal: 0,
    vertical: -30,

    profundidad: 1.8
  },

  {
    elemento: document.querySelector(".objeto4"),

    horizontal: 50,
    vertical: 15,

    profundidad: 0.7
  },

  {
    elemento: document.querySelector(".objeto5"),

    horizontal: 100,
    vertical: -10,

    profundidad: 1.5
  }

];


let alphaOrigen = 0;
let betaOrigen = 0;

let calibrado = false;


/* =========================================
   INICIO
========================================= */

boton.addEventListener(
  "click",
  iniciarExperiencia
);


async function iniciarExperiencia() {

  await iniciarCamara();

  await iniciarOrientacion();

}


/* =========================================
   CÁMARA
========================================= */

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


/* =========================================
   ORIENTACIÓN
========================================= */

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


/* =========================================
   CALIBRAR
========================================= */

function primeraLectura(evento) {

  alphaOrigen =
    evento.alpha || 0;

  betaOrigen =
    evento.beta || 0;


  calibrado = true;


  inicio.style.display =
    "none";


  window.addEventListener(
    "deviceorientation",
    actualizarMundo
  );

}


/* =========================================
   ACTUALIZAR
========================================= */

function actualizarMundo(evento) {

  if (!calibrado) return;


  const alpha =
    evento.alpha || 0;

  const beta =
    evento.beta || 0;


  let giroHorizontal =
    alpha - alphaOrigen;


  giroHorizontal =
    normalizarAngulo(
      giroHorizontal
    );


  const giroVertical =
    beta - betaOrigen;


  anguloTexto.textContent =

    giroHorizontal.toFixed(0)

    + "° / "

    + giroVertical.toFixed(0)

    + "°";


  dibujarMundo(
    giroHorizontal,
    giroVertical
  );

}


/* =========================================
   DIBUJAR
========================================= */

function dibujarMundo(
  giroHorizontal,
  giroVertical
) {

  const ancho =
    window.innerWidth;

  const alto =
    window.innerHeight;


  const campoHorizontal =
    70;

  const campoVertical =
    90;


  objetos.forEach(objeto => {


    /* -----------------------
       POSICIÓN ANGULAR
    ----------------------- */

    let diferenciaX =

      objeto.horizontal -
      giroHorizontal;


    diferenciaX =
      normalizarAngulo(
        diferenciaX
      );


    const diferenciaY =

      objeto.vertical -
      giroVertical;


    /* -----------------------
       ÁNGULO → PANTALLA
    ----------------------- */

    let x =

      (diferenciaX /
      campoHorizontal)

      * ancho;


    let y =

      (diferenciaY /
      campoVertical)

      * alto;


    /* =================================
       PROFUNDIDAD

       Los objetos cercanos reaccionan
       más al movimiento.
    ================================= */

    x *= objeto.profundidad;

    y *= objeto.profundidad;


    /* -----------------------
       VISIBILIDAD
    ----------------------- */

    const visibleHorizontal =

      Math.abs(x)
      < ancho * 0.75;


    const visibleVertical =

      Math.abs(y)
      < alto * 0.75;


    const visible =

      visibleHorizontal &&
      visibleVertical;


    if (visible) {


      objeto.elemento.style.display =
        "block";


      /* -----------------------
         ESCALA POR PROFUNDIDAD
      ----------------------- */

      const escala =

        0.7 +

        objeto.profundidad
        * 0.35;


      objeto.elemento.style.transform = `

        translate(
          calc(-50% + ${x}px),
          calc(-50% + ${y}px)
        )

        scale(${escala})

      `;


      /* -----------------------
         OPACIDAD
      ----------------------- */

      const distancia =

        Math.sqrt(

          x * x +

          y * y

        );


      const distanciaMaxima =

        Math.sqrt(

          ancho * ancho +

          alto * alto

        );


      const proximidadCentro =

        1 -

        distancia /
        distanciaMaxima;


      const opacidad =

        Math.max(

          0.2,

          proximidadCentro

        );


      objeto.elemento.style.opacity =
        opacidad;


      /*
      Blur muy ligero para
      capas lejanas.
      */

      const blur =

        objeto.profundidad < 0.8

        ? 2

        : 0;


      objeto.elemento.style.filter =

        `blur(${blur}px)`;

    }

    else {

      objeto.elemento.style.display =
        "none";

    }

  });

}


/* =========================================
   NORMALIZAR ÁNGULO
========================================= */

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
