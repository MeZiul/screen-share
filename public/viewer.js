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

if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
        const isHidden = sidebar.classList.toggle('hidden');
        toggleBtn.textContent = isHidden ? '❯' : '☰';
    });
}

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
    if (agora - state.ultimaAtualizacao < 50) return;

    state.ultimaAtualizacao = agora;
    img.src = imageData;
    img.alt = 'Tela compartilhada';
});

socket.on('connect_error', () => {
    status.textContent = 'Erro de conexão com o servidor.';
    atualizarUI(false);
});

window.addEventListener('beforeunload', () => {
    if (state.assistindo && state.salaAtual) {
        socket.emit('leave-room', state.salaAtual);
    }
});