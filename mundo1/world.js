const video =
  document.querySelector("#camara");

const inicio =
  document.querySelector("#inicio");

const boton =
  document.querySelector("#iniciar");

const anguloTexto =
  document.querySelector("#angulo");


/* =========================================
   OBJETOS DEL MUNDO

   horizontal:
   izquierda (-) / derecha (+)

   vertical:
   arriba (-) / abajo (+)
========================================= */

const objetos = [

  {
    elemento: document.querySelector(".objeto1"),
    horizontal: -80,
    vertical: -25
  },

  {
    elemento: document.querySelector(".objeto2"),
    horizontal: -40,
    vertical: 20
  },

  {
    elemento: document.querySelector(".objeto3"),
    horizontal: 0,
    vertical: -35
  },

  {
    elemento: document.querySelector(".objeto4"),
    horizontal: 55,
    vertical: 10
  },

  {
    elemento: document.querySelector(".objeto5"),
    horizontal: 110,
    vertical: -15
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

    /*
    iPhone / iPad
    */

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
   CALIBRACIÓN
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
   ACTUALIZAR MUNDO
========================================= */

function actualizarMundo(evento) {

  if (!calibrado) return;


  const alpha =
    evento.alpha || 0;

  const beta =
    evento.beta || 0;


  /*
  Movimiento horizontal
  */

  let giroHorizontal =
    alpha - alphaOrigen;


  giroHorizontal =
    normalizarAngulo(
      giroHorizontal
    );


  /*
  Movimiento vertical
  */

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
   DIBUJAR MUNDO
========================================= */

function dibujarMundo(
  giroHorizontal,
  giroVertical
) {

  const ancho =
    window.innerWidth;

  const alto =
    window.innerHeight;


  /*
  Campo visual aproximado.
  */

  const campoHorizontal = 70;

  const campoVertical = 90;


  objetos.forEach(objeto => {


    /* -------------------------
       DIFERENCIA HORIZONTAL
    ------------------------- */

    let diferenciaX =

      objeto.horizontal -
      giroHorizontal;


    diferenciaX =
      normalizarAngulo(
        diferenciaX
      );


    /* -------------------------
       DIFERENCIA VERTICAL
    ------------------------- */

    const diferenciaY =

      objeto.vertical -
      giroVertical;


    /* -------------------------
       ÁNGULO → PIXELES
    ------------------------- */

    const x =

      (diferenciaX /
      campoHorizontal)

      * ancho;


    const y =

      (diferenciaY /
      campoVertical)

      * alto;


    /* -------------------------
       VISIBILIDAD
    ------------------------- */

    const visibleHorizontal =

      Math.abs(diferenciaX)
      < campoHorizontal;


    const visibleVertical =

      Math.abs(diferenciaY)
      < campoVertical;


    const visible =

      visibleHorizontal &&
      visibleVertical;


    /* -------------------------
       MOSTRAR
    ------------------------- */

    if (visible) {

      objeto.elemento.style.display =
        "block";


      objeto.elemento.style.transform = `

        translate(
          calc(-50% + ${x}px),
          calc(-50% + ${y}px)
        )

      `;


      /*
      Más cerca del centro =
      más visible.
      */

      const distancia =

        Math.sqrt(

          diferenciaX *
          diferenciaX

          +

          diferenciaY *
          diferenciaY

        );


      const proximidad =

        Math.max(

          0.15,

          1 - distancia / 100

        );


      objeto.elemento.style.opacity =
        proximidad;

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
