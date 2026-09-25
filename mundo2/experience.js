const video =
  document.querySelector("#camara");

const inicio =
  document.querySelector("#inicio");

const boton =
  document.querySelector("#iniciar");

const contador =
  document.querySelector("#contador");

const mensaje =
  document.querySelector("#mensaje");

const final =
  document.querySelector("#final");


/* =====================================
   SEÑALES DEL MUNDO
===================================== */

const senales = [

  {
    elemento:
      document.querySelector("#senal1"),

    horizontal: -55,
    vertical: -20,

    encontrada: false,
    tiempo: 0
  },


  {
    elemento:
      document.querySelector("#senal2"),

    horizontal: 45,
    vertical: 25,

    encontrada: false,
    tiempo: 0
  },


  {
    elemento:
      document.querySelector("#senal3"),

    horizontal: 110,
    vertical: -30,

    encontrada: false,
    tiempo: 0
  }

];


let alphaOrigen = 0;
let betaOrigen = 0;

let encontradas = 0;

let ultimoTiempo = 0;


/* =====================================
   INICIO
===================================== */

boton.addEventListener(
  "click",
  iniciarExperiencia
);


async function iniciarExperiencia() {

  await iniciarCamara();

  await iniciarOrientacion();

}


/* =====================================
   CÁMARA
===================================== */

async function iniciarCamara() {

  try {

    const stream =
      await navigator.mediaDevices
        .getUserMedia({

          video: {

            facingMode: {
              ideal: "environment"
            }

          },

          audio: false

        });


    video.srcObject =
      stream;


    await video.play();

  }

  catch (error) {

    console.error(
      "Error cámara:",
      error
    );

  }

}


/* =====================================
   ORIENTACIÓN
===================================== */

async function iniciarOrientacion() {

  try {

    if (
      typeof DeviceOrientationEvent !==
      "undefined"

      &&

      typeof DeviceOrientationEvent
        .requestPermission ===
      "function"
    ) {

      const permiso =
        await DeviceOrientationEvent
          .requestPermission();


      if (permiso !== "granted") {

        alert(
          "Se necesita acceso a orientación."
        );

        return;

      }

    }


    window.addEventListener(
      "deviceorientation",
      calibrar,
      { once: true }
    );

  }

  catch (error) {

    console.error(error);

  }

}


/* =====================================
   CALIBRACIÓN
===================================== */

function calibrar(evento) {

  alphaOrigen =
    evento.alpha || 0;

  betaOrigen =
    evento.beta || 0;


  inicio.style.display =
    "none";


  ultimoTiempo =
    performance.now();


  window.addEventListener(
    "deviceorientation",
    actualizar
  );

}


/* =====================================
   ACTUALIZACIÓN
===================================== */

function actualizar(evento) {

  const ahora =
    performance.now();


  const delta =
    ahora - ultimoTiempo;


  ultimoTiempo =
    ahora;


  const alpha =
    evento.alpha || 0;

  const beta =
    evento.beta || 0;


  let horizontal =
    alpha - alphaOrigen;


  horizontal =
    normalizarAngulo(
      horizontal
    );


  const vertical =
    beta - betaOrigen;


  dibujarSenales(
    horizontal,
    vertical,
    delta
  );

}


/* =====================================
   DIBUJAR
===================================== */

function dibujarSenales(
  horizontal,
  vertical,
  delta
) {

  const ancho =
    window.innerWidth;

  const alto =
    window.innerHeight;


  const campoHorizontal =
    65;

  const campoVertical =
    80;


  senales.forEach(senal => {

    if (senal.encontrada) {

      return;

    }


    let diferenciaX =

      senal.horizontal -
      horizontal;


    diferenciaX =
      normalizarAngulo(
        diferenciaX
      );


    const diferenciaY =

      senal.vertical -
      vertical;


    /* ÁNGULO → PANTALLA */

    const x =

      diferenciaX /
      campoHorizontal

      * ancho;


    const y =

      diferenciaY /
      campoVertical

      * alto;


    /* ¿ESTÁ EN PANTALLA? */

    const visible =

      Math.abs(x)
        < ancho * 0.65

      &&

      Math.abs(y)
        < alto * 0.65;


    if (!visible) {

      senal.elemento.style.display =
        "none";

      senal.tiempo = 0;

      return;

    }


    senal.elemento.style.display =
      "flex";


    senal.elemento.style.transform = `

      translate(
        calc(-50% + ${x}px),
        calc(-50% + ${y}px)
      )

    `;


    /* =================================
       DISTANCIA AL CENTRO
    ================================= */

    const distancia =

      Math.sqrt(

        diferenciaX *
        diferenciaX

        +

        diferenciaY *
        diferenciaY

      );


    /* =================================
       CERCA
    ================================= */

    if (distancia < 12) {

      senal.elemento.classList.add(
        "cerca"
      );


      mensaje.textContent =
        "MANTÉN LA POSICIÓN";


      /*
      Tiene que permanecer
      aproximadamente 1 segundo.
      */

      senal.tiempo += delta;


      if (senal.tiempo > 1000) {

        capturarSenal(senal);

      }

    }

    else {

      senal.elemento.classList.remove(
        "cerca"
      );


      senal.tiempo = 0;


      mensaje.textContent =
        "EXPLORA EL ESPACIO";

    }

  });

}


/* =====================================
   CAPTURAR
===================================== */

function capturarSenal(senal) {

  senal.encontrada =
    true;


  senal.elemento.classList.add(
    "encontrada"
  );


  encontradas++;


  contador.textContent =
    `${encontradas} / 3`;


  mensaje.textContent =
    "SEÑAL CAPTURADA";


  if (encontradas === 3) {

    setTimeout(
      mostrarFinal,
      700
    );

  }

}


/* =====================================
   FINAL
===================================== */

function mostrarFinal() {

  final.style.display =
    "block";


  mensaje.style.display =
    "none";

}


/* =====================================
   ÁNGULOS
===================================== */

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
