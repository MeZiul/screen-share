const socket = io();
const img = document.getElementById('tela');
const juntarBtn = document.getElementById('juntarBtn');
const salaInput = document.getElementById('salaInput');
const pararBtn = document.getElementById('pararBtn');
const status = document.getElementById('status');

let salaAtual = null;
let assistindo = false;

salaInput.addEventListener('input', () => {
    juntarBtn.style.display = salaInput.value.trim() ? 'inline-block' : 'none';
});

salaInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && salaInput.value.trim()) juntarBtn.click();
});

juntarBtn.onclick = () => {
    const sala = salaInput.value.trim();
    if (!sala) return;

    salaAtual = sala;
    assistindo = true;

    socket.emit('join-room', sala);

    status.textContent = `Assistindo à sala: ${sala}`;
    juntarBtn.style.display = 'none';
    pararBtn.style.display = 'inline-block';
    // img.alt = 'Aguardando compartilhamento...';
};

pararBtn.onclick = () => {
    if (!assistindo) return;
    socket.emit('leave-room', salaAtual);

    assistindo = false;
    salaAtual = null;
    tela.src = '';
    status.textContent = 'Compartilhamento encerrado.';
    juntarBtn.style.display = 'inline-block';
    pararBtn.style.display = 'none';
    // img.alt = 'Compartilhamento encerrado.';
}

socket.on('screen-data', (imageData) => {
    img.src = imageData;
    img.alt = 'Tela compartilhada';
});