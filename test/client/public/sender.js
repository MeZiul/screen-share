const socket = io('http://localhost:3000');

const startBtn = document.getElementById('start');

let currentRoom = null;
let stream = null;

startBtn.addEventListener('click', async () => {
  currentRoom = prompt('Código da sala:');
  if (!currentRoom) return;

  socket.emit('join-room', currentRoom);

  await startCapture();
});

async function startCapture() {
  const sources = await window.electronAPI.captureSources();
  const screenSource = sources[0]; // tela principal

  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: screenSource.id,
        minWidth: 1280,
        minHeight: 720,
        maxFrameRate: 10
      }
    }
  });

  captureLoop();
}

function captureLoop() {
  const video = document.createElement('video');
  video.srcObject = stream;
  video.play();

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  video.onloadedmetadata = () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    setInterval(() => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const image = canvas.toDataURL('image/jpeg', 0.6);

      socket.emit('screen-data', {
        room: currentRoom,
        image
      });
    }, 100); // ~10 FPS
  };
}
