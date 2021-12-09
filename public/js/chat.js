//const moment = require('moment');

const socket = io();

// const btnInc = document.querySelector('#increment');

// btnInc.addEventListener('click', () => {
//   //emiting an event from client
//   socket.emit('increment');
// });

// //recieving the count updated event
// socket.on('countUpdated', count => {
//   console.log('The count has been updated  :' + count);
// });

//------->elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $shareLocationButton = document.querySelector('#share-location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');
//---------------->templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;
//------------->options
//getting the username and password from Quary string library
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

//----------------->Auto Scrolling
const autoScroll = () => {
  //new message element
  const $newMessage = $messages.lastElementChild;

  //Height of the new message
  const newMessageStyle = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyle.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //visible height
  const visibleHeight = $messages.offsetHeight;

  //height of messages container
  const containerHeight = $messages.scrollHeight;

  //how have I scroll
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

//-----------------> chating
socket.on('message', message => {
  //cb first arg will be the message

  //------------------>messages will render here
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a'),
    //moment comes from cdn
    //rendering dynamic messages
  });
  $messages.insertAdjacentHTML('beforeend', html); //appedning html to the div
  // console.log(message);
  autoScroll();
});

document.querySelector('#message-form').addEventListener('submit', e => {
  e.preventDefault();

  //---------------> disable form when submitting the form
  $messageFormButton.setAttribute('disabled', 'disabled');

  //const reply = document.querySelector('input').value;
  const reply = e.target.elements.message.value;

  //----------------->event acknoledegement is the last arg of the event emitter
  //----------------> its a callback
  socket.emit('reply', reply, error => {
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();
    //event acknoledgement
    if (error) return console.log(error);
    console.log('the message is sent!');
  });
});

//-------------->location message
socket.on('locationMessage', location => {
  console.log(location);
  //dynamic location
  const html = Mustache.render(locationTemplate, {
    username: location.username,
    url: location.url, //rendering dynamic messages
    sharedAt: moment(location.createdAt).format('h:mm a'),
  });
  $messages.insertAdjacentHTML('beforeend', html); //appedning html to the div
  // console.log(message);
  autoScroll();
});

//------> using web geolocation api emitting location event from client
$shareLocationButton.addEventListener('click', () => {
  if (!navigator.geolocation)
    return alert('unable to connect! browser not supported');
  $shareLocationButton.setAttribute('disabled', 'disabled');
  navigator.geolocaation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      socket.emit(
        'sendLocation',
        `https://google.com/maps?q=${latitude},${longitude}`,
        () => {
          $shareLocationButton.removeAttribute('disabled');
          console.log('Location shared!');
        },
      );
    },

    () => {
      console.log('unable to connect!');
    },
  );
});

//-------------->emitting a event to pass the uername and room to the server
socket.emit('join', { username, room }, error => {
  if (error) {
    //if there is an error the user will be redirected to home
    alert(error);
    location.href = '/';
  }
});
//userlist in the room updates whem users join or left
socket.on('roomData', ({ room, users }) => {
  if (!room) location.href = '/';
  const html = Mustache.render(sidebarTemplate, { room, users });
  $sidebar.innerHTML = html;
});
