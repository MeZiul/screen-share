const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'display_copy.html'));
});

io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    socket.on('join-room', (room) => {
        socket.join(room);
        console.log(`Socket ${socket.id} entrou na sala ${room}`);
    });

    socket.on('screen-data', (data) => {
        if (!data?.room || !data?.image) return;
        io.to(data.room).emit('screen-data', data.image);
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });
});

server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
    console.log('Acesse http://localhost:3000');
});
