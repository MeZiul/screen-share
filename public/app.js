const socket = io();

const goBtn = document.getElementById('go');
const roomInput = document.getElementById('roomInput');

goBtn.onclick = async () => {
  const room = roomInput.value.trim();
  if (!room) return;

  socket.emit('join-room', room);

  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: { frameRate: 10 }
  });

  const video = document.createElement('video');
  video.srcObject = stream;
  video.play();

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  setInterval(() => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    socket.emit('screen-data', {
      room,
      image: canvas.toDataURL('image/webp', 0.4)
    });
  }, 200);
};
