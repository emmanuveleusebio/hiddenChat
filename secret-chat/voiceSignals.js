module.exports = (io, socket) => {
  // ── User joins their private voice room ──────────────────────────────────────
  socket.on('join-voice', (userId) => {
    socket.join(`voice-${userId}`);
    console.log(`[Voice] ${socket.id} joined room voice-${userId}`);
  });
};

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