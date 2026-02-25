// backend/voiceSignals.js
module.exports = (io, socket) => {

  // ── User joins their private voice room ──────────────────────────────────────
  // FIX: Called on every socket connect (client now re-emits on reconnect too),
  // so the socket is always in the right room even after a network blip.
  socket.on('join-voice', (userId) => {
    socket.join(`voice-${userId}`);
    console.log(`[Voice] ${socket.id} joined room voice-${userId}`);
  });

  // ── Caller → Callee: notify of incoming call ─────────────────────────────────
  // peerId is 'pending' in the new flow — callee creates their own peer fresh.
  socket.on('call-user', ({ to, from, peerId }) => {
    console.log(`[Voice] call-user: ${from} → ${to}`);
    io.to(`voice-${to}`).emit('incoming-call', { from, peerId });
  });

  // ── Callee → Caller: accepted, here is callee's fresh peerId ─────────────────
  // Caller will now create THEIR peer, wait for open, then peer.call(calleePeerId).
  socket.on('answer-call', ({ to, peerId }) => {
    console.log(`[Voice] answer-call: → ${to}, callee peerId: ${peerId}`);
    io.to(`voice-${to}`).emit('call-accepted', { peerId });
  });

  // ── Either side hangs up ─────────────────────────────────────────────────────
  socket.on('end-voice-call', ({ to }) => {
    console.log(`[Voice] end-voice-call → ${to}`);
    io.to(`voice-${to}`).emit('call-ended');
  });

};