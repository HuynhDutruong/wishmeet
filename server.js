const express = require('express');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const socketio = require('socket.io');
const { ExpressPeerServer } = require('peer');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static('public'));

const peerServer = ExpressPeerServer(server, {
  debug: true
});
app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);

    socket.on('raise-hand', () => {
      socket.to(roomId).emit('user-raised-hand', userId);
    });

    socket.on('vote', vote => {
      socket.to(roomId).emit('receive-vote', { userId, vote });
    });

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId);
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
