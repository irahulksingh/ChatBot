/* eslint-disable linebreak-style */
/* eslint-disable no-undef */
/* eslint-disable no-path-concat */
/* eslint-disable prefer-template */
/* eslint-disable no-var */
/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
/* eslint-disable no-use-before-define */
/* eslint-disable no-console */
/* eslint-disable import/newline-after-import */

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var users = [];
var Connections = [];
var dbUrl = 'http://142.93.108.220/?storage=rahul_singh';
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

server.listen(process.env.PORT || 3000);
console.log('server running...');
app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});
io.sockets.on('connection', (socket) => {
  Connections.push(socket);
  console.log('Connected:  %s  User/s Connected', Connections.length);
  // Disconnect
  socket.on('disconnect', (data) => {
    users.splice(users.indexOf(socket.username), 1);
    updateUserName();
    Connections.splice(Connections.indexOf(socket), 1);
    console.log('Disconnected 1 User: %s User/s Still Connected', Connections.length);
  });
  // Send message
  socket.on('send message', (data) => {
    io.sockets.emit('new message', { msg: data, user: socket.username });
  });
  // New user
  socket.on('new user', (data, callback) => {
    callback(true);
    socket.username = data;
    users.push(socket.username);
    updateUserName();
  });
  // Update User names
  function updateUserName() {
    io.sockets.emit('get users', users);
  }
});
// get messages from storage
app.get('/messages', (req, res) => {
  Message.find({}, (err, messages) => {
    res.send(messages);
  });
});
// post messages to storage
app.post('/messages', (req, res) => {
  var message = new Message(req.body);
  message.save((err) => {
    if (err) {
      sendStatus(500);
      res.sendStatus(200); 
    }
  });
});
