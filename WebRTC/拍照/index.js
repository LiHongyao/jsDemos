let mediaStream;
let photoSrc;

const videoElement = document.getElementById("video");
const photoElement = document.getElementById('photo');



async function openCamera() {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: 300,
        height: 300
      }
    });
    videoElement.srcObject = mediaStream;

  } catch (error) {
    console.log(error);
  }
}


function closeCamera() {
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
    videoElement.srcObject = null;
  }
}

function takePhoto() {
  if (mediaStream) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const videoWidth = videoElement.videoWidth;
    const videoHeight = videoElement.videoHeight;
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    context?.drawImage(videoElement, 0, 0, videoWidth, videoHeight);
    photoSrc = canvas.toDataURL('image/jpeg');
    photoElement.src = photoSrc;
  }
}

function download() {
  if (photoSrc) {
    const downloadLink = document.createElement('a');
    downloadLink.href = photoSrc;
    downloadLink.download = `${Date.now()}.jpeg`;
    downloadLink.click();
  }
}