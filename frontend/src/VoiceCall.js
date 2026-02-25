import React, { useEffect, useState, useRef } from 'react';
import Peer from 'peerjs';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceCall = ({ socket, currentUser, partnerId }) => {
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, ringing, oncall
  const [isPeerReady, setIsPeerReady] = useState(false);
  const myPeer = useRef(null);
  const localStream = useRef(null);
  const remoteAudio = useRef(new Audio());
  const currentCall = useRef(null);
  const callerPeerId = useRef(null);

  useEffect(() => {
    // 1. Initialize Peer with a unique ID and STUN servers
    const myId = currentUser.id + "-voice";
    
    myPeer.current = new Peer(myId, {
      config: {
        'iceServers': [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ]
      }
    });

    myPeer.current.on('open', (id) => {
      console.log("✅ Voice Peer Registered:", id);
      setIsPeerReady(true);
      socket.emit('join-voice', currentUser.id);
    });

    myPeer.current.on('error', (err) => {
      console.error("PeerJS Error:", err.type);
      if (err.type === 'unavailable-id') {
        // ID might be taken if tab was refreshed, PeerJS usually cleans up in 5s
        setIsPeerReady(false);
      }
    });

    // 2. Listener for the ACTUAL Audio Stream connection
    myPeer.current.on('call', (incomingCall) => {
      console.log("📞 Receiving Audio Stream connection...");
      currentCall.current = incomingCall;
      setCallStatus('ringing');
    });

    // 3. Socket Signaling Listeners
    socket.on('incoming-call', (data) => {
      console.log("🔔 Signal: Incoming call UI triggered from", data.from);
      callerPeerId.current = data.peerId;
      setCallStatus('ringing');
    });

    socket.on('call-accepted', () => {
      console.log("🤝 Partner accepted the call");
      setCallStatus('oncall');
    });

    socket.on('call-ended', () => {
      console.log("🛑 Partner ended the call");
      handleCleanup();
    });

    return () => {
      socket.off('incoming-call');
      socket.off('call-accepted');
      socket.off('call-ended');
      myPeer.current?.destroy();
    };
  }, [currentUser.id]);

  const setupCallListeners = (call) => {
    currentCall.current = call;

    call.on('stream', (userAudioStream) => {
      console.log("🎵 Remote audio stream received");
      remoteAudio.current.srcObject = userAudioStream;
      // Play audio automatically, catch if browser blocks it
      remoteAudio.current.play().catch(e => {
        console.warn("Autoplay blocked, user interaction required:", e);
      });
    });

    call.on('close', handleCleanup);
    call.on('error', (err) => {
      console.error("Call error:", err);
      handleCleanup();
    });
  };

  const startCall = async (e) => {
    if (e) e.stopPropagation();
    
    if (!isPeerReady) {
      alert("Voice server is connecting... please wait 2 seconds and try again.");
      return;
    }

    try {
      setCallStatus('calling');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStream.current = stream;

      // Send UI signal via Socket
      socket.emit('call-user', {
        to: partnerId,
        from: currentUser.id,
        peerId: currentUser.id + "-voice"
      });

      // Initiate P2P Audio connection
      const call = myPeer.current.call(partnerId + "-voice", stream);
      setupCallListeners(call);

    } catch (err) {
      console.error("Microphone access denied:", err);
      setCallStatus('idle');
      alert("Please allow microphone access to make calls.");
    }
  };

  const answerCall = async (e) => {
    if (e) e.stopPropagation();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStream.current = stream;

      if (currentCall.current) {
        // If the media request is already here
        currentCall.current.answer(stream);
        setupCallListeners(currentCall.current);
      } else if (callerPeerId.current) {
        // If only the socket signal is here, call them back
        const call = myPeer.current.call(callerPeerId.current, stream);
        setupCallListeners(call);
      }

      setCallStatus('oncall');
      socket.emit('answer-call', { to: partnerId });
    } catch (err) {
      console.error("Error answering call:", err);
      handleCleanup();
    }
  };

  const handleCleanup = () => {
    localStream.current?.getTracks().forEach(track => track.stop());
    if (currentCall.current) currentCall.current.close();
    remoteAudio.current.srcObject = null;
    setCallStatus('idle');
    callerPeerId.current = null;
    currentCall.current = null;
  };

  const stopCall = (e) => {
    if (e) e.stopPropagation();
    socket.emit('end-voice-call', { to: partnerId });
    handleCleanup();
  };

  const displayPartnerName = currentUser.id === "9492" ? "Rahitha" : "Eusebio";

  return (
    <>
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
              style={voiceStyles.ringingCard}
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={voiceStyles.pulseRing}
              />
              <div style={voiceStyles.avatarCircle}>📞</div>
              <p style={voiceStyles.callingText}>Incoming Call</p>
              <p style={voiceStyles.callerName}>{displayPartnerName}</p>
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

      <AnimatePresence>
        {(callStatus === 'oncall' || callStatus === 'calling') && (
          <motion.div
            key="activeOverlay"
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
              style={voiceStyles.ringingCard}
            >
              <div style={voiceStyles.avatarCircle}>{callStatus === 'oncall' ? '🎙️' : '📞'}</div>
              <p style={voiceStyles.callingText}>{callStatus === 'oncall' ? 'Connected' : 'Calling...'}</p>
              <p style={voiceStyles.callerName}>{displayPartnerName}</p>
              <button onClick={stopCall} style={{ ...voiceStyles.declineBtn, marginTop: '20px' }}>✕</button>
              <span style={voiceStyles.btnLabel}>{callStatus === 'oncall' ? 'End Call' : 'Cancel'}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {callStatus === 'idle' && (
        <button
          onClick={startCall}
          style={{ 
            ...voiceStyles.callBtn, 
            opacity: isPeerReady ? 1 : 0.4,
            cursor: isPeerReady ? 'pointer' : 'not-allowed'
          }}
        >
          📞
        </button>
      )}
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
  },
  fullscreenOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.9)',
    backdropFilter: 'blur(15px)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringingCard: {
    background: 'linear-gradient(145deg, #1a1a1a, #0d0d0d)',
    border: '1px solid rgba(138, 154, 142, 0.3)',
    borderRadius: '35px',
    padding: '50px 40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    minWidth: '280px',
    position: 'relative',
    boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
  },
  pulseRing: {
    position: 'absolute',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'rgba(138, 154, 142, 0.2)',
    top: '40px',
  },
  avatarCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'rgba(138, 154, 142, 0.1)',
    border: '2px solid #8a9a8e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    zIndex: 1,
  },
  callingText: {
    color: '#8a9a8e',
    fontSize: '12px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    marginTop: '15px',
    fontWeight: '500',
  },
  callerName: {
    color: '#fff',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  ringingBtns: {
    display: 'flex',
    gap: '60px',
    marginTop: '20px',
  },
  acceptBtn: {
    background: '#4caf50',
    border: 'none',
    borderRadius: '50%',
    width: '65px',
    height: '65px',
    fontSize: '24px',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 5px 15px rgba(76, 175, 80, 0.3)',
  },
  declineBtn: {
    background: '#f44336',
    border: 'none',
    borderRadius: '50%',
    width: '65px',
    height: '65px',
    fontSize: '24px',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 5px 15px rgba(244, 67, 54, 0.3)',
  },
  btnLabel: {
    color: '#777',
    fontSize: '12px',
    fontWeight: '500',
  },
};

export default VoiceCall;