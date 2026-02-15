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

  const fetchMessages = () => {
    axios.get('https://calcsocket.onrender.com/messages')
      .then(res => setChatLog(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    socket.on('receive_message', (msg) => {
      setChatLog(prev => [...prev, msg]);
      if (isUnlocked && msg.senderId !== currentUser?.id) {
        axios.post('https://calcsocket.onrender.com/seen', { userId: currentUser.id });
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
      axios.post('https://calcsocket.onrender.com/seen', { userId: currentUser.id });
    }
  }, [isUnlocked, currentUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  const handlePress = (val) => {
    if (val === "=") {
      if (USERS[calcDisplay]) {
        setCurrentUser({ id: calcDisplay, ...USERS[calcDisplay] });
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
    if (message.trim()) {
      socket.emit('send_message', { 
        text: message, 
        senderId: currentUser.id, 
        senderName: currentUser.name 
      });
      setMessage("");
    }
  };

  return (
    <div style={styles.appWrapper}>
      <AnimatePresence mode="wait">
        {!isUnlocked && !showGreeting && (
          <motion.div key="calc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ y: -50, opacity: 0 }} style={styles.calcContainer}>
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
          <motion.div key="greet" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={styles.greetScreen}>
            <motion.h2 animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} style={{ color: '#8a9a8e', fontSize: '28px' }}>
              Hello, {currentUser.name}
            </motion.h2>
            <p style={{ color: '#555' }}>Accessing Private Vault...</p>
          </motion.div>
        )}

        {isUnlocked && (
          <motion.div key="chat" initial={{ y: "100vh" }} animate={{ y: 0 }} transition={{ type: 'spring', damping: 25 }} style={styles.chatWrapper}>
            <div style={styles.chatHeader}>
              <div style={{display: 'flex', alignItems: 'center'}}>
                <div style={styles.onlineDot} />
                <span style={styles.headerTitle}>Rahitha & Eusebio</span>
              </div>
              <button onClick={() => { setIsUnlocked(false); setCalcDisplay(""); }} style={styles.closeBtn}>Done</button>
            </div>

            <div style={styles.messageList}>
              {chatLog.map((m, i) => {
                const isMe = m.senderId === currentUser.id;
                return (
                  <div key={i} style={{...styles.msgRow, justifyContent: isMe ? 'flex-end' : 'flex-start'}}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      style={{ ...styles.bubble, backgroundColor: isMe ? '#8a9a8e' : '#222', color: isMe ? '#000' : '#fff' }}>
                      {m.text}
                      <div style={styles.meta}>
                        {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        {isMe && <span style={{ marginLeft: 5, color: m.seen ? '#4ade80' : '#888' }}>{m.seen ? "✓✓" : "✓"}</span>}
                      </div>
                    </motion.div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            <div style={styles.inputArea}>
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
  appWrapper: {  backgroundColor: '#000', overflow: 'hidden' },
  calcContainer: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at top, #1a1a1a 0%, #000 100%)' },
  calcCard: { width: '100%', maxWidth: '400px', padding: '20px' },
  calcDisplay: { fontSize: '75px', color: '#8a9a8e', textAlign: 'right', padding: '40px 10px', fontWeight: '200' },
  calcGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' },
  calcBtn: { aspectRatio: '1', borderRadius: '20px', border: 'none', backgroundColor: '#1a1a1a', color: '#fff', fontSize: '24px', cursor: 'pointer' },
  opBtn: { backgroundColor: '#2a2a2a', color: '#8a9a8e' },
  equalBtn: { backgroundColor: '#8a9a8e', color: '#121212' },
  greetScreen: { height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  chatWrapper: { height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#000' },
  chatHeader: { padding: '60px 20px 20px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1a1a1a', backgroundColor: '#0d0d0d' },
  onlineDot: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#4ade80', marginRight: '10px' },
  headerTitle: { color: '#fff', fontWeight: '600' },
  closeBtn: { background: 'none', border: 'none', color: '#8a9a8e', fontWeight: 'bold' },
  messageList: { flex: 1, padding: '20px', overflowY: 'auto' },
  msgRow: { display: 'flex', marginBottom: '15px' },
  bubble: { padding: '12px 18px', borderRadius: '22px', maxWidth: '80%', fontSize: '16px' },
  meta: { fontSize: '10px', marginTop: '4px', textAlign: 'right', opacity: 0.6 },
  inputArea: { padding: '20px 20px 45px', display: 'flex', gap: '12px', backgroundColor: '#0d0d0d' },
  input: { flex: 1, padding: '15px 20px', borderRadius: '25px', border: 'none', backgroundColor: '#1c1c1c', color: '#fff', outline: 'none' },
  sendBtn: { width: '50px', height: '50px', borderRadius: '50%', border: 'none', backgroundColor: '#8a9a8e', color: '#000' }
};

export default App;