console.log('VIEWER CARREGADO');

const socket = io('http://localhost:3000');

const previewImg = document.getElementById('preview');
const goBtn = document.getElementById('go');
const roomInput = document.getElementById('roomInput');

let currentRoom = null;

roomInput.addEventListener('input', () => {
  roomInput.value
    ? goBtn.classList.remove('hidden')
    : goBtn.classList.add('hidden');
});

goBtn.addEventListener('click', () => {
  currentRoom = roomInput.value.trim();
  if (!currentRoom) return;

  socket.emit('join-room', currentRoom);
});

socket.on('screen-data', (data) => {
  previewImg.src = data;
});
