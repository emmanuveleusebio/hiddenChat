import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const socket = io.connect('https://calcsocket.onrender.com');

const USERS = {
  "9492": { name: "Eusebio", color: "#8a9a8e" }, // Sage
  "9746": { name: "Rahitha", color: "#d1b3c4" }  // Dust Rose
};

function App() {
  const [calcDisplay, setCalcDisplay] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [showGreeting, setShowGreeting] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isUnlocked) {
      axios.get('https://calcsocket.onrender.com/messages').then(res => setChatLog(res.data));
      axios.post('https://calcsocket.onrender.com/seen', { userId: currentUser.id });
    }
  }, [isUnlocked]);

  useEffect(() => {
    socket.on('receive_message', (msg) => {
      setChatLog(prev => [...prev, msg]);
      if (isUnlocked) axios.post('https://calcsocket.onrender.com/seen', { userId: currentUser?.id });
    });
    socket.on('messages_seen', () => {
       // Refresh seen status logic can go here
    });
    return () => socket.off('receive_message');
  }, [isUnlocked, currentUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  const handlePress = (val) => {
    if (val === "=") {
      if (USERS[calcDisplay]) {
        setCurrentUser({ id: calcDisplay, ...USERS[calcDisplay] });
        setShowGreeting(true);
        setTimeout(() => {
          setShowGreeting(false);
          setIsUnlocked(true);
        }, 2000);
      } else {
        setCalcDisplay("Error");
        setTimeout(() => setCalcDisplay(""), 800);
      }
    } else if (val === "C") {
      setCalcDisplay("");
    } else {
      if (calcDisplay.length < 10) setCalcDisplay(prev => prev + val);
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
    <div style={styles.mainContainer}>
      <AnimatePresence mode="wait">
        {!isUnlocked && !showGreeting && (
          <motion.div key="calc" exit={{ opacity: 0 }} style={styles.container}>
            <div style={styles.display}>{calcDisplay || "0"}</div>
            <div style={styles.grid}>
              {["C", "/", "*", "-", "7", "8", "9", "+", "4", "5", "6", "1", "2", "3", "0", ".", "="].map(btn => (
                <button key={btn} onClick={() => handlePress(btn)} style={{...styles.btn, ...(btn === "=" ? styles.sageBtn : {})}}>{btn}</button>
              ))}
            </div>
          </motion.div>
        )}

        {showGreeting && (
          <motion.div key="greet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={styles.greetScreen}>
            <motion.h1 initial={{ scale: 0.8 }} animate={{ scale: 1.1 }} style={{color: '#8a9a8e'}}>Welcome, {currentUser.name}</motion.h1>
            <p style={{color: '#666'}}>Syncing secure vault...</p>
          </motion.div>
        )}

        {isUnlocked && (
          <motion.div key="chat" initial={{ y: "100%" }} animate={{ y: 0 }} style={styles.chatWrapper}>
            <div style={styles.chatHeader}>
              <span style={styles.headerTitle}>Rahitha ❤️ Eusebio</span>
              <button onClick={() => setIsUnlocked(false)} style={styles.exitBtn}>Close</button>
            </div>

            <div style={styles.messageList}>
              {chatLog.map((m, i) => {
                const isMe = m.senderId === currentUser.id;
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: isMe ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} 
                    style={{ ...styles.msgRow, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{ ...styles.bubble, backgroundColor: isMe ? '#8a9a8e' : '#262626', color: isMe ? '#000' : '#fff' }}>
                      {m.text}
                      <div style={styles.meta}>
                        {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                        {isMe && <span style={{marginLeft: 5}}>{m.seen ? "✓✓" : "✓"}</span>}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            <div style={styles.inputArea}>
              <input style={styles.input} value={message} onChange={e => setMessage(e.target.value)} placeholder="Message..." onKeyPress={e => e.key === 'Enter' && sendMessage()}/>
              <button onClick={sendMessage} style={styles.sendBtn}>➔</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  mainContainer: { height: '100dvh', backgroundColor: '#000', overflow: 'hidden', fontFamily: '-apple-system, sans-serif' },
  container: { height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '40px 24px', backgroundColor: '#121212' },
  display: { fontSize: '90px', color: '#8a9a8e', textAlign: 'right', fontWeight: '200', marginBottom: '30px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' },
  btn: { aspectRatio: '1', borderRadius: '50%', border: 'none', backgroundColor: '#333', color: '#fff', fontSize: '28px' },
  sageBtn: { backgroundColor: '#8a9a8e', color: '#121212' },
  greetScreen: { height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#121212' },
  chatWrapper: { height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#0a0a0a' },
  chatHeader: { padding: '60px 20px 20px', backgroundColor: '#121212', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #222' },
  headerTitle: { color: '#fff', fontWeight: '600', fontSize: '18px' },
  exitBtn: { color: '#8a9a8e', background: 'none', border: 'none', fontWeight: 'bold' },
  messageList: { flex: 1, padding: '20px', overflowY: 'auto' },
  msgRow: { display: 'flex', marginBottom: '15px', width: '100%' },
  bubble: { padding: '12px 16px', borderRadius: '20px', maxWidth: '75%', position: 'relative', fontSize: '16px' },
  meta: { fontSize: '10px', marginTop: '4px', opacity: 0.7, textAlign: 'right' },
  inputArea: { padding: '20px', backgroundColor: '#121212', display: 'flex', gap: '10px' },
  input: { flex: 1, padding: '15px', borderRadius: '25px', border: 'none', backgroundColor: '#1c1c1c', color: '#fff' },
  sendBtn: { width: '50px', height: '50px', borderRadius: '50%', border: 'none', backgroundColor: '#8a9a8e' }
};

export default App;