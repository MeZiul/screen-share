const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'style.css'));
})

app.get('/view/', (req, res) => {
    res.sendFile(path.join(__dirname, 'display.html'));
});

const rooms = {};

io.on('connection', (socket) => {
    console.log("Nova conexão: ", socket.id);

    socket.on("join-room", (room) => {
        socket.join(room);

        if (!rooms[room]) {
            rooms[room] = { sharer: socket.id, viewers: [] };
            console.log(`Compartilhador ${socket.id} criou a sala ${room}`);
        } else {
            rooms[room].viewers.push(socket.id);
            console.log(`Visualizador ${socket.id} entrou na sala ${room}`);
        }
    });

    socket.on("screen-data", (data) => {
        let room, image;

        if (typeof data === 'object' && data.room && data.image) {
            room = data.room;
            image = data.image;
        } else {
            console.error("Dados inválidos recebidos no evento 'screen-data'");
            return;
        }
        console.log(`Recebido frame da sala ${room} – tamanho: ${(image.length / 1024).toFixed(1)} KB`);

        io.to(room).emit("screen-data", image);
    });

    socket.on('disconnect', () => {
        console.log('Desconectado: ', socket.id);
    });
})

const PORT = process.env.PORT || process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://localhost:${PORT}/view`);
    console.log(`- Compartilhador: use o app Electron`);
});
// http.listen(PORT, () => {
//     console.log("Started on : "+ PORT);
// })