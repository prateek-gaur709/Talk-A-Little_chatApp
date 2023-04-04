const http = require('http');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
const port = 4500 || process.env.PORT;

app.get('/', (req, res) => {
  res.send('Hello world');
});

const server = http.createServer(app);

const users = [{}];

const socketIO = require('socket.io');
const io = socketIO(server);

io.on('connection', (socket) => {
  console.log('New connection');
  // console.log(socket.id);

  socket.on('joined', ({ user }) => {
    users[socket.id] = user;
    console.log(`${user} has joined!`);

    socket.broadcast.emit('userJoined', {
      user: 'Admin',
      message: `${user} has joined!`,
    });

    socket.emit('welcome', {
      user: 'Admin',
      message: `Welcome to the chat, ${user}!! `,
    });
  });

  socket.on('message', ({ msg, id }) => {
    console.log(msg);
    io.emit('sendMessage', { user: users[id], msg, id });
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('leave', {
      user: 'Admin',
      message: ` ${users[socket.id]} has left`,
    });
    console.log(`user left: ${users[socket.id]}! `);
    console.log(socket.connected);
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
