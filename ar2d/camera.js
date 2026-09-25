const video = document.querySelector("#camara");

const boton = document.querySelector("#botonCamara");

const inicio = document.querySelector("#inicio");


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


    inicio.style.display = "none";


  } catch (error) {

    console.error(
      "No se pudo iniciar la cámara:",
      error
    );


    alert(
      "No fue posible acceder a la cámara."
    );

  }

}


boton.addEventListener(
  "click",
  iniciarCamara
);
