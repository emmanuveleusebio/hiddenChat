import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

const socket = io.connect('https://calcsocket.onrender.com');

const USERS = {
  "9492": { name: "Eusebio", id: "9492" },
  "9746": { name: "Rahitha", id: "9746" }
};

function App() {
  const [calcDisplay, setCalcDisplay] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [showGreeting, setShowGreeting] = useState(false);
  const chatEndRef = useRef(null);
  
  // 🔥 Double Tap State
  const lastTap = useRef(0);

  const fetchMessages = () => {
    axios.get('https://calcsocket.onrender.com/messages')
      .then(res => setChatLog(res.data))
      .catch(err => console.error("History Error:", err));
  };

  const markAsSeen = (userId) => {
    if (!userId) return;
    axios.post('https://calcsocket.onrender.com/seen', { userId })
      .catch(err => console.error("Seen Error:", err));
  };

  const lockApp = () => {
    setIsUnlocked(false);
    setCalcDisplay("");
    setCurrentUser(null);
  };

  // 🔥 Double Tap Handler
  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTap.current < DOUBLE_PRESS_DELAY) {
      lockApp(); // 🔒 Instantly lock
    } else {
      lastTap.current = now;
    }
  };

  useEffect(() => {
    socket.on('receive_message', (msg) => {
      setChatLog(prev => [...prev, msg]);
      if (isUnlocked && currentUser && msg.senderId !== currentUser.id) {
        markAsSeen(currentUser.id);
      }
    });

    socket.on('messages_seen', () => {
      fetchMessages();
    });

    return () => {
      socket.off('receive_message');
      socket.off('messages_seen');
    };
  }, [isUnlocked, currentUser]);

  useEffect(() => {
    if (isUnlocked && currentUser) {
      fetchMessages();
      markAsSeen(currentUser.id);
    }
  }, [isUnlocked, currentUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  const handlePress = (val) => {
    if (val === "=") {
      if (USERS[calcDisplay]) {
        setCurrentUser(USERS[calcDisplay]);
        setShowGreeting(true);
        setTimeout(() => {
          setShowGreeting(false);
          setIsUnlocked(true);
        }, 2200);
      } else {
        try {
          // eslint-disable-next-line no-eval
          const result = eval(calcDisplay);
          setCalcDisplay(String(result));
        } catch {
          setCalcDisplay("Error");
          setTimeout(() => setCalcDisplay(""), 800);
        }
      }
    } else if (val === "C") {
      setCalcDisplay("");
    } else {
      setCalcDisplay(prev => (prev === "Error" ? val : prev + val));
    }
  };

  const sendMessage = () => {
    if (message.trim() && currentUser) {
      const payload = {
        text: message,
        senderId: currentUser.id,
        senderName: currentUser.name,
        seen: false,
        timestamp: new Date()
      };
      socket.emit('send_message', payload);
      setMessage("");
    }
  };

  return (
    <div style={styles.appViewport}>
      <AnimatePresence mode="wait">
        
        {!isUnlocked && !showGreeting && (
          <motion.div key="calc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={styles.calcPage}>
            <div style={styles.calcContainer}>
              <div style={styles.calcDisplay}>{calcDisplay || "0"}</div>
              <div style={styles.calcGrid}>
                {["C", "/", "*", "-", "7", "8", "9", "+", "4", "5", "6", "(", "1", "2", "3", ")", "0", ".", "="].map(btn => (
                  <motion.button key={btn} whileTap={{ scale: 0.92 }} onClick={() => handlePress(btn)}
                    style={{...styles.calcBtn, ...(btn === "=" ? styles.equalBtn : {}), ...(isNaN(btn) && btn !== "." ? styles.opBtn : {})}}>
                    {btn}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {showGreeting && (
          <motion.div key="greet" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={styles.greetPage}>
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
              <h1 style={{ color: '#8a9a8e', fontSize: '32px', marginBottom: '10px' }}>Hello, {currentUser.name}</h1>
              <div style={styles.syncBar}><motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2 }} style={styles.syncProgress} /></div>
              <p style={{ color: '#555', fontSize: '14px', marginTop: '10px' }}>Establishing secure tunnel...</p>
            </motion.div>
          </motion.div>
        )}

        {isUnlocked && (
          <motion.div 
            key="chat" 
            initial={{ y: "100dvh" }} 
            animate={{ y: 0 }} 
            exit={{ opacity: 0 }} 
            transition={{ type: 'spring', damping: 25, stiffness: 120 }} 
            style={styles.chatPage}
            onClick={handleDoubleTap} // 🔥 TRIGGER ON DOUBLE TAP ANYWHERE
          >
            <div style={styles.chatHeader}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={styles.statusDot} />
                <span style={styles.headerText}>Rahitha & Eusebio</span>
              </div>
              <button onClick={lockApp} style={styles.lockBtn}>Done</button>
            </div>

            <div style={styles.messageList}>
              {chatLog.map((m, i) => {
                const isMe = m.senderId === currentUser.id;
                return (
                  <div key={i} style={{ ...styles.msgRow, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                      style={{ 
                        ...styles.bubble, 
                        backgroundColor: isMe ? '#8a9a8e' : '#1a1a1a', 
                        color: isMe ? '#000' : '#fff',
                        borderBottomRightRadius: isMe ? '4px' : '20px',
                        borderBottomLeftRadius: isMe ? '20px' : '4px'
                      }}>
                      {m.text}
                      <div style={{ ...styles.meta, color: isMe ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)' }}>
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isMe && (
                          <span style={{ marginLeft: '6px', fontWeight: 'bold', color: m.seen ? '#004d40' : 'rgba(0,0,0,0.3)' }}>
                            {m.seen ? "✓✓" : "✓"}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            <div style={styles.inputArea} onClick={(e) => e.stopPropagation()}> {/* Prevent lock when clicking input area */}
              <input style={styles.input} value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a message..." onKeyPress={e => e.key === 'Enter' && sendMessage()} />
              <button onClick={sendMessage} style={styles.sendBtn}>➔</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  appViewport: { height: '100dvh', width: '100vw', backgroundColor: '#000', overflow: 'hidden', margin: 0, padding: 0 },
  calcPage: { height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at center, #1a1a1a 0%, #000 100%)' },
  calcContainer: { width: '100%', maxWidth: '380px', padding: '20px' },
  calcDisplay: { fontSize: '70px', color: '#8a9a8e', textAlign: 'right', padding: '40px 10px', fontWeight: '200', minHeight: '140px' },
  calcGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' },
  calcBtn: { aspectRatio: '1', borderRadius: '18px', border: 'none', backgroundColor: '#111', color: '#fff', fontSize: '24px', cursor: 'pointer' },
  opBtn: { backgroundColor: '#222', color: '#8a9a8e' },
  equalBtn: { backgroundColor: '#8a9a8e', color: '#000', fontWeight: 'bold' },
  greetPage: { height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' },
  syncBar: { width: '200px', height: '3px', backgroundColor: '#222', borderRadius: '10px', overflow: 'hidden', marginTop: '10px' },
  syncProgress: { height: '100%', backgroundColor: '#8a9a8e' },
  chatPage: { height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#050505' },
  chatHeader: { padding: '60px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #111', backgroundColor: '#0a0a0a' },
  statusDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ade80', marginRight: '10px' },
  headerText: { color: '#fff', fontWeight: '600', fontSize: '18px' },
  lockBtn: { background: 'none', border: 'none', color: '#8a9a8e', fontWeight: 'bold', fontSize: '16px' },
  messageList: { flex: 1, padding: '20px', overflowY: 'auto' },
  msgRow: { display: 'flex', marginBottom: '14px', width: '100%' },
  bubble: { padding: '12px 18px', borderRadius: '22px', maxWidth: '80%', fontSize: '16px' },
  meta: { fontSize: '10px', marginTop: '4px', textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' },
  inputArea: { padding: '15px 20px 45px', display: 'flex', gap: '12px', backgroundColor: '#0a0a0a', borderTop: '1px solid #111' },
  input: { flex: 1, padding: '14px 20px', borderRadius: '30px', border: 'none', backgroundColor: '#1a1a1a', color: '#fff', outline: 'none' },
  sendBtn: { width: '48px', height: '48px', borderRadius: '50%', border: 'none', backgroundColor: '#8a9a8e', color: '#000' }
};

export default App;