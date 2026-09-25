const video =
  document.querySelector("#camara");

const boton =
  document.querySelector("#iniciar");

const inicio =
  document.querySelector("#inicio");


const capa1 =
  document.querySelector("#capa1");

const capa2 =
  document.querySelector("#capa2");

const capa3 =
  document.querySelector("#capa3");


const betaTexto =
  document.querySelector("#beta");

const gammaTexto =
  document.querySelector("#gamma");


/* -----------------------
   INICIAR
----------------------- */

boton.addEventListener("click", async () => {

  await iniciarCamara();

  await iniciarOrientacion();

});


/* -----------------------
   CÁMARA
----------------------- */

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


/* -----------------------
   ORIENTACIÓN
----------------------- */

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
          "Se necesita acceso a la orientación."
        );

        return;

      }

    }


    window.addEventListener(
      "deviceorientation",
      moverCapas
    );


    inicio.style.display = "none";


  } catch (error) {

    console.error(
      "Error de orientación:",
      error
    );

  }

}


/* -----------------------
   PARALLAX
----------------------- */

function moverCapas(evento) {

  const beta =
    evento.beta || 0;

  const gamma =
    evento.gamma || 0;


  betaTexto.textContent =
    beta.toFixed(1);

  gammaTexto.textContent =
    gamma.toFixed(1);


  /*
  Limitamos el movimiento.
  */

  const x =
    limitar(gamma, -35, 35);

  const y =
    limitar(beta, -35, 35);


  /*
  Cada capa se mueve
  una distancia distinta.
  */

  mover(capa1, x, y, 0.5);

  mover(capa2, x, y, 1.5);

  mover(capa3, x, y, 3);

}


/* -----------------------
   MOVIMIENTO DE CAPA
----------------------- */

function mover(
  elemento,
  x,
  y,
  profundidad
) {

  const movimientoX =
    x * profundidad;

  const movimientoY =
    y * profundidad;


  elemento.style.transform = `
    translate(
      ${movimientoX}px,
      ${movimientoY}px
    )
  `;

}


/* -----------------------
   LIMITAR VALOR
----------------------- */

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
