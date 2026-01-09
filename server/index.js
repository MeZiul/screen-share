require('dotenv').config({ quiet: true });

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
let ngrok = null;
if (process.env.USE_NGROK === 'true') {
    try{ ngrok = require('ngrok');}
    catch (err) {console.error('ngrok não instalado, ignorando...');}
}

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    perMessageDeflate: false,
    maxHttpBufferSize: 1e8
});

const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== 'production';

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'viewer.html'));
});

app.get('/view/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'viewer.html'));
});

const ultimoframe = new Map();
const FRAME_INTERVAL = 50;

io.on('connection', socket => {
    if (isDev) console.log('Conectado:', socket.id);

    socket.on('join-room', room => socket.join(room));

    socket.on('leave-room', room => socket.leave(room));

    socket.on('screen-data', ({ room, image }) => {
        const agora = Date.now();
        const ultimo = ultimoframe.get(room) || 0;

        if (agora - ultimo < FRAME_INTERVAL) return;

        ultimoframe.set(room, agora);
        socket.to(room).emit('screen-data', image);
    });

    socket.on('disconnect', () => {
        if (isDev) console.log('Desconectado:', socket.id);
    });
});

async function startNgrok() {
    try {
        await ngrok.disconnect();
        await ngrok.kill();

        const url = await ngrok.connect({
            addr: PORT,
            authtoken: process.env.NGROK_AUTHTOKEN
        });

        console.log(`Ngrok ativo:   ${url}`);
        console.log(`Compartilhar:  ${url}/`);
        console.log(`Assistir:      ${url}/view\n`);

    } catch (err) {
        console.error('Erro ao iniciar ngrok:', err.message);
        console.error('Dica: cadastre-se em ngrok.com, pegue o authtoken e rode: set NGROK_AUTHTOKEN=seu_token');
    }
}

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    if (isDev && ngrok) {
        startNgrok();
    }
});
