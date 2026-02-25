import React, { useEffect, useState, useRef } from 'react';
import Peer from 'peerjs';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceCall = ({ socket, currentUser, partnerId }) => {
    const [callStatus, setCallStatus] = useState('idle'); // idle, calling, ringing, oncall
    const myPeer = useRef(null);
    const localStream = useRef(null);
    const remoteAudio = useRef(new Audio());
    const currentCall = useRef(null);
    const callerPeerId = useRef(null);

    useEffect(() => {
        // Initialize Peer with STUN servers to bypass firewalls/NAT
        myPeer.current = new Peer(currentUser.id + "-voice", {
            config: {
                'iceServers': [
                    { url: 'stun:stun.l.google.com:19302' },
                    { url: 'stun:stun1.l.google.com:19302' },
                ]
            }
        });

        myPeer.current.on('open', (id) => {
            console.log("✅ Voice Peer Connected with ID:", id);
            socket.emit('join-voice', currentUser.id);
        });

        // IMPORTANT: This listens for the ACTUAL media connection request
        myPeer.current.on('call', (incomingCall) => {
            console.log("📞 Peer receiving actual media call...");
            currentCall.current = incomingCall;
            setCallStatus('ringing');
        });

        // Signaling listeners
        socket.on('incoming-call', (data) => {
            console.log("🔔 Socket signal: Incoming call from", data.from);
            callerPeerId.current = data.peerId;
            setCallStatus('ringing');
        });

        socket.on('call-accepted', (data) => {
            console.log("🤝 Call accepted by partner");
            setCallStatus('oncall');
        });

        socket.on('call-ended', () => {
            console.log("🛑 Call ended by partner");
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
            remoteAudio.current.play().catch(e => console.error("Playback failed:", e));
        });

        call.on('close', () => handleCleanup());
        call.on('error', (err) => {
            console.error("Peer Call Error:", err);
            handleCleanup();
        });
    };

    const startCall = async (e) => {
        if (e) e.stopPropagation();
        if (!myPeer.current?.open) return alert("Voice server not ready.");

        try {
            setCallStatus('calling');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStream.current = stream;

            const myPeerId = currentUser.id + "-voice";
            
            // 1. Send signaling to wake up their UI
            socket.emit('call-user', {
                to: partnerId,
                from: currentUser.id,
                peerId: myPeerId
            });

            // 2. Start the PeerJS call
            const call = myPeer.current.call(partnerId + "-voice", stream);
            setupCallListeners(call);

        } catch (err) {
            console.error("Mic access denied:", err);
            setCallStatus('idle');
        }
    };

    const answerCall = async (e) => {
        if (e) e.stopPropagation();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStream.current = stream;

            if (currentCall.current) {
                // Answer the incoming PeerJS call
                currentCall.current.answer(stream);
                setupCallListeners(currentCall.current);
            } else if (callerPeerId.current) {
                // If the peer object isn't here yet, we initiate the call back
                const call = myPeer.current.call(callerPeerId.current, stream);
                setupCallListeners(call);
            }

            setCallStatus('oncall');
            socket.emit('answer-call', { to: partnerId });

        } catch (err) {
            console.error("Error answering call:", err);
        }
    };

    const handleCleanup = () => {
        localStream.current?.getTracks().forEach(track => track.stop());
        currentCall.current?.close();
        remoteAudio.current.srcObject = null;
        setCallStatus('idle');
        callerPeerId.current = null;
    };

    const stopCall = (e) => {
        if (e) e.stopPropagation();
        socket.emit('end-voice-call', { to: partnerId });
        handleCleanup();
    };

    // ... Keep your existing return code and voiceStyles as they were ...
    return (
        <>
          <AnimatePresence>
            {callStatus === 'ringing' && (
              <motion.div key="ringingOverlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => e.stopPropagation()} style={voiceStyles.fullscreenOverlay}>
                <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} style={voiceStyles.ringingCard}>
                  <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }} transition={{ duration: 1.5, repeat: Infinity }} style={voiceStyles.pulseRing} />
                  <div style={voiceStyles.avatarCircle}>📞</div>
                  <p style={voiceStyles.callingText}>Incoming Call</p>
                  <p style={voiceStyles.callerName}>{currentUser.id === "9492" ? "Rahitha" : "Eusebio"}</p>
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
              <motion.div key="activeOverlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => e.stopPropagation()} style={voiceStyles.fullscreenOverlay}>
                <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} style={voiceStyles.ringingCard}>
                  <div style={voiceStyles.avatarCircle}>{callStatus === 'oncall' ? '🎙️' : '📞'}</div>
                  <p style={voiceStyles.callingText}>{callStatus === 'oncall' ? 'In Call' : 'Calling...'}</p>
                  <p style={voiceStyles.callerName}>{currentUser.id === "9492" ? "Rahitha" : "Eusebio"}</p>
                  <button onClick={stopCall} style={{ ...voiceStyles.declineBtn, marginTop: '20px' }}>✕</button>
                  <span style={voiceStyles.btnLabel}>{callStatus === 'oncall' ? 'End' : 'Cancel'}</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
    
          {callStatus === 'idle' && (
            <button onClick={startCall} style={voiceStyles.callBtn}>📞</button>
          )}
        </>
    );
};

const voiceStyles = {
    callBtn: { background: '#8a9a8e', border: 'none', borderRadius: '50%', width: '36px', height: '36px', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    fullscreenOverlay: { position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(12px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    ringingCard: { background: 'linear-gradient(145deg, #1a1a1a, #0d0d0d)', border: '1px solid rgba(138, 154, 142, 0.4)', borderRadius: '30px', padding: '40px 50px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', minWidth: '260px', position: 'relative' },
    pulseRing: { position: 'absolute', width: '110px', height: '110px', borderRadius: '50%', background: 'rgba(138, 154, 142, 0.3)', top: '28px' },
    avatarCircle: { width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(138, 154, 142, 0.15)', border: '2px solid #8a9a8e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', zIndex: 1 },
    callingText: { color: '#8a9a8e', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '10px' },
    callerName: { color: '#fff', fontSize: '20px', fontWeight: 'bold' },
    ringingBtns: { display: 'flex', gap: '50px', marginTop: '10px' },
    acceptBtn: { background: '#4caf50', border: 'none', borderRadius: '50%', width: '60px', height: '60px', color: '#fff', fontSize: '22px', cursor: 'pointer' },
    declineBtn: { background: '#f44336', border: 'none', borderRadius: '50%', width: '60px', height: '60px', color: '#fff', fontSize: '22px', cursor: 'pointer' },
    btnLabel: { color: '#aaa', fontSize: '11px', marginTop: '4px' }
};

export default VoiceCall;