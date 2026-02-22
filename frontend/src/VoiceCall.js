import React, { useEffect, useState, useRef } from 'react';
import Peer from 'peerjs';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceCall = ({ socket, currentUser, partnerId }) => {
  const [callStatus, setCallStatus] = useState('idle'); // idle, ringing, oncall, calling
  const myPeer = useRef(null);
  const localStream = useRef(null);
  const remoteAudio = useRef(new Audio());
  const currentCall = useRef(null);

useEffect(() => {
    myPeer.current = new Peer(currentUser.id + "-voice");

    myPeer.current.on('open', (id) => {
      console.log("Voice Peer ID:", id);
      // 🔥 THIS IS THE MISSING LINK:
      // Tell the server to put this socket into its private voice room
      socket.emit('join-voice', currentUser.id); 
    });

    myPeer.current.on('call', (incomingCall) => {
      currentCall.current = incomingCall;
      setCallStatus('ringing');
    });

    // Handle the signal coming from the server
    socket.on('incoming-call', (data) => {
      console.log("Incoming call signal received!");
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
  }, [currentUser.id]); // currentUser.id ensures it re-runs if user changes

  const startCall = async () => {
    try {
      setCallStatus('calling');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStream.current = stream;
      
      // FIX 2: Defensive check to ensure peer exists
      if (!myPeer.current) return;

      const call = myPeer.current.call(partnerId + "-voice", stream);
      
      if (call) {
        setupCallListeners(call);
        // Alert the other user via Socket or Firebase
        socket.emit('call-user', { to: partnerId, from: currentUser.id });
        // Trigger your existing Heart Ping logic so she knows to open the app
        socket.emit('heart_ping', { from: currentUser.id });
      }
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
      
      if (currentCall.current) {
        currentCall.current.answer(stream);
        setupCallListeners(currentCall.current);
        socket.emit('answer-call', { to: partnerId });
      }
    } catch (err) {
      console.error("Error answering call:", err);
    }
  };

  const setupCallListeners = (call) => {
    if (!call) return; // Prevention for the 'undefined' error
    currentCall.current = call;
    
    call.on('stream', (userAudioStream) => {
      remoteAudio.current.srcObject = userAudioStream;
      remoteAudio.current.play().catch(e => console.log("Audio play blocked", e));
    });

    call.on('close', stopCall);
    call.on('error', stopCall);
  };

  const stopCall = () => {
    localStream.current?.getTracks().forEach(track => track.stop());
    currentCall.current?.close();
    remoteAudio.current.srcObject = null;
    setCallStatus('idle');
    socket.emit('end-voice-call', { to: partnerId });
  };

  return (
    <div style={{ position: 'fixed', bottom: 80, right: 20, zIndex: 1000 }}>
      <AnimatePresence>
        {callStatus === 'idle' && (
          <button onClick={startCall} style={voiceStyles.callBtn}>📞</button>
        )}

        {callStatus === 'ringing' && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={voiceStyles.modal}>
            <p style={{marginBottom: '10px'}}>Incoming Call...</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={answerCall} style={voiceStyles.acceptBtn}>Accept</button>
              <button onClick={stopCall} style={voiceStyles.declineBtn}>End</button>
            </div>
          </motion.div>
        )}

        {(callStatus === 'oncall' || callStatus === 'calling') && (
          <motion.div style={voiceStyles.activeCallBar}>
            <span>{callStatus === 'calling' ? 'Calling...' : 'In Call'}</span>
            <button onClick={stopCall} style={voiceStyles.declineBtn}>End</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const voiceStyles = {
  callBtn: { background: '#8a9a8e', border: 'none', borderRadius: '50%', width: '50px', height: '50px', fontSize: '20px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' },
  modal: { background: '#1a1a1a', padding: '20px', borderRadius: '15px', border: '1px solid #8a9a8e', color: '#fff', textAlign: 'center', boxShadow: '0 0 20px rgba(0,0,0,0.5)' },
  activeCallBar: { background: 'rgba(138, 154, 142, 0.95)', padding: '10px 20px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '15px', color: '#000', fontWeight: 'bold', backdropFilter: 'blur(5px)' },
  acceptBtn: { background: '#4caf50', border: 'none', padding: '8px 15px', borderRadius: '8px', color: '#fff', fontWeight: 'bold' },
  declineBtn: { background: '#f44336', border: 'none', padding: '8px 15px', borderRadius: '8px', color: '#fff', fontWeight: 'bold' }
};

export default VoiceCall;