const socket = io();

const img = document.getElementById('tela');
const juntarBtn = document.getElementById('juntarBtn');
const salaInput = document.getElementById('salaInput');
const pararBtn = document.getElementById('pararBtn');
const status = document.getElementById('status');
const toggleBtn = document.getElementById('toggleSidebar');
const sidebar = document.getElementById('inputArea');

const state = {
    salaAtual: null,
    assistindo: false,
    ultimaAtualizacao: 0
};

const mostrar = el => el.style.display = 'inline-block';
const esconder = el => el.style.display = 'none';

function atualizarUI(assistindo) {
    state.assistindo = assistindo;

    if (assistindo) {
        esconder(juntarBtn);
        mostrar(pararBtn);
        sidebar.classList.add('hidden');
        toggleBtn.textContent = '❯';
    } else {
        mostrar(juntarBtn);
        esconder(pararBtn);
        sidebar.classList.remove('hidden');
        toggleBtn.textContent = '☰';
        img.src = '';
    }
}


toggleBtn?.addEventListener('click', () => {
    const isHidden = sidebar.classList.toggle('hidden');
    toggleBtn.textContent = isHidden ? '❯' : '☰';
});


salaInput.addEventListener('input', () => {
    salaInput.value.trim() ? mostrar(juntarBtn) : esconder(juntarBtn);
});

salaInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && salaInput.value.trim()) juntarBtn.click();
});

juntarBtn.addEventListener('click', () => {
    const sala = salaInput.value.trim();
    if (!sala || sala === state.salaAtual) return;

    state.salaAtual = sala;

    socket.emit('join-room', sala);

    status.textContent = `Assistindo à sala: ${sala}`;
    atualizarUI(true);
});

pararBtn.addEventListener('click', () => {
    if (!state.assistindo) return;

    socket.emit('leave-room', state.salaAtual);

    state.salaAtual = null;
    status.textContent = 'Compartilhamento encerrado.';
    atualizarUI(false);
});

socket.on('screen-data', imageData => {
    const agora = Date.now();
    if (agora - state.ultimaAtualizacao < 40) return;

    state.ultimaAtualizacao = agora;
    img.src = imageData;
    img.alt = 'Tela compartilhada';
});

socket.on('connect_error', () => {
    status.textContent = 'Erro de conexão com o servidor.';
    atualizarUI(false);
});

function getRoom() {
    return state.salaAtual || salaInput.value.trim();
}

img.addEventListener('mousemove', e => {
    if (!state.assistindo) return;
    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    socket.emit('mouse-move', JSON.stringify({
        room: getRoom(),
        x: x / rect.width,
        y: y / rect.height
    }));
});

img.addEventListener('click', e => {
    if (!state.assistindo) return;
    const rect = img.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    socket.emit('mouse-click', JSON.stringify({
        room: getRoom(), x, y
    }));
});

function moverCursorPara(x, y) {
    socket.emit('mouse-move', JSON.stringify({
        room: getRoom(),
        x: x,
        y: y
    }));
}

window.addEventListener('keydown', e => {
    if (!state.assistindo) return;
    if (e.ctrlKey && e.key.toLowerCase() === 'r') return;

    socket.emit('type', JSON.stringify({
        room: getRoom(),
        key: e.key,
        code: e.code,
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        alt: e.altKey
    }));
});

window.addEventListener('beforeunload', () => {
    if (state.assistindo && state.salaAtual) {
        socket.emit('leave-room', state.salaAtual);
    }
});