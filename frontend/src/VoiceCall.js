import React, { useEffect, useState, useRef } from 'react';
import Peer from 'peerjs';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceCall = ({ socket, currentUser, partnerId }) => {
  const [callStatus, setCallStatus] = useState('idle'); // idle, ringing, oncall, calling
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

  const startCall = async () => {
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

      socket.emit('heart_ping', { from: currentUser.id });

    } catch (err) {
      console.error("Mic access denied:", err);
      setCallStatus('idle');
    }
  };

  const answerCall = async () => {
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

  const stopCall = () => {
    localStream.current?.getTracks().forEach(track => track.stop());
    currentCall.current?.close();
    remoteAudio.current.srcObject = null;
    callerPeerId.current = null;
    setCallStatus('idle');
    socket.emit('end-voice-call', { to: partnerId });
  };

  return (
    <div style={{ position: 'relative', zIndex: 1000 }}>
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

        {callStatus === 'calling' && (
          <motion.div
            key="callingBar"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={voiceStyles.activeCallBar}
          >
            <span>Calling...</span>
            <button onClick={stopCall} style={voiceStyles.declineBtn}>End</button>
          </motion.div>
        )}

        {callStatus === 'ringing' && (
          <motion.div
            key="ringingModal"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={voiceStyles.modal}
          >
            <p style={{ marginBottom: '10px', color: '#fff' }}>📞 Incoming Call...</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={answerCall} style={voiceStyles.acceptBtn}>Accept</button>
              <button onClick={stopCall} style={voiceStyles.declineBtn}>Decline</button>
            </div>
          </motion.div>
        )}

        {callStatus === 'oncall' && (
          <motion.div
            key="onCallBar"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={voiceStyles.activeCallBar}
          >
            <span>In Call</span>
            <button onClick={stopCall} style={voiceStyles.declineBtn}>End</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
    justifyContent: 'center'
  },
  modal: {
    position: 'fixed',
    bottom: '90px',
    right: '20px',
    background: '#1a1a1a',
    padding: '20px',
    borderRadius: '15px',
    border: '1px solid #8a9a8e',
    color: '#fff',
    textAlign: 'center',
    boxShadow: '0 0 20px rgba(0,0,0,0.5)',
    zIndex: 2000,
    minWidth: '180px'
  },
  activeCallBar: {
    background: 'rgba(138, 154, 142, 0.95)',
    padding: '8px 14px',
    borderRadius: '30px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#000',
    fontWeight: 'bold',
    backdropFilter: 'blur(5px)',
    fontSize: '13px',
    whiteSpace: 'nowrap'
  },
  acceptBtn: {
    background: '#4caf50',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  declineBtn: {
    background: '#f44336',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};

export default VoiceCall;