import React, { useEffect, useState, useRef } from 'react';
import Peer from 'peerjs';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceCall = ({ socket, currentUser, partnerId }) => {
  const [callStatus, setCallStatus] = useState('idle');
  const myPeer = useRef(null);
  const localStream = useRef(null);
  const remoteAudio = useRef(new Audio());
  const currentCall = useRef(null);
  const callerPeerId = useRef(null); // stores incoming caller's peer id (used by callee)

  useEffect(() => {
    // Initialize PeerJS with a stable ID
    myPeer.current = new Peer(currentUser.id + '-voice', {
      debug: 2,
    });

    myPeer.current.on('open', (id) => {
      console.log('Voice Peer opened:', id);
      socket.emit('join-voice', currentUser.id);
    });

    myPeer.current.on('error', (err) => {
      console.error('PeerJS error:', err);
    });

    // ─── CALLEE SIDE ──────────────────────────────────────────────────────────
    // This fires when the CALLER does peer.call() — happens after callee emits answer-call
    myPeer.current.on('call', (incomingCall) => {
      console.log('PeerJS: incoming call received (answerer side)');
      if (localStream.current) {
        // We already got mic access in answerCall(), so answer immediately
        incomingCall.answer(localStream.current);
        setupCallListeners(incomingCall);
      } else {
        // Fallback: store and answer once stream is ready (shouldn't normally happen)
        currentCall.current = incomingCall;
      }
    });

    // ─── SOCKET SIGNALS ───────────────────────────────────────────────────────

    // Callee receives this → show ringing UI
    socket.on('incoming-call', ({ from, peerId }) => {
      console.log('Socket: incoming-call from', from, 'peerId:', peerId);
      callerPeerId.current = peerId; // store caller's peerId so we can dial back if needed
      setCallStatus('ringing');
    });

    // Caller receives this after callee answers → now initiate the PeerJS call
    socket.on('call-accepted', ({ peerId: calleePeerId }) => {
      console.log('Socket: call-accepted, callee peerId:', calleePeerId);
      setCallStatus('oncall');

      if (myPeer.current && localStream.current && calleePeerId) {
        console.log('Caller: initiating peer.call() to', calleePeerId);
        const call = myPeer.current.call(calleePeerId, localStream.current);
        setupCallListeners(call);
      }
    });

    socket.on('call-ended', () => {
      console.log('Socket: call-ended received');
      stopCall();
    });

    return () => {
      socket.off('incoming-call');
      socket.off('call-accepted');
      socket.off('call-ended');
      myPeer.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.id]);

  // ─── CALLER initiates the call ─────────────────────────────────────────────
  const startCall = async (e) => {
    e.stopPropagation();
    try {
      console.log('Caller: requesting mic...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStream.current = stream;
      setCallStatus('calling');

      const myPeerId = currentUser.id + '-voice';
      socket.emit('call-user', {
        to: partnerId,
        from: currentUser.id,
        peerId: myPeerId,
      });
      console.log('Caller: emitted call-user to', partnerId);
    } catch (err) {
      console.error('Mic access denied:', err);
      setCallStatus('idle');
    }
  };

  // ─── CALLEE answers the call ───────────────────────────────────────────────
  const answerCall = async (e) => {
    e.stopPropagation();
    try {
      console.log('Callee: requesting mic...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStream.current = stream;

      // If PeerJS call already arrived before we had stream, answer it now
      if (currentCall.current) {
        currentCall.current.answer(stream);
        setupCallListeners(currentCall.current);
      }

      // Tell the caller we accepted — send our peerId so caller can peer.call() us
      const myPeerId = currentUser.id + '-voice';
      socket.emit('answer-call', { to: partnerId, peerId: myPeerId });
      console.log('Callee: emitted answer-call with peerId', myPeerId);

      setCallStatus('oncall');
    } catch (err) {
      console.error('Error answering call:', err);
    }
  };

  const setupCallListeners = (call) => {
    if (!call) return;
    currentCall.current = call;

    call.on('stream', (userAudioStream) => {
      console.log('Got remote audio stream!');
      remoteAudio.current.srcObject = userAudioStream;
      remoteAudio.current
        .play()
        .catch((e) => console.warn('Audio play blocked:', e));
    });

    call.on('close', () => {
      console.log('PeerJS call closed');
      stopCall();
    });

    call.on('error', (err) => {
      console.error('PeerJS call error:', err);
      stopCall();
    });
  };

  const stopCall = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    console.log('Stopping call...');
    localStream.current?.getTracks().forEach((track) => track.stop());
    localStream.current = null;
    currentCall.current?.close();
    currentCall.current = null;
    remoteAudio.current.srcObject = null;
    callerPeerId.current = null;
    setCallStatus('idle');
    socket.emit('end-voice-call', { to: partnerId });
  };

  // ─── UI ───────────────────────────────────────────────────────────────────
  const partnerName = currentUser.id === '9492' ? 'Rahitha' : 'Eusebio';
  const callerLabel = currentUser.id === '9492' ? 'Eusebio' : 'Rahitha';

  return (
    <>
      {/* Ringing overlay (callee sees this) */}
      <AnimatePresence>
        {callStatus === 'ringing' && (
          <motion.div
            key="ringingOverlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={voiceStyles.fullscreenOverlay}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              style={voiceStyles.ringingCard}
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={voiceStyles.pulseRing}
              />
              <div style={voiceStyles.avatarCircle}>📞</div>
              <p style={voiceStyles.callingText}>Incoming Call</p>
              <p style={voiceStyles.callerName}>{callerLabel}</p>
              <div style={voiceStyles.ringingBtns}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <button onClick={stopCall} style={voiceStyles.declineBtn}>✕</button>
                  <span style={voiceStyles.btnLabel}>Decline</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <button onClick={answerCall} style={voiceStyles.acceptBtn}>✓</button>
                  <span style={voiceStyles.btnLabel}>Accept</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* On-call overlay */}
      <AnimatePresence>
        {callStatus === 'oncall' && (
          <motion.div
            key="onCallOverlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={voiceStyles.fullscreenOverlay}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              style={voiceStyles.ringingCard}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={voiceStyles.avatarCircle}
              >
                🎙️
              </motion.div>
              <p style={voiceStyles.callingText}>In Call</p>
              <p style={voiceStyles.callerName}>{partnerName}</p>
              <button
                onClick={stopCall}
                style={{ ...voiceStyles.declineBtn, marginTop: '20px', width: '60px', height: '60px', fontSize: '22px' }}
              >
                ✕
              </button>
              <span style={{ ...voiceStyles.btnLabel, marginTop: '6px' }}>End Call</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calling overlay (caller sees this while waiting) */}
      <AnimatePresence>
        {callStatus === 'calling' && (
          <motion.div
            key="callingOverlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={voiceStyles.fullscreenOverlay}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              style={voiceStyles.ringingCard}
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={voiceStyles.pulseRing}
              />
              <div style={voiceStyles.avatarCircle}>📞</div>
              <p style={voiceStyles.callingText}>Calling...</p>
              <p style={voiceStyles.callerName}>{partnerName}</p>
              <button
                onClick={stopCall}
                style={{ ...voiceStyles.declineBtn, marginTop: '20px', width: '60px', height: '60px', fontSize: '22px' }}
              >
                ✕
              </button>
              <span style={{ ...voiceStyles.btnLabel, marginTop: '6px' }}>Cancel</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Idle call button */}
      <AnimatePresence>
        {callStatus === 'idle' && (
          <motion.button
            key="callBtn"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={startCall}
            style={voiceStyles.callBtn}
          >
            📞
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

const voiceStyles = {
  callBtn: {
    background: '#8a9a8e',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    fontSize: '16px',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(12px)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringingCard: {
    background: 'linear-gradient(145deg, #1a1a1a, #0d0d0d)',
    border: '1px solid rgba(138, 154, 142, 0.4)',
    borderRadius: '30px',
    padding: '40px 50px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
    position: 'relative',
    minWidth: '260px',
  },
  pulseRing: {
    position: 'absolute',
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    background: 'rgba(138, 154, 142, 0.3)',
    top: '28px',
  },
  avatarCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'rgba(138, 154, 142, 0.15)',
    border: '2px solid #8a9a8e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    position: 'relative',
    zIndex: 1,
  },
  callingText: {
    color: '#8a9a8e',
    fontSize: '13px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    margin: '10px 0 0 0',
  },
  callerName: {
    color: '#fff',
    fontSize: '22px',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
  },
  ringingBtns: {
    display: 'flex',
    gap: '50px',
    marginTop: '10px',
    alignItems: 'flex-start',
  },
  acceptBtn: {
    background: '#4caf50',
    border: 'none',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    fontSize: '22px',
    color: '#fff',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(76, 175, 80, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineBtn: {
    background: '#f44336',
    border: 'none',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    fontSize: '22px',
    color: '#fff',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(244, 67, 54, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLabel: {
    color: '#aaa',
    fontSize: '12px',
    textAlign: 'center',
  },
};

export default VoiceCall;