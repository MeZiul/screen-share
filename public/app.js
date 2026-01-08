const socket = io();

const entrarBtn = document.getElementById('entrar');
const salaInput = document.getElementById('salaInput');
const status = document.getElementById('status');

let intervaloCaptura = null;
let streamAtual = null;

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
  status.innerHTML = '<p>Compartilhamento encerrado.</p>';
}

entrarBtn.onclick = async () => {
  const room = salaInput.value.trim();
  if (!room) return;

  status.innerHTML = 'Aguardando permissão para capturar a tela...';

  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: { ideal: 15, max: 20 } },
      audio: false
    });

    socket.emit('join-room', room);

    const video = document.createElement('video');
    video.srcObject = stream;
    video.muted = true;
    video.play();

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const interval = setInterval(() => {
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imagem = canvas.toDataURL('image/webp', 0.5);

      socket.emit('screen-data', { room, image: imagem });
    }, 150);

    status.innerHTML = `
      <p class="sucesso"><strong>Compartilhando tela na sala: ${room}</strong></p>
      <p>Envie este link para quem vai assistir:</p>
      <code style="background:#ddd; padding:10px; display:inline-block; font-size:14px;">
        ${location.origin}/viewer.html
      </code>
      <br><br>
      <button onclick="pararCompartilhamento()">Parar compartilhamento</button>
    `;

    stream.getVideoTracks()[0].addEventListener('ended', pararCompartilhamento);

  } catch (err) {
    console.error(err);
    status.innerHTML = '<p style="color:red;">Permissão negada ou erro ao capturar tela.</p>';
  }
};