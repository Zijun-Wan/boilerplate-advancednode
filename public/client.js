const userColors = {};

function getColorForUser(username) {
  if (!userColors[username]) {
    const colors = ['AliceBlue', 'Cornsilk', 'Lavender', 'LavenderBlush', 'HoneyDew', 'LightYellow', 'MistyRose', 'PeachPuff', 'PowderBlue'];
    userColors[username] = colors[Object.keys(userColors).length % colors.length];
  }
  return userColors[username];
}

$(document).ready(function () {
  /*global io*/
  let socket = io();

  socket.on('user', data => {
    $('#num-users').text(data.currentUsers + ' users online');
    let message =
      data.username + ' has ' +
      (data.connected ? 'joined ' : 'left ') +
      'the chat.';
    $('#messages').append($('<li>').addClass("joining").html('<b>' + message + '</b>'));
  });

  socket.on('chat message', data => {
    const color = getColorForUser(data.username);
    const $msg = $('<li>')
      .css('background-color', color)
      .html(`${data.username}: ${data.message}`);
    $('#messages').append($msg);

    const messagesContainer = document.getElementById('messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  })

  // Form submittion with new message in field with id 'm'
  $('form').submit(function () {
    var messageToSend = $('#m').val();
    socket.emit('chat message', messageToSend);
    $('#m').val('');
    return false; // prevent form submit from refreshing page
  });
});