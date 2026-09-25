const video =
  document.querySelector("#camara");

const canvas =
  document.querySelector("#analisis");

const contexto =
  canvas.getContext("2d", {
    willReadFrequently: true
  });

const boton =
  document.querySelector("#iniciar");

const inicio =
  document.querySelector("#inicio");

const colorTexto =
  document.querySelector("#color");

const grafica =
  document.querySelector("#grafica");


/* ============================
   INICIAR
============================ */

boton.addEventListener(
  "click",
  iniciarCamara
);


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


    inicio.style.display =
      "none";


    analizar();

  }

  catch (error) {

    console.error(
      "Error cámara:",
      error
    );

  }

}


/* ============================
   ANALIZAR CÁMARA
============================ */

function analizar() {

  /*
  No necesitamos analizar
  toda la cámara.

  40 × 40 píxeles son
  suficientes para esta prueba.
  */

  const tamaño =
    40;


  canvas.width =
    tamaño;

  canvas.height =
    tamaño;


  /*
  Tomamos una zona del centro
  del video.
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


  /* ============================
     LEER PÍXELES
  ============================ */

  const imagen =
    contexto.getImageData(

      0,
      0,

      tamaño,
      tamaño

    );


  const pixeles =
    imagen.data;


  let rojo = 0;
  let verde = 0;
  let azul = 0;

  let cantidad = 0;


  /*
  Cada píxel tiene:

  R G B A

  por eso avanzamos
  de 4 en 4.
  */

  for (
    let i = 0;
    i < pixeles.length;
    i += 4
  ) {

    rojo +=
      pixeles[i];

    verde +=
      pixeles[i + 1];

    azul +=
      pixeles[i + 2];


    cantidad++;

  }


  /* ============================
     PROMEDIO
  ============================ */

  rojo =
    Math.round(
      rojo / cantidad
    );


  verde =
    Math.round(
      verde / cantidad
    );


  azul =
    Math.round(
      azul / cantidad
    );


  /* ============================
     HEX
  ============================ */

  const hexadecimal =
    rgbAHex(

      rojo,
      verde,
      azul

    );


  /* ============================
     MOSTRAR RESULTADO
  ============================ */

  colorTexto.textContent =
    hexadecimal;


  grafica.style.backgroundColor =

    `rgb(
      ${rojo},
      ${verde},
      ${azul}
    )`;


  /*
  Repetimos aproximadamente
  10 veces por segundo.

  No necesitamos 60 FPS
  para analizar color.
  */

  setTimeout(

    analizar,

    100

  );

}


/* ============================
   RGB → HEX
============================ */

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

  )

  .toUpperCase();

}
