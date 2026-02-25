import React, { useEffect, useState, useRef } from 'react';
import Peer from 'peerjs';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceCall = ({ socket, currentUser, partnerId }) => {
  const [callStatus, setCallStatus] = useState('idle');
  const myPeer = useRef(null);
  const localStream = useRef(null);
  const remoteAudio = useRef(new Audio());
  const currentCall = useRef(null);
  const callerPeerId = useRef(null);

  useEffect(() => {
    myPeer.current = new Peer(currentUser.id + "-voice");

    myPeer.current.on('open', (id) => {
      console.log("Voice Peer ID:", id);
      socket.emit('join-voice', currentUser.id);
    });

    myPeer.current.on('call', (incomingCall) => {
      currentCall.current = incomingCall;
      setCallStatus('ringing');
    });

    socket.on('incoming-call', (data) => {
      console.log("Incoming call signal received from:", data.from, "peerId:", data.peerId);
      callerPeerId.current = data.peerId;
      setCallStatus('ringing');
    });

    socket.on('call-accepted', () => {
      console.log("Call was accepted by partner");
      setCallStatus('oncall');
    });

    socket.on('call-ended', stopCall);

    return () => {
      socket.off('incoming-call');
      socket.off('call-accepted');
      socket.off('call-ended');
      myPeer.current?.destroy();
    };
  }, [currentUser.id]);

  const startCall = async (e) => {
    e.stopPropagation(); // ✅ prevents heart ping or any parent click from firing
    try {
      setCallStatus('calling');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStream.current = stream;

      if (!myPeer.current) return;

      const myPeerId = currentUser.id + "-voice";

      socket.emit('call-user', {
        to: partnerId,
        from: currentUser.id,
        peerId: myPeerId
      });

      // ✅ Removed heart_ping from here — call only, no side effects

    } catch (err) {
      console.error("Mic access denied:", err);
      setCallStatus('idle');
    }
  };

  const answerCall = async (e) => {
    e.stopPropagation();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStream.current = stream;
      setCallStatus('oncall');

      if (callerPeerId.current && myPeer.current) {
        const call = myPeer.current.call(callerPeerId.current, stream);
        setupCallListeners(call);
      } else if (currentCall.current) {
        currentCall.current.answer(stream);
        setupCallListeners(currentCall.current);
      }

      socket.emit('answer-call', { to: partnerId });

    } catch (err) {
      console.error("Error answering call:", err);
    }
  };

  const setupCallListeners = (call) => {
    if (!call) return;
    currentCall.current = call;

    call.on('stream', (userAudioStream) => {
      remoteAudio.current.srcObject = userAudioStream;
      remoteAudio.current.play().catch(e => console.log("Audio play blocked:", e));
    });

    call.on('close', stopCall);
    call.on('error', stopCall);
  };

  const stopCall = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    localStream.current?.getTracks().forEach(track => track.stop());
    currentCall.current?.close();
    remoteAudio.current.srcObject = null;
    callerPeerId.current = null;
    setCallStatus('idle');
    socket.emit('end-voice-call', { to: partnerId });
  };

  return (
    <>
      {/* ✅ Fullscreen overlay for ringing — rendered at root level, not inside header */}
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
              {/* Pulsing ring animation */}
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={voiceStyles.pulseRing}
              />
              <div style={voiceStyles.avatarCircle}>📞</div>
              <p style={voiceStyles.callingText}>Incoming Call</p>
              <p style={voiceStyles.callerName}>
                {currentUser.id === "9492" ? "Eusebio" : "Rahitha"}
              </p>
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

      {/* ✅ Fullscreen overlay for active call */}
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
              <p style={voiceStyles.callerName}>
                {currentUser.id === "9492" ? "Eusebio" : "Rahitha"}
              </p>
              <button onClick={stopCall} style={{ ...voiceStyles.declineBtn, marginTop: '20px', width: '60px', height: '60px', fontSize: '22px' }}>✕</button>
              <span style={{ ...voiceStyles.btnLabel, marginTop: '6px' }}>End Call</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Calling state overlay */}
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
              <p style={voiceStyles.callerName}>
                {currentUser.id === "9492" ? "Rahitha" : "Eusebio"}
              </p>
              <button onClick={stopCall} style={{ ...voiceStyles.declineBtn, marginTop: '20px', width: '60px', height: '60px', fontSize: '22px' }}>✕</button>
              <span style={{ ...voiceStyles.btnLabel, marginTop: '6px' }}>Cancel</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ The call button in header — only shown when idle */}
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