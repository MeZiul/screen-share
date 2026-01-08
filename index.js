require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const ngrok = require('ngrok');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.send('Servidor rodando – acesse /index.html para compartilhar ou /viewer.html para assistir');
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

    socket.on('screen-data', (data) => {
        socket.to(data.room).emit('screen-data', data.image);
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });
});

socket.on('leave-room', room => {
    socket.leave(room);
});

async function startNgrok() {
    try {
        await ngrok.disconnect();
        await ngrok.kill();

        const url = await ngrok.connect({
            addr: PORT,
            authtoken: process.env.NGROK_AUTHTOKEN
        });

        console.log('Ngrok ativo');
        console.log(`${url}`);
        console.log(`Compartilhar tela: ${url}/`);
        console.log(`Assistir tela:     ${url}/view\n`);

    } catch (err) {
        console.error('Erro ao iniciar ngrok:', err.message);
        console.error('Dica: cadastre-se em ngrok.com, pegue o authtoken e rode: set NGROK_AUTHTOKEN=seu_token');
    }// Erro ao iniciar ngrok: invalid tunnel configuration
}

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor local rodando em http://localhost:${PORT}`);
    startNgrok();
});
