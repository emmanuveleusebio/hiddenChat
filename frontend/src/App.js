import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [viewportHeight, setViewportHeight] = useState('100dvh');
  
  const chatEndRef = useRef(null);
  const lastTap = useRef(0);

  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        setViewportHeight(`${window.visualViewport.height}px`);
        setTimeout(() => {
          chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);

  const fetchMessages = () => {
    axios.get('https://calcsocket.onrender.com/messages')
      .then(res => setChatLog(res.data))
      .catch(err => console.error(err));
  };

  const markAsSeen = (userId) => {
    if (!userId) return;
    axios.post('https://calcsocket.onrender.com/seen', { userId })
      .catch(err => console.error(err));
  };

  const lockApp = () => {
    setIsUnlocked(false);
    setCalcDisplay("");
    setCurrentUser(null);
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) lockApp();
    else lastTap.current = now;
  };

  useEffect(() => {
    socket.on('receive_message', (msg) => {
      setChatLog(prev => [...prev, msg]);
      if (isUnlocked && currentUser && msg.senderId !== currentUser.id) {
        markAsSeen(currentUser.id);
      }
    });
    socket.on('messages_seen', () => fetchMessages());
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

  const handlePress = (val) => {
    if (val === "=") {
      if (USERS[calcDisplay]) {
        setCurrentUser(USERS[calcDisplay]);
        setShowGreeting(true);
        setTimeout(() => { setShowGreeting(false); setIsUnlocked(true); }, 2200);
      } else {
        try {
          // eslint-disable-next-line no-eval
          setCalcDisplay(String(eval(calcDisplay)));
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
      socket.emit('send_message', { 
        text: message, 
        senderId: currentUser.id, 
        senderName: currentUser.name,
        timestamp: new Date() 
      });
      setMessage("");
    }
  };

  return (
    <div style={{...styles.appViewport, height: viewportHeight}}>
      <AnimatePresence mode="wait">
        {!isUnlocked && !showGreeting && (
          <motion.div key="calc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={styles.calcPage}>
            <div style={styles.calcCard}>
              <div style={styles.calcDisplay}>{calcDisplay || "0"}</div>
              <div style={styles.calcGrid}>
                {["C", "/", "*", "-", "7", "8", "9", "+", "4", "5", "6", "(", "1", "2", "3", ")", "0", ".", "="].map(btn => (
                  <motion.button key={btn} whileTap={{ scale: 0.9 }} onClick={() => handlePress(btn)}
                    style={{...styles.calcBtn, ...(btn === "=" ? styles.equalBtn : {}), ...(isNaN(btn) && btn !== "." ? styles.opBtn : {})}}>
                    {btn}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {showGreeting && (
          <motion.div key="greet" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={styles.greetPage}>
            <h1 style={{ color: '#8a9a8e', fontSize: '28px' }}>Hello, {currentUser.name}</h1>
            <p style={{ color: '#444' }}>Vault secured.</p>
          </motion.div>
        )}

        {isUnlocked && (
          <motion.div key="chat" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ opacity: 0 }} 
            transition={{ type: 'spring', damping: 25, stiffness: 150 }} 
            style={styles.chatPage} onClick={handleDoubleTap}>
            
            <div style={styles.chatHeader}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={styles.statusDot} />
                <span style={{ color: '#fff', fontWeight: '600' }}>Rahitha & Eusebio</span>
              </div>
              <button onClick={lockApp} style={styles.lockBtn}>Done</button>
            </div>

            <div style={styles.messageList}>
              {chatLog.map((m, i) => {
                const isMe = m.senderId === currentUser.id;
                return (
                  <div key={i} style={{ ...styles.msgRow, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{ ...styles.bubble, backgroundColor: isMe ? '#8a9a8e' : '#1a1a1a', color: isMe ? '#000' : '#fff' }}>
                      {m.text}
                      <div style={{...styles.meta, color: isMe ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)'}}>
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isMe && <span style={{ marginLeft: 6, fontWeight: 'bold', color: m.seen ? '#004d40' : '#444' }}>{m.seen ? "✓✓" : "✓"}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            <div style={styles.inputArea} onClick={(e) => e.stopPropagation()}>
              <input 
                style={styles.input} 
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                placeholder="Message..." 
                onKeyPress={e => e.key === 'Enter' && sendMessage()} 
              />
              <button onClick={sendMessage} style={styles.sendBtn}>➔</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  appViewport: { 
    backgroundColor: '#000', 
    overflow: 'scroll', 
    flexDirection: 'column',
    position: 'fixed', // Keeps the app from scrolling away on mobile
    top: 0,
    left: 0,
    right: 0,
  },
  calcPage: { display: 'flex', alignItems: 'center', justifyContent: 'center',height: '100%',  },
  calcCard: { width: '100%', maxWidth: '400px', padding: '20px' },
  calcDisplay: { fontSize: '75px', color: '#8a9a8e', textAlign: 'right', padding: '20px 10px', fontWeight: '200' },
  calcGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' },
  calcBtn: { aspectRatio: '1', borderRadius: '15px', border: 'none', backgroundColor: '#111', color: '#fff', fontSize: '24px' },
  opBtn: { backgroundColor: '#222', color: '#8a9a8e' },
  equalBtn: { backgroundColor: '#8a9a8e', color: '#000', fontWeight: 'bold' },
  greetPage: { height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  chatPage: { height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#050505', flex: 1, overflow: 'hidden' },
  chatHeader: { 
    padding: 'env(safe-area-inset-top, 20px) 24px 15px', // Adjusted for modern notches
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderBottom: '1px solid #111', 
    backgroundColor: '#0a0a0a',
    flexShrink: 0 // Prevents header from collapsing
  },
  statusDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ade80', marginRight: '10px' },
  lockBtn: { background: 'none', border: 'none', color: '#8a9a8e', fontWeight: 'bold', fontSize: '16px' },
  messageList: { 
    flex: 1, 
    padding: '20px', 
    overflowY: 'auto', 
    WebkitOverflowScrolling: 'touch', // Smooth momentum scrolling for iOS
    display: 'flex',
    flexDirection: 'column'
  },
  msgRow: { display: 'flex', marginBottom: '14px', width: '100%', flexShrink: 0 },
  bubble: { padding: '12px 18px', borderRadius: '22px', maxWidth: '85%', fontSize: '16px' },
  meta: { fontSize: '10px', marginTop: '4px', textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' },
  inputArea: { 
    padding: '12px 15px', 
    paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', 
    display: 'flex', 
    gap: '10px', 
    backgroundColor: '#0a0a0a', 
    borderTop: '1px solid #111',
    flexShrink: 0 // Prevents input from collapsing
  },
  input: { flex: 1, padding: '12px 18px', borderRadius: '25px', border: 'none', backgroundColor: '#1a1a1a', color: '#fff', fontSize: '16px', outline: 'none' },
  sendBtn: { width: '45px', height: '45px', borderRadius: '50%', border: 'none', backgroundColor: '#8a9a8e', color: '#000' }
};

export default App;