const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filters = require('bad-words');
const { generateMessage, generateLocation } = require('./utils/messages');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('./utils/users');
const app = express();
//another way of creating server
//because server must be a arg to the socketio
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath)); //serving the static directory

// app.get('/', (req, res) => {
//   res.render('index');
// });

//let count = 0;
//------------>server (emit) -> client (recive) - countUpdated
//------------> client (emit) -> server (recive) - increment

//-------------> socket connection
io.on('connection', socket => {
  //join event listner
  socket.on('join', ({ username, room }, callback) => {
    //----------> when user join addUser called
    //this gives an error and a user
    const { error, user } = addUser({
      id: socket.id, //gice a unique id from socket
      username,
      room,
    });
    //when there an error in joinig
    //
    if (error) return callback(error);

    //this user came from the users array from util
    socket.join(user.room);

    //when user join send the join message
    socket.emit('message', generateMessage('Admin', 'Welcome'));

    //-----------> when new user connect display this mesaage to everyone except connected user
    //---->here message will be sent to the specific chat room
    socket.broadcast
      .to(user.room)
      .emit('message', generateMessage('Admin', `${user.username} has joind!`));

    //when user join the room will updates
    //get the user list and the room in the room
    //new event emitter to send the all users
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback(); //acknoledege
  });

  //------->message event
  socket.on('reply', (reply, cb) => {
    const badword = new Filters();
    if (badword.isProfane(reply)) return cb('Propanenity is not allowed');
    //if user used a bad word the message will be rejeted

    const user = getUser(socket.id);

    //send chat to specific room
    if (user)
      io.to(user.room).emit('message', generateMessage(user.username, reply));
    cb(); //configure event acknoledgemtn from clicnt to server
  });

  //----------> reciing location event
  socket.on('sendLocation', (position, cb) => {
    const user = getUser(socket.id);
    //after send location event emits the new location message event will fire
    if (user)
      io.to(user.room).emit(
        'locationMessage',
        generateLocation(user.username, position),
      );
    cb(); //----> event ack callbak without passing any para
  });
  //---------->when user left display a message to every user
  //it's build in event
  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user)
      //if user removed from a room
      io.to(user.room).emit(
        //message sent to specific user
        'message',
        generateMessage('Admin', `${user.username} has left!`),
      );
    //when user disconnect
    //get the user list and the room in the room
    //new event emitter to send the all users
    // if (user.room)
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
  });
  //   //send an event
  //   //create a new event
  //   socket.emit('countUpdated', count);

  //   //from client to server
  //   socket.on('increment', () => {
  //     count++;
  //     //--------->emit event in single connection
  //     //socket.emit('countUpdated', count);

  //     //---->emit event to all connections
  //     io.emit('countUpdated', count);
  //   });
});

//----------> server connection
server.listen(port, () => console.log(`app running at ${port}`));
