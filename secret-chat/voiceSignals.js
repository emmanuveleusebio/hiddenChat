// backend/voiceSignals.js
module.exports = (io, socket) => {

  // User joins their own voice room so they can receive targeted signals
  socket.on('join-voice', (userId) => {
    socket.join(`voice-${userId}`);
    console.log(`[Voice] ${userId} joined room voice-${userId}`);
  });

  // Caller → Callee: notify of incoming call + caller's peerId
  socket.on('call-user', ({ to, from, peerId }) => {
    console.log(`[Voice] call-user: ${from} → ${to}, peerId: ${peerId}`);
    io.to(`voice-${to}`).emit('incoming-call', { from, peerId });
  });

  // Callee → Caller: accepted, here is callee's peerId so caller can peer.call()
  socket.on('answer-call', ({ to, peerId }) => {
    console.log(`[Voice] answer-call: → ${to}, callee peerId: ${peerId}`);
    io.to(`voice-${to}`).emit('call-accepted', { peerId });
  });

  // Either side ends the call
  socket.on('end-voice-call', ({ to }) => {
    console.log(`[Voice] end-voice-call → ${to}`);
    io.to(`voice-${to}`).emit('call-ended');
  });

};