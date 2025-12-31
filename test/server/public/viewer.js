const socket = io();
let room = null;

const roomInput = document.getElementById('room');
const goBtn = document.getElementById('go');

roomInput.addEventListener('input', () => {
  goBtn.style.display = roomInput.value.trim() ? 'block' : 'none';
});

goBtn.addEventListener('click', () => {
  room = roomInput.value.trim();
  if (!room) {
    alert('Por favor, insira a sala.');
    return;
  }
  socket.emit('join-room', room);
});

socket.on('screen-data', (image) => {
  document.getElementById('screen').src =
    'data:image/jpeg;base64,' + image;

  document.getElementById('status').textContent = 'Ao vivo';
});
