import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { styles } from './styles';

const API_BASE = window.location.hostname === "localhost" ? "http://localhost:5000" : "https://calcsocket.onrender.com";
const socket = io.connect(API_BASE);
const USERS = { "9492": { name: "Eusebio", id: "9492" }, "9746": { name: "Rahitha", id: "9746" } };

function App() {
  const [calcDisplay, setCalcDisplay] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [showGreeting, setShowGreeting] = useState(false);
  const [vh, setVh] = useState('100dvh');
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const chatEndRef = useRef(null);
  const lastTap = useRef(0);

  // 🔥 KEYBOARD & VIEWPORT LOGIC
  useEffect(() => {
    const updateViewport = () => {
      if (window.visualViewport) {
        setVh(`${window.visualViewport.height}px`);
        // Check if keyboard is likely open (viewport height significantly less than screen height)
        setKeyboardOpen(window.visualViewport.height < window.innerHeight * 0.85);
        
        if (window.visualViewport.height < window.innerHeight) {
          setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
      }
    };
    window.visualViewport?.addEventListener('resize', updateViewport);
    return () => window.visualViewport?.removeEventListener('resize', updateViewport);
  }, []);

  const fetchMessages = () => axios.get(`${API_BASE}/messages`).then(res => setChatLog(res.data));
  const markAsSeen = (id) => axios.post(`${API_BASE}/seen`, { userId: id });

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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        socket.emit('send_message', { text: "", image: canvas.toDataURL('image/jpeg', 0.7), senderId: currentUser.id, senderName: currentUser.name, timestamp: new Date() });
        e.target.value = "";
      };
    };
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
      socket.emit('send_message', { text: message, image: null, senderId: currentUser.id, senderName: currentUser.name, timestamp: new Date() });
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
                  <motion.button key={btn} whileTap={{ scale: 0.9 }} onClick={() => handlePress(btn)} style={{...styles.calcBtn, ...(btn === "=" ? styles.equalBtn : {}), ...(isNaN(btn) && btn !== "." ? styles.opBtn : {})}}>{btn}</motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {showGreeting && (
          <motion.div key="greet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.calcPage}>
            <h1 style={{ color: '#8a9a8e' }}>Accessing Vault...</h1>
          </motion.div>
        )}

        {isUnlocked && (
          <motion.div key="chat" initial={{ y: "100%" }} animate={{ y: 0 }} style={styles.chatPage} onClick={() => {
            const now = Date.now();
            if (now - lastTap.current < 300) { setIsUnlocked(false); setCalcDisplay(""); }
            else lastTap.current = now;
          }}>
            <div style={styles.chatHeader}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={styles.statusDot} />
                <span style={{ color: '#fff', fontWeight: '600' }}>Rahitha & Eusebio</span>
              </div>
              <button onClick={() => setIsUnlocked(false)} style={styles.lockBtn}>Done</button>
            </div>
            
            <div style={{ ...styles.messageList, paddingBottom: keyboardOpen ? '20px' : '100px' }}>
              {chatLog.map((m, i) => {
                const isMe = m.senderId === currentUser.id;
                return (
                  <div key={i} style={{ ...styles.msgRow, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{ ...styles.bubble, backgroundColor: isMe ? '#8a9a8e' : '#1a1a1a', color: isMe ? '#000' : '#fff' }}>
                      {m.image && <><img src={m.image} alt="v" style={{ maxWidth: '100%', borderRadius: '12px' }} /><a href={m.image} download="v.png" style={{ ...styles.downloadLink, color: isMe ? '#000' : '#8a9a8e' }}>Download Image</a></>}
                      {m.text && <div style={{ wordBreak: 'break-word' }}>{m.text}</div>}
                      <div style={{ fontSize: '10px', marginTop: '4px', textAlign: 'right', opacity: 0.5 }}>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{isMe && <span style={{ marginLeft: 5 }}>{m.seen ? "✓✓" : "✓"}</span>}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} style={{ height: '20px' }} />
            </div>

            <div style={{ 
              ...styles.inputArea, 
              paddingBottom: keyboardOpen ? '10px' : 'calc(10px + env(safe-area-inset-bottom))' 
            }} onClick={(e) => e.stopPropagation()}>
              <input type="file" id="imgInput" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              <button onClick={() => document.getElementById('imgInput').click()} style={styles.imgBtn}>📷</button>
              <input style={styles.input} value={message} onChange={e => setMessage(e.target.value)} placeholder="Message..." onKeyPress={e => e.key === 'Enter' && sendMessage()} />
              <button onClick={sendMessage} style={styles.sendBtn}>➔</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;