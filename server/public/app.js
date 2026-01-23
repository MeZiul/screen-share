const socket = io("localhost:3000");

const entrarBtn = document.getElementById('entrar');
const salaInput = document.getElementById('salaInput');
const status = document.getElementById('status');

let intervaloCaptura = null;
let streamAtual = null;
let videoElement = null;
let canvasElement = null;
let ctx = null;

salaInput.addEventListener('input', () => {
  entrarBtn.style.display = salaInput.value.trim() ? 'inline-block' : 'none';
});

salaInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && salaInput.value.trim()) entrarBtn.click();
});

function pararCompartilhamento() {
  if (intervaloCaptura) {
    clearInterval(intervaloCaptura);
    intervaloCaptura = null;
  }
  if (streamAtual) {
    streamAtual.getTracks().forEach(track => track.stop());
    streamAtual = null;
  }
  if (videoElement) {
    videoElement.srcObject = null;
    videoElement = null;
  }
  const room = salaInput.value.trim();
  if (room) socket.emit('leave-room', room);

  status.innerHTML = '<p>Compartilhamento parado.</p>';
  entrarBtn.disabled = false;
}

entrarBtn.onclick = async () => {
  const room = salaInput.value.trim();
  if (!room) return;

  entrarBtn.disabled = true;
  status.innerHTML = 'Aguardando permissão para capturar a tela...';

  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: { ideal: 15, max: 20 }, cursor: "always" },
      audio: false
    });

    streamAtual = stream;
    socket.emit('join-room', room);

    if (!videoElement) {
      videoElement = document.createElement('video');
      videoElement.muted = true;
      videoElement.srcObject = stream;
      videoElement.play().catch(console.error);
    }

    if (!canvasElement) {
      canvasElement = document.createElement('canvas');
      ctx = canvasElement.getContext('2d');
    }

    intervaloCaptura = setInterval(() => {
      if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) return;

      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;

      ctx.drawImage(videoElement, 0, 0);

      const imagem = canvasElement.toDataURL('image/webp', 0.62);

      socket.emit('screen-data', { room, image: imagem });
    }, 80);

    status.innerHTML = `
      <p class="sucesso"><strong>Compartilhando tela na sala: ${room}</strong></p>
      <p>Envie este link para quem vai assistir:</p>
      <code style="background:#ddd; padding:10px; display:inline-block; font-size:14px;">
        ${location.origin}/viewer.html
      </code>
      <br><br>
      <button onclick="pararCompartilhamento()">Parar compartilhamento</button>
    `;

    stream.getVideoTracks()[0].addEventListener('ended', () => {
      pararCompartilhamento();
      status.innerHTML += '<p style="color:orange">Captura de tela interrompida pelo sistema.</p>';
    });

  } catch (err) {
    console.error(err);
    status.innerHTML = '<p style="color:red;">Permissão negada ou erro na captura.</p>';
    entrarBtn.disabled = false;
  }
};