// backend/voiceSignals.js
module.exports = (io, socket) => {
  socket.on('join-voice', (userId) => {
    socket.join(`voice-${userId}`);
  });

  socket.on('call-user', ({ to, from, peerId }) => {
    io.to(`voice-${to}`).emit('incoming-call', { from, peerId });
  });

  socket.on('answer-call', ({ to, peerId }) => {
    io.to(`voice-${to}`).emit('call-accepted', { peerId });
  });

  socket.on('end-voice-call', ({ to }) => {
    io.to(`voice-${to}`).emit('call-ended');
  });
};