import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { styles } from './styles';

const socket = io.connect('https://calcsocket.onrender.com');
const USERS = { "9492": { name: "Eusebio", id: "9492" }, "9746": { name: "Rahitha", id: "9746" } };

function App() {
  const [calcDisplay, setCalcDisplay] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [showGreeting, setShowGreeting] = useState(false);
  const [vh, setVh] = useState('100dvh');

  const chatEndRef = useRef(null);
  const lastTap = useRef(0);

  // 🔥 KEYBOARD FIX: Adjusts viewport when keyboard opens
  useEffect(() => {
    const updateHeight = () => {
      if (window.visualViewport) {
        setVh(`${window.visualViewport.height}px`);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    };
    window.visualViewport?.addEventListener('resize', updateHeight);
    return () => window.visualViewport?.removeEventListener('resize', updateHeight);
  }, []);

  const fetchMessages = () => {
    axios.get('https://calcsocket.onrender.com/messages').then(res => setChatLog(res.data));
  };

  const markAsSeen = (id) => axios.post('https://calcsocket.onrender.com/seen', { userId: id });

  useEffect(() => {
    socket.on('receive_message', (msg) => {
      setChatLog(prev => [...prev, msg]);
      if (isUnlocked && currentUser && msg.senderId !== currentUser.id) markAsSeen(currentUser.id);
    });
    socket.on('messages_seen', fetchMessages);
    return () => { socket.off('receive_message'); socket.off('messages_seen'); };
  }, [isUnlocked, currentUser]);

  useEffect(() => {
    if (isUnlocked && currentUser) { fetchMessages(); markAsSeen(currentUser.id); }
  }, [isUnlocked, currentUser]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatLog]);

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) { setIsUnlocked(false); setCalcDisplay(""); }
    else lastTap.current = now;
  };

  const handlePress = (val) => {
    if (val === "=") {
      if (USERS[calcDisplay]) {
        setCurrentUser(USERS[calcDisplay]);
        setShowGreeting(true);
        setTimeout(() => { setShowGreeting(false); setIsUnlocked(true); }, 2200);
      } else {
        try { setCalcDisplay(String(eval(calcDisplay))); } catch { setCalcDisplay("Error"); setTimeout(() => setCalcDisplay(""), 800); }
      }
    } else if (val === "C") setCalcDisplay("");
    else setCalcDisplay(prev => prev === "Error" ? val : prev + val);
  };

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('send_message', { text: message, senderId: currentUser.id, senderName: currentUser.name, timestamp: new Date() });
      setMessage("");
    }
  };

  return (
    <div style={{ ...styles.appViewport, height: vh }}>
      <AnimatePresence mode="wait">
        {!isUnlocked && !showGreeting && (
          <motion.div key="calc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={styles.calcPage}>
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
          <motion.div key="greet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.calcPage}>
            <h1 style={{ color: '#8a9a8e' }}>Hello, {currentUser.name}</h1>
          </motion.div>
        )}

        {isUnlocked && (
          <motion.div key="chat" initial={{ y: "100%" }} animate={{ y: 0 }} style={styles.chatPage} onClick={handleDoubleTap}>
            <div style={styles.chatHeader}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={styles.statusDot} />
                <span style={{ color: '#fff', fontWeight: '600' }}>Rahitha & Eusebio</span>
              </div>
              <button onClick={() => setIsUnlocked(false)} style={{ background: 'none', border: 'none', color: '#8a9a8e', fontWeight: 'bold' }}>Done</button>
            </div>
            <div style={styles.messageList}>
              {chatLog.map((m, i) => {
                const isMe = m.senderId === currentUser.id;
                return (
                  <div key={i} style={{ ...styles.msgRow, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{ ...styles.bubble, backgroundColor: isMe ? '#8a9a8e' : '#1a1a1a', color: isMe ? '#000' : '#fff' }}>
                      {m.text}
                      <div style={{ fontSize: '10px', marginTop: '4px', textAlign: 'right', opacity: 0.5 }}>
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isMe && <span style={{ marginLeft: 5 }}>{m.seen ? "✓✓" : "✓"}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            <div style={styles.inputArea} onClick={(e) => e.stopPropagation()}>
              <input style={styles.input} value={message} onChange={e => setMessage(e.target.value)} 
                placeholder="Message..." onKeyPress={e => e.key === 'Enter' && sendMessage()} />
              <button onClick={sendMessage} style={styles.sendBtn}>➔</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;