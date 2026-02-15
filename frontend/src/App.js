import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const socket = io.connect('https://calcsocket.onrender.com');

const USERS = {
  "9492": { name: "Eusebio", color: "#8a9a8e" },
  "9746": { name: "Rahitha", color: "#d1b3c4" }
};

function App() {
  const [calcDisplay, setCalcDisplay] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [showGreeting, setShowGreeting] = useState(false);
  const chatEndRef = useRef(null);

  // Real Calculator Logic
  const handlePress = (val) => {
    if (val === "=") {
      if (USERS[calcDisplay]) {
        setCurrentUser({ id: calcDisplay, ...USERS[calcDisplay] });
        setShowGreeting(true);
        setTimeout(() => { setShowGreeting(false); setIsUnlocked(true); }, 2200);
      } else {
        try {
          // Evaluate real math if it's not a secret code
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

  useEffect(() => {
    if (isUnlocked) {
      axios.get('https://calcsocket.onrender.com/messages').then(res => setChatLog(res.data));
    }
  }, [isUnlocked]);

  useEffect(() => {
    socket.on('receive_message', (msg) => setChatLog(prev => [...prev, msg]));
    return () => socket.off('receive_message');
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('send_message', { text: message, senderId: currentUser.id, senderName: currentUser.name });
      setMessage("");
    }
  };

  return (
    <div style={styles.appContainer}>
      <AnimatePresence mode="wait">
        {!isUnlocked && !showGreeting && (
          <motion.div 
            key="calc" 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            style={styles.calcScreen}
          >
            <div style={styles.calcCard}>
              <div style={styles.calcDisplay}>{calcDisplay || "0"}</div>
              <div style={styles.calcGrid}>
                {["C", "/", "*", "-", "7", "8", "9", "+", "4", "5", "6", "(", "1", "2", "3", ")", "0", ".", "="].map(btn => (
                  <motion.button
                    key={btn}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95, filter: 'brightness(1.2)' }}
                    onClick={() => handlePress(btn)}
                    style={{
                      ...styles.calcBtn,
                      ...(btn === "=" ? styles.equalBtn : {}),
                      ...(isNaN(btn) && btn !== "." ? styles.opBtn : {})
                    }}
                  >
                    {btn}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {showGreeting && (
          <motion.div 
            key="greet" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={styles.greetContainer}
          >
            <motion.div 
              initial={{ scale: 0.5 }} animate={{ scale: 1 }}
              style={styles.greetCircle}
            >
              <h2 style={{color: '#8a9a8e', margin: 0}}>Hello, {currentUser.name}</h2>
              <p style={{color: '#888', fontSize: '14px'}}>Secure tunnel established</p>
            </motion.div>
          </motion.div>
        )}

        {isUnlocked && (
          <motion.div 
            key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={styles.chatContainer}
          >
            <div style={styles.chatHeader}>
              <div>
                <span style={styles.headerDot} />
                <span style={styles.headerName}>Rahitha & Eusebio</span>
              </div>
              <button onClick={() => setIsUnlocked(false)} style={styles.closeBtn}>Done</button>
            </div>
            
            <div style={styles.messageList}>
              {chatLog.map((m, i) => {
                const isMe = m.senderId === currentUser.id;
                return (
                  <motion.div 
                    key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    style={{...styles.msgRow, justifyContent: isMe ? 'flex-end' : 'flex-start'}}
                  >
                    <div style={{
                      ...styles.bubble, 
                      backgroundColor: isMe ? '#8a9a8e' : '#222',
                      color: isMe ? '#121212' : '#fff',
                      borderBottomRightRadius: isMe ? '4px' : '20px',
                      borderBottomLeftRadius: isMe ? '20px' : '4px'
                    }}>
                      {m.text}
                      <div style={styles.meta}>{new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            <div style={styles.inputArea}>
              <input 
                style={styles.input} value={message} 
                onChange={e => setMessage(e.target.value)} 
                placeholder="Secure message..."
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
  appContainer: {
    height: '100dvh',
    width: '100vw',
    backgroundColor: '#000',
    overflow: 'hidden'
  },
  // --- Calculator UI ---
  calcScreen: {
    height: '100%',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle at top left, #1c1c1c 0%, #000 100%)'
  },
  calcCard: {
    width: '100%',
    maxWidth: '380px',
    padding: '20px',
    boxSizing: 'border-box'
  },
  calcDisplay: {
    fontSize: '70px',
    color: '#8a9a8e',
    textAlign: 'right',
    padding: '20px 10px',
    fontWeight: '200',
    minHeight: '100px',
    wordBreak: 'break-all'
  },
  calcGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px'
  },
  calcBtn: {
    aspectRatio: '1',
    borderRadius: '18px',
    border: 'none',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: '22px',
    fontWeight: '500',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
  },
  opBtn: { backgroundColor: '#2a2a2a', color: '#8a9a8e' },
  equalBtn: { backgroundColor: '#8a9a8e', color: '#121212' },

  // --- Greeting ---
  greetContainer: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  greetCircle: { textAlign: 'center', padding: '40px' },

  // --- Chat UI ---
  chatContainer: { height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#0a0a0a' },
  chatHeader: { padding: '50px 20px 15px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1a1a1a' },
  headerDot: { display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#8a9a8e', marginRight: '10px' },
  headerName: { color: '#fff', fontWeight: '600' },
  closeBtn: { background: 'none', border: 'none', color: '#8a9a8e', fontWeight: '700' },
  messageList: { flex: 1, padding: '20px', overflowY: 'auto' },
  msgRow: { display: 'flex', marginBottom: '12px' },
  bubble: { padding: '12px 18px', borderRadius: '20px', maxWidth: '80%', position: 'relative', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' },
  meta: { fontSize: '10px', opacity: 0.6, marginTop: '4px', textAlign: 'right' },
  inputArea: { padding: '15px 20px 35px', display: 'flex', gap: '10px', backgroundColor: '#0d0d0d' },
  input: { flex: 1, padding: '15px 20px', borderRadius: '25px', border: 'none', backgroundColor: '#1a1a1a', color: '#fff', outline: 'none' },
  sendBtn: { width: '50px', height: '50px', borderRadius: '50%', border: 'none', backgroundColor: '#8a9a8e', color: '#000', fontSize: '20px' }
};

export default App;