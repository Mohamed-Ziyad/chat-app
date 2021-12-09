const users = [];

//add user, remove user, gtUser, getUserrsInRoom

const addUser = ({ id, username, room }) => {
  //clean the data
  //validated
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //validate the data
  if (!username || !room) return { error: 'Username and Room are required!' };

  //check existing user
  const existingUser = users.find(
    user => user.room === room && user.username === username,
  );

  //validate username
  if (existingUser) return { error: 'Username already exsits!' };

  //store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = id => {
  //remove users by index
  //so the original array will be changed
  //one the match is found this will stop but filter keep on running
  //this is faster than filter
  const index = users.findIndex(user => user.id === id);
  //if the index exists
  if (index !== -1) return users.splice(index, 1)[0];
};

const getUser = id => {
  const user = users.find(user => user.id === id);
  if (!user) return { error: 'User not found!' };
  return user;
};

const getUsersInRoom = room => {
  room = room.trim().toLowerCase();
  const usersInRoom = users.filter(user => user.room === room);
  if (!usersInRoom) return { error: 'Not found users' };

  return usersInRoom;
};

// addUser({
//   id: 1,
//   username: 'Ziyad',
//   room: 'js',
// });
// addUser({
//   id: 2,
//   username: 'Yoosuf',
//   room: 'js',
// });
// addUser({
//   id: 3,
//   username: 'Fasla',
//   room: 'js',
// });

// addUser({
//   id: 4,
//   username: 'Yoosuf',
//   room: 'cs',
// });
// addUser({
//   id: 5,
//   username: 'Fasla',
//   room: 'cs',
// });

// const gur = getUsersInRoom('hs');

// console.log(gur);

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
