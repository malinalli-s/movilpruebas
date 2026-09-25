/* =========================================================
   CARTEL MÓVIL
   Exploración + señales + guía punteada
========================================================= */


/* =========================================================
   ELEMENTOS HTML
========================================================= */

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

const ruta =
  document.querySelector("#ruta");


/* =========================================================
   SEÑALES DEL MUNDO

   horizontal:
   izquierda (-) / derecha (+)

   vertical:
   arriba (-) / abajo (+)
========================================================= */

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


/* =========================================================
   VARIABLES GENERALES
========================================================= */

let alphaOrigen = 0;
let betaOrigen = 0;

let encontradas = 0;

let ultimoTiempo = 0;

let calibrado = false;


/* =========================================================
   INICIO
========================================================= */

boton.addEventListener(
  "click",
  iniciarExperiencia
);


async function iniciarExperiencia() {

  await iniciarCamara();

  await iniciarOrientacion();

}


/* =========================================================
   CÁMARA
========================================================= */

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


    mensaje.textContent =
      "NO SE PUDO ABRIR LA CÁMARA";

  }

}


/* =========================================================
   ORIENTACIÓN
========================================================= */

async function iniciarOrientacion() {

  try {

    /*
    En iPhone / iPad
    necesitamos solicitar permiso.
    */

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
          "Se necesita acceso a la orientación."
        );

        return;

      }

    }


    /*
    La primera lectura se usa
    como posición inicial.
    */

    window.addEventListener(
      "deviceorientation",
      calibrar,
      { once: true }
    );

  }

  catch (error) {

    console.error(
      "Error orientación:",
      error
    );

  }

}


/* =========================================================
   CALIBRACIÓN
========================================================= */

function calibrar(evento) {

  alphaOrigen =
    evento.alpha || 0;

  betaOrigen =
    evento.beta || 0;


  calibrado = true;


  inicio.style.display =
    "none";


  ultimoTiempo =
    performance.now();


  mensaje.textContent =
    "SIGUE LA RUTA";


  window.addEventListener(
    "deviceorientation",
    actualizar
  );

}


/* =========================================================
   ACTUALIZAR
========================================================= */

function actualizar(evento) {

  if (!calibrado) return;


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


  /* -------------------------
     MOVIMIENTO HORIZONTAL
  ------------------------- */

  let horizontal =
    alpha - alphaOrigen;


  horizontal =
    normalizarAngulo(
      horizontal
    );


  /* -------------------------
     MOVIMIENTO VERTICAL
  ------------------------- */

  const vertical =
    beta - betaOrigen;


  dibujarSenales(
    horizontal,
    vertical,
    delta
  );

}


/* =========================================================
   DIBUJAR SEÑALES
========================================================= */

function dibujarSenales(
  horizontal,
  vertical,
  delta
) {

  const ancho =
    window.innerWidth;

  const alto =
    window.innerHeight;


  /*
  Campo visual aproximado.
  */

  const campoHorizontal =
    65;

  const campoVertical =
    80;


  /*
  Aquí guardaremos la posición
  de la siguiente señal.
  */

  let siguienteSenal = null;


  /*
  Controlamos si estamos
  cerca de alguna señal.
  */

  let haySenalCerca = false;


  senales.forEach(senal => {


    /* -------------------------
       IGNORAR ENCONTRADAS
    ------------------------- */

    if (senal.encontrada) {

      return;

    }


    /* -------------------------
       DIFERENCIA HORIZONTAL
    ------------------------- */

    let diferenciaX =

      senal.horizontal -
      horizontal;


    diferenciaX =
      normalizarAngulo(
        diferenciaX
      );


    /* -------------------------
       DIFERENCIA VERTICAL
    ------------------------- */

    const diferenciaY =

      senal.vertical -
      vertical;


    /* -------------------------
       ÁNGULO → PÍXELES
    ------------------------- */

    const x =

      diferenciaX /
      campoHorizontal

      * ancho;


    const y =

      diferenciaY /
      campoVertical

      * alto;


    /* =====================================================
       ELEGIR SIGUIENTE SEÑAL

       Tomamos la primera señal
       que todavía no ha sido encontrada.
    ===================================================== */

    if (siguienteSenal === null) {

      siguienteSenal = {

        senal: senal,

        x: x,
        y: y,

        diferenciaX:
          diferenciaX,

        diferenciaY:
          diferenciaY

      };

    }


    /* =====================================================
       VISIBILIDAD
    ===================================================== */

    const visible =

      Math.abs(x)
        < ancho * 0.65

      &&

      Math.abs(y)
        < alto * 0.65;


    if (!visible) {

      senal.elemento.style.display =
        "none";


      senal.elemento.classList.remove(
        "cerca"
      );


      senal.tiempo = 0;


      return;

    }


    /* =====================================================
       MOSTRAR SEÑAL
    ===================================================== */

    senal.elemento.style.display =
      "flex";


    senal.elemento.style.transform = `

      translate(
        calc(-50% + ${x}px),
        calc(-50% + ${y}px)
      )

    `;


    /* =====================================================
       DISTANCIA ANGULAR AL CENTRO
    ===================================================== */

    const distancia =

      Math.sqrt(

        diferenciaX *
        diferenciaX

        +

        diferenciaY *
        diferenciaY

      );


    /* =====================================================
       CERCA DEL CENTRO
    ===================================================== */

    if (distancia < 12) {

      haySenalCerca = true;


      senal.elemento.classList.add(
        "cerca"
      );


      mensaje.textContent =
        "MANTÉN LA POSICIÓN";


      /*
      Acumulamos tiempo.
      */

      senal.tiempo += delta;


      /*
      Después de 1 segundo:
      señal encontrada.
      */

      if (senal.tiempo > 1000) {

        capturarSenal(
          senal
        );

      }

    }

    else {

      senal.elemento.classList.remove(
        "cerca"
      );


      senal.tiempo = 0;

    }

  });


  /* =====================================================
     RUTA PUNTEADA
  ===================================================== */

  if (
    siguienteSenal &&
    !haySenalCerca
  ) {

    dibujarRuta(

      siguienteSenal.x,
      siguienteSenal.y

    );


    ruta.style.display =
      "block";


    mensaje.textContent =
      "SIGUE LA RUTA";

  }

  else {

    /*
    Cuando llegamos a la señal
    quitamos la ruta.
    */

    ruta.style.display =
      "none";

  }

}


/* =========================================================
   DIBUJAR RUTA PUNTEADA
========================================================= */

function dibujarRuta(
  x,
  y
) {

  const ancho =
    window.innerWidth;

  const alto =
    window.innerHeight;


  /*
  La mira está en el centro.
  Como SVG usa viewBox 0 0 100 100:

  centro = 50,50
  */

  const inicioX =
    50;

  const inicioY =
    50;


  /* =====================================================
     CONVERTIR PÍXELES → SVG
  ===================================================== */

  let destinoX =

    50 +

    (x / ancho)
    * 100;


  let destinoY =

    50 +

    (y / alto)
    * 100;


  /* =====================================================
     MANTENER DESTINO EN PANTALLA

     Si la señal está fuera de pantalla,
     la línea termina cerca del borde.

     Esto funciona como indicación
     de dirección.
  ===================================================== */

  destinoX =
    limitar(
      destinoX,
      5,
      95
    );


  destinoY =
    limitar(
      destinoY,
      5,
      95
    );


  /* =====================================================
     CURVA

     Punto inicial:
          centro

     Punto final:
          dirección de la señal

     El punto de control genera
     una curva en vez de una línea recta.
  ===================================================== */

  const mitadX =

    (
      inicioX +
      destinoX
    )

    / 2;


  const mitadY =

    (
      inicioY +
      destinoY
    )

    / 2;


  /*
  Curvatura.

  Puedes cambiar 12 por:

  5  = curva pequeña
  20 = curva grande
  30 = curva exagerada
  */

  const curvatura =
    12;


  /*
  Calculamos un vector
  perpendicular a la dirección.
  */

  const dx =
    destinoX -
    inicioX;


  const dy =
    destinoY -
    inicioY;


  const longitud =

    Math.sqrt(

      dx * dx +

      dy * dy

    ) || 1;


  const perpendicularX =

    -dy /
    longitud;


  const perpendicularY =

    dx /
    longitud;


  const controlX =

    mitadX +

    perpendicularX *
    curvatura;


  const controlY =

    mitadY +

    perpendicularY *
    curvatura;


  /* =====================================================
     CREAR PATH SVG
  ===================================================== */

  const path = `

    M
    ${inicioX}
    ${inicioY}

    Q
    ${controlX}
    ${controlY}

    ${destinoX}
    ${destinoY}

  `;


  ruta.setAttribute(
    "d",
    path
  );

}


/* =========================================================
   CAPTURAR SEÑAL
========================================================= */

function capturarSenal(
  senal
) {

  /*
  Evitar doble captura.
  */

  if (senal.encontrada) {

    return;

  }


  senal.encontrada =
    true;


  senal.elemento.classList.add(
    "encontrada"
  );


  senal.elemento.style.display =
    "none";


  encontradas++;


  contador.textContent =

    `${encontradas} / ${senales.length}`;


  mensaje.textContent =
    "SEÑAL CAPTURADA";


  ruta.style.display =
    "none";


  /* =====================================================
     ¿TERMINAMOS?
  ===================================================== */

  if (
    encontradas ===
    senales.length
  ) {

    setTimeout(
      mostrarFinal,
      700
    );

  }

}


/* =========================================================
   CARTEL FINAL
========================================================= */

function mostrarFinal() {

  final.style.display =
    "block";


  mensaje.style.display =
    "none";


  ruta.style.display =
    "none";

}


/* =========================================================
   NORMALIZAR ÁNGULOS

   Evita problemas cuando alpha
   pasa de 359° a 0°.
========================================================= */

function normalizarAngulo(
  angulo
) {

  while (
    angulo > 180
  ) {

    angulo -= 360;

  }


  while (
    angulo < -180
  ) {

    angulo += 360;

  }


  return angulo;

}


/* =========================================================
   LIMITAR VALOR
========================================================= */

function limitar(
  valor,
  minimo,
  maximo
) {

  return Math.min(

    Math.max(
      valor,
      minimo
    ),

    maximo

  );

}
