const http = require('http');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const app = express();
app.use(cors());

dotenv.config();
const BASE_URL = process.env.BASE_URL;
const port = process.env.PORT || 4500;

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
      msg: `${user} has joined!`,
    });

    socket.emit('welcome', {
      user: 'Admin',
      msg: `Welcome to the chat, ${user}!! `,
    });
  });

  socket.on('message', ({ msg, id }) => {
    console.log(msg);
    io.emit('sendMessage', { user: users[id], msg, id });
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('leave', {
      user: 'Admin',
      msg: ` ${users[socket.id]} has left`,
    });
    console.log(`user left: ${users[socket.id]}! `);
    console.log(socket.connected);
  });
});

server.listen(port, () => {
  console.log(`Server is running on ${BASE_URL}`);
});
