const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const ngrok = require('ngrok');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.send('Servidor OK');
});

app.get('/view/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'viewer.html'));
});

io.on('connection', socket => {
    console.log('Cliente conectado:', socket.id);

    socket.on('join-room', room => {
        socket.join(room);
        console.log(`Socket ${socket.id} entrou na sala ${room}`);
    });

    socket.on('screen-data', data => {
        socket.to(data.room).emit('screen-data', data.image);
    });
});
const PORT = 3000;

async function startNgrok() {
    try {
        await ngrok.disconnect();
        await ngrok.kill();

        const url = await ngrok.connect({
            addr: PORT,
            proto: 'http'
        });

        console.log('Ngrok ativo!');
        console.log(`${url}`);
        console.log(`Viewer: ${url}/viewer.html`);

    } catch (err) {
        console.error('Erro ao iniciar ngrok:', err.message);
    }// Erro ao iniciar ngrok: invalid tunnel configuration
}

server.listen(PORT, '0.0.0.0', async () => {
    console.log(`Servidor local rodando em http://localhost:${PORT}`);
    await startNgrok();
});
