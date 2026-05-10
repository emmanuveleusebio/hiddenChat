import React, { useEffect, useState, useRef, useCallback } from 'react';
import Peer from 'peerjs';
import { motion, AnimatePresence } from 'framer-motion';

// ─── ICE / STUN config ────────────────────────────────────────────────────────
// FIX #2: Added proper STUN servers so peers can connect across different networks/NAT
const PEER_CONFIG = {
  debug: 2,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
    ],
  },
};

const VoiceCall = ({ socket, currentUser, partnerId }) => {
  const [callStatus, setCallStatus] = useState('idle');
  // 'idle' | 'calling' | 'ringing' | 'connecting' | 'oncall'

  const peerRef         = useRef(null);
  const localStreamRef  = useRef(null);
  const remoteAudio     = useRef(new Audio());
  const currentCallRef  = useRef(null);
  const ringTimerRef    = useRef(null);
  const callTimerRef    = useRef(null);
  const [callSeconds, setCallSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // FIX #3: Re-join voice room on every socket connect (handles reconnections too)
  const joinVoiceRoom = useCallback(() => {
    socket.emit('join-voice', currentUser.id);
    console.log('[Voice] Joined voice room for', currentUser.id);
  }, [socket, currentUser.id]);

  useEffect(() => {
    joinVoiceRoom();
    socket.on('connect', joinVoiceRoom);
    
    // Prevent accidental closure during call
    const handleBeforeUnload = (e) => {
      if (callStatus !== 'idle') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      socket.off('connect', joinVoiceRoom);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [joinVoiceRoom, socket, callStatus]);

  // ─── helpers ────────────────────────────────────────────────────────────────

  // FIX #1 + #7: Create a FRESH peer with a DYNAMIC ID every call so we never
  // hit "ID already taken" after a failed/dropped call.
  const createFreshPeer = useCallback(() => {
    if (peerRef.current && !peerRef.current.destroyed) {
      try { peerRef.current.destroy(); } catch (_) {}
    }
    // Unique ID: userId + timestamp ensures no collisions on retry
    const peerId = `${currentUser.id}-${Date.now()}`;
    const peer = new Peer(peerId, PEER_CONFIG);
    peerRef.current = peer;
    console.log('[Voice] Created peer:', peerId);
    return peer;
  }, [currentUser.id]);

  const cleanupAll = useCallback(() => {
    clearTimeout(ringTimerRef.current);
    clearInterval(callTimerRef.current);
    setCallSeconds(0);

    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;

    try { currentCallRef.current?.close(); } catch (_) {}
    currentCallRef.current = null;

    remoteAudio.current.pause();
    remoteAudio.current.srcObject = null;

    if (peerRef.current && !peerRef.current.destroyed) {
      try { peerRef.current.destroy(); } catch (_) {}
    }
    peerRef.current = null;
  }, []);

  const stopCall = useCallback((e, skipEmit = false) => {
    if (e?.stopPropagation) e.stopPropagation();
    console.log('[Voice] stopCall, skipEmit:', skipEmit);
    cleanupAll();
    setCallStatus('idle');
    setIsMuted(false); // Reset mute
    if (!skipEmit) {
      socket.emit('end-voice-call', { to: partnerId });
    }
  }, [cleanupAll, socket, partnerId]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Called once we have a live MediaConnection on either side
  const attachCallListeners = useCallback((call) => {
    currentCallRef.current = call;

    call.on('stream', (remoteStream) => {
      console.log('[Voice] Remote stream arrived ✓');
      remoteAudio.current.srcObject = remoteStream;
      remoteAudio.current.play().catch(err => console.warn('[Voice] Audio play blocked:', err));

      // FIX #4: Only move to 'oncall' when the audio stream actually arrives
      setCallStatus('oncall');
      let secs = 0;
      callTimerRef.current = setInterval(() => setCallSeconds(++secs), 1000);
    });

    call.on('close', () => {
      console.log('[Voice] PeerJS call closed');
      // If we are still 'oncall', try to reconnect or cleanup
      if (callStatus === 'oncall') {
        console.log('[Voice] Unexpected closure, cleaning up...');
      }
      stopCall(null, true);
    });

    call.on('error', (err) => {
      console.error('[Voice] PeerJS call error:', err);
      // Basic auto-retry logic could go here
      stopCall(null, true);
    });
  }, [stopCall]);

  // ─── Socket signal handlers ──────────────────────────────────────────────────
  useEffect(() => {
    // FIX #8: Use named handler references so we only remove OUR listener
    const onIncomingCall = ({ from, peerId: callerPeerId }) => {
      console.log('[Voice] incoming-call from', from, 'peer:', callerPeerId);
      // Store caller's peerId so answerCall can use it
      callerPeerIdRef.current = callerPeerId;
      setCallStatus('ringing');
      // Auto-decline after 30s
      clearTimeout(ringTimerRef.current);
      ringTimerRef.current = setTimeout(() => {
        // FIX #6: use functional state check inside callback to avoid stale closure
        setCallStatus(prev => {
          if (prev === 'ringing') {
            stopCall(null);
            return 'idle';
          }
          return prev;
        });
      }, 30000);
    };

    // Caller receives this when callee accepts
    const onCallAccepted = ({ peerId: calleePeerId }) => {
      console.log('[Voice] call-accepted, callee peer:', calleePeerId);
      clearTimeout(ringTimerRef.current);

      if (!localStreamRef.current) {
        console.error('[Voice] No local stream when call accepted!');
        stopCall(null);
        return;
      }

      // FIX #5: Create a fresh peer and wait for it to open BEFORE calling
      const peer = createFreshPeer();
      peer.on('open', () => {
        console.log('[Voice] Caller peer open, calling callee peer:', calleePeerId);
        const call = peer.call(calleePeerId, localStreamRef.current);
        if (!call) {
          console.error('[Voice] peer.call() returned null');
          stopCall(null);
          return;
        }
        attachCallListeners(call);
      });
      peer.on('error', (err) => {
        console.error('[Voice] Caller peer error:', err);
        stopCall(null, true);
      });
    };

    const onCallEnded = () => {
      console.log('[Voice] call-ended from partner');
      stopCall(null, true);
    };

    socket.on('incoming-call',  onIncomingCall);
    socket.on('call-accepted',  onCallAccepted);
    socket.on('call-ended',     onCallEnded);

    return () => {
      socket.off('incoming-call',  onIncomingCall);
      socket.off('call-accepted',  onCallAccepted);
      socket.off('call-ended',     onCallEnded);
    };
  }, [currentUser.id, createFreshPeer, attachCallListeners, stopCall, socket]);

  // Stores the caller's PeerJS ID so answerCall can use it
  const callerPeerIdRef = useRef(null);

  // ─── Caller: start call ──────────────────────────────────────────────────────
  const startCall = async (e) => {
    e.stopPropagation();
    try {
      console.log('[Voice] Requesting mic...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      setCallStatus('calling');

      // Emit signal to callee — no peerId needed yet (we create peer only after acceptance)
      socket.emit('call-user', {
        to: partnerId,
        from: currentUser.id,
        peerId: 'pending',
        type: 'voice' // Explicitly tell it's a voice call
      });
      console.log('[Voice] call-user emitted to', partnerId);

      // Cancel if no answer in 30s
      clearTimeout(ringTimerRef.current);
      ringTimerRef.current = setTimeout(() => {
        setCallStatus(prev => {
          if (prev === 'calling') { stopCall(null); return 'idle'; }
          return prev;
        });
      }, 30000);
    } catch (err) {
      console.error('[Voice] Mic denied:', err);
      setCallStatus('idle');
    }
  };

  // ─── Callee: answer call ─────────────────────────────────────────────────────
  const answerCall = async (e) => {
    e.stopPropagation();
    clearTimeout(ringTimerRef.current);

    try {
      console.log('[Voice] Callee requesting mic...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      // FIX #1 + #5: Create fresh peer, wait for open, THEN tell caller our peerId
      const peer = createFreshPeer();
      setCallStatus('connecting');

      peer.on('open', (myPeerId) => {
        console.log('[Voice] Callee peer open:', myPeerId, '— sending answer-call');
        socket.emit('answer-call', { to: partnerId, peerId: myPeerId });
      });

      // Caller will now do peer.call() → this fires when they do
      peer.on('call', (incomingCall) => {
        console.log('[Voice] PeerJS call received by callee, answering...');
        incomingCall.answer(localStreamRef.current);
        attachCallListeners(incomingCall);
      });

      peer.on('error', (err) => {
        console.error('[Voice] Callee peer error:', err);
        stopCall(null, true);
      });
    } catch (err) {
      console.error('[Voice] Callee mic error:', err);
      stopCall(null);
    }
  };

  // ─── UI ───────────────────────────────────────────────────────────────────────
  const partnerName = currentUser.id === '9492' ? 'Rahitha' : 'Eusebio';
  const callerName  = currentUser.id === '9492' ? 'Eusebio' : 'Rahitha';

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;

  return (
    <>
      {/* ── RINGING (callee sees) ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {callStatus === 'ringing' && (
          <motion.div
            key="ringing"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={vs.overlay}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              style={vs.card}
            >
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={vs.pulse}
              />
              <div style={vs.avatar}>📞</div>
              <p style={vs.subText}>Incoming Call</p>
              <p style={vs.nameText}>{callerName}</p>
              <div style={vs.btnRow}>
                <div style={vs.btnCol}>
                  <button onClick={(e) => stopCall(e)} style={vs.declineBtn}>✕</button>
                  <span style={vs.btnLabel}>Decline</span>
                </div>
                <div style={vs.btnCol}>
                  <button onClick={answerCall} style={vs.acceptBtn}>✓</button>
                  <span style={vs.btnLabel}>Accept</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CALLING (caller waits) ────────────────────────────────────────────── */}
      <AnimatePresence>
        {callStatus === 'calling' && (
          <motion.div
            key="calling"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={vs.overlay}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              style={vs.card}
            >
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={vs.pulse}
              />
              <div style={vs.avatar}>📞</div>
              <p style={vs.subText}>Calling...</p>
              <p style={vs.nameText}>{partnerName}</p>
              <button onClick={(e) => stopCall(e)} style={{ ...vs.declineBtn, marginTop: '20px', width: 60, height: 60, fontSize: 22 }}>✕</button>
              <span style={{ ...vs.btnLabel, marginTop: 6 }}>Cancel</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CONNECTING (callee waiting for stream) ────────────────────────────── */}
      <AnimatePresence>
        {callStatus === 'connecting' && (
          <motion.div
            key="connecting"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={vs.overlay}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              style={vs.card}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                style={{ fontSize: 40, marginBottom: 8 }}
              >⟳</motion.div>
              <p style={vs.subText}>Connecting...</p>
              <p style={vs.nameText}>{callerName}</p>
              <button onClick={(e) => stopCall(e)} style={{ ...vs.declineBtn, marginTop: '20px', width: 60, height: 60, fontSize: 22 }}>✕</button>
              <span style={{ ...vs.btnLabel, marginTop: 6 }}>Cancel</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ON CALL ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {callStatus === 'oncall' && (
          <motion.div
            key="oncall"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={vs.overlay}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              style={vs.card}
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={vs.avatar}
              >🎙️</motion.div>
              <p style={vs.subText}>In Call</p>
              <p style={vs.nameText}>{partnerName}</p>
              <p style={{ color: '#8a9a8e', fontSize: 16, fontVariantNumeric: 'tabular-nums', fontWeight: '500' }}>
                {formatTime(callSeconds)}
              </p>
              
              <div style={{ display: 'flex', gap: '30px', marginTop: '30px' }}>
                <div style={vs.btnCol}>
                  <button 
                    onClick={toggleMute} 
                    style={{ ...vs.controlBtn, background: isMuted ? '#555' : 'rgba(255,255,255,0.1)' }}
                  >
                    {isMuted ? '🔇' : '🎤'}
                  </button>
                  <span style={vs.btnLabel}>{isMuted ? 'Unmute' : 'Mute'}</span>
                </div>
                
                <div style={vs.btnCol}>
                  <button onClick={(e) => stopCall(e)} style={vs.declineBtn}>✕</button>
                  <span style={vs.btnLabel}>End</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── IDLE BUTTON ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {callStatus === 'idle' && (
          <motion.button
            key="callBtn"
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            onClick={startCall}
            style={vs.callBtn}
          >📞</motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const vs = {
  callBtn: {
    background: '#c4a484', border: 'none', borderRadius: '50%',
    width: 36, height: 36, fontSize: 16, cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(196, 164, 132, 0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(5,5,5,0.92)',
    backdropFilter: 'blur(30px)',
    zIndex: 9999,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 40, padding: '50px 60px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
    boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
    position: 'relative', minWidth: 280,
  },
  pulse: {
    position: 'absolute', width: 120, height: 120, borderRadius: '50%',
    background: 'rgba(196, 164, 132, 0.2)', top: 32,
  },
  avatar: {
    width: 90, height: 90, borderRadius: '50%',
    background: 'rgba(196, 164, 132, 0.1)',
    border: '1px solid #c4a484',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 36, position: 'relative', zIndex: 1,
  },
  subText:  { color: '#c4a484', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', margin: '10px 0 0 0', fontWeight: '600' },
  nameText: { color: '#fff', fontSize: 26, fontWeight: '300', margin: '0 0 10px 0', letterSpacing: '1px' },
  btnRow:   { display: 'flex', gap: 50, marginTop: 20, alignItems: 'flex-start' },
  btnCol:   { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  acceptBtn: {
    background: '#c4a484', border: 'none', borderRadius: '50%',
    width: 65, height: 65, fontSize: 24, color: '#000', cursor: 'pointer',
    boxShadow: '0 10px 30px rgba(196, 164, 132, 0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  declineBtn: {
    background: '#ff3b30', border: 'none', borderRadius: '50%',
    width: 65, height: 65, fontSize: 24, color: '#fff', cursor: 'pointer',
    boxShadow: '0 10px 30px rgba(255, 59, 48, 0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  controlBtn: {
    background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%',
    width: 65, height: 65, fontSize: 24, color: '#fff', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)'
  },
  btnLabel: { color: '#8a9a8e', fontSize: 11, textAlign: 'center', marginTop: 8, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 },
};

export default VoiceCall;