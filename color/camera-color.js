const video =
  document.querySelector("#camara");

const canvas =
  document.querySelector("#analisis");

const contexto =
  canvas.getContext(
    "2d",
    {
      willReadFrequently: true
    }
  );

const texto =
  document.querySelector("#texto");

const colorTexto =
  document.querySelector("#color");

const luzTexto =
  document.querySelector("#luz");

const boton =
  document.querySelector("#iniciar");

const inicio =
  document.querySelector("#inicio");


/* =========================
   INICIAR
========================= */

boton.addEventListener(
  "click",
  iniciar
);


async function iniciar() {

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


    inicio.style.display =
      "none";


    analizar();

  }

  catch (error) {

    console.error(error);

  }

}


/* =========================
   ANALIZAR
========================= */

function analizar() {

  const tamaño =
    40;


  canvas.width =
    tamaño;

  canvas.height =
    tamaño;


  /*
  Centro de la imagen
  de la cámara.
  */

  const origenX =

    video.videoWidth / 2

    - tamaño / 2;


  const origenY =

    video.videoHeight / 2

    - tamaño / 2;


  contexto.drawImage(

    video,

    origenX,
    origenY,

    tamaño,
    tamaño,

    0,
    0,

    tamaño,
    tamaño

  );


  const imagen =
    contexto.getImageData(

      0,
      0,

      tamaño,
      tamaño

    );


  const pixeles =
    imagen.data;


  let r = 0;
  let g = 0;
  let b = 0;

  let cantidad = 0;


  for (
    let i = 0;
    i < pixeles.length;
    i += 4
  ) {

    r +=
      pixeles[i];

    g +=
      pixeles[i + 1];

    b +=
      pixeles[i + 2];

    cantidad++;

  }


  r =
    Math.round(
      r / cantidad
    );

  g =
    Math.round(
      g / cantidad
    );

  b =
    Math.round(
      b / cantidad
    );


  /* =========================
     LUMINOSIDAD
  ========================= */

  const luminosidad =

    0.2126 * r +

    0.7152 * g +

    0.0722 * b;


  /* =========================
     HEX
  ========================= */

  const hex =
    rgbAHex(
      r,
      g,
      b
    );


  colorTexto.textContent =
    hex;


  luzTexto.textContent =

    "LUZ " +

    Math.round(
      luminosidad
    );


  /* =========================
     COLOR → TEXTO
  ========================= */

  texto.style.color =

    `rgb(
      ${r},
      ${g},
      ${b}
    )`;


  /* =========================
     LUZ → ESCALA
  ========================= */

  /*
  luminosidad:
  0   = oscuro
  255 = claro

  Lo convertimos aproximadamente:

  0   → 12vw
  255 → 28vw
  */

  const tamañoTexto =

    mapear(

      luminosidad,

      0,
      255,

      12,
      28

    );


  texto.style.fontSize =

    `${tamañoTexto}vw`;


  /* =========================
     LUZ → ESPACIADO
  ========================= */

  /*
  Oscuro:
  letras más comprimidas.

  Claro:
  letras más abiertas.
  */

  const espaciado =

    mapear(

      luminosidad,

      0,
      255,

      -0.12,
      0.08

    );


  texto.style.letterSpacing =

    `${espaciado}em`;


  setTimeout(
    analizar,
    100
  );

}


/* =========================
   MAPEAR
========================= */

function mapear(
  valor,
  minimoEntrada,
  maximoEntrada,
  minimoSalida,
  maximoSalida
) {

  return (

    minimoSalida +

    (
      (
        valor -
        minimoEntrada
      )

      /

      (
        maximoEntrada -
        minimoEntrada
      )
    )

    *

    (
      maximoSalida -
      minimoSalida
    )

  );

}


/* =========================
   RGB → HEX
========================= */

function rgbAHex(
  r,
  g,
  b
) {

  return (

    "#" +

    [r, g, b]

      .map(valor =>

        valor
          .toString(16)
          .padStart(2, "0")

      )

      .join("")

  ).toUpperCase();

}
