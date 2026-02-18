import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { styles } from './styles';

// 🔥 API BASE - KEPT UNCHANGED AS REQUESTED
const API_BASE = window.location.hostname === "localhost" ? "http://localhost:5000" : "https://calcsocket.onrender.com";
const socket = io.connect(API_BASE);

const USERS = { "9492": { name: "Eusebio", id: "9492" }, "9746": { name: "Rahitha", id: "9746" } };

function App() {
  const [calcDisplay, setCalcDisplay] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [vh, setVh] = useState('100dvh');
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [moodColor, setMoodColor] = useState("#050505");

  const chatEndRef = useRef(null);
  const lastTap = useRef(0);

  // 1. 🔥 VIEWPORT & KEYBOARD FIX
  // Prevents "drag down" white space and keeps input flush with keyboard
  useEffect(() => {
    const updateViewport = () => {
      if (window.visualViewport) {
        setVh(`${window.visualViewport.height}px`);
        setKeyboardOpen(window.visualViewport.height < window.innerHeight * 0.85);
        if (window.visualViewport.height < window.innerHeight) {
          window.scrollTo(0, 0); // Lock scroll
          setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
      }
    };
    window.visualViewport?.addEventListener('resize', updateViewport);
    window.visualViewport?.addEventListener('scroll', () => window.scrollTo(0, 0));
    return () => window.visualViewport?.removeEventListener('resize', updateViewport);
  }, []);

  // 2. 🔥 SHARED ATMOSPHERE ENGINE
  // This evaluates the chat log and updates background for BOTH users
  useEffect(() => {
    if (chatLog.length === 0) return;
    const lastMsg = chatLog[chatLog.length - 1].text?.trim();
    
    if (lastMsg?.includes("❤️") && lastMsg?.includes("🫂")) {
      setMoodColor("linear-gradient(135deg, #3d0a0a 0%, #0a1a3d 100%)");
    } else if (lastMsg === "❤️") {
      setMoodColor("#3d0a0a");
    } else if (lastMsg === "🫂") {
      setMoodColor("#0a1a3d");
    } else if (lastMsg === "😁") {
      setMoodColor("#050505");
    }
  }, [chatLog]);

  // 3. 🔥 DATA FETCHING & SOCKETS
  useEffect(() => {
    if (isUnlocked && currentUser) {
      // Initial Load
      axios.get(`${API_BASE}/messages`).then(res => setChatLog(res.data));
      
      // Listen for incoming messages (Syncs mood and text for both)
      socket.on('receive_message', (msg) => {
        setChatLog(prev => [...prev, msg]);
      });

      // Mark messages as seen
      axios.post(`${API_BASE}/seen`, { userId: currentUser.id });
    }

    return () => {
      socket.off('receive_message');
    };
  }, [isUnlocked, currentUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  // 4. 🔥 HANDLERS
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (ev) => {
      const img = new Image(); img.src = ev.target.result;
      img.onload = () => {
        const canv = document.createElement('canvas'); const ctx = canv.getContext('2d');
        const MAX = 800; canv.width = MAX; canv.height = img.height * (MAX / img.width);
        ctx.drawImage(img, 0, 0, canv.width, canv.height);
        socket.emit('send_message', { 
          text: "", 
          image: canv.toDataURL('image/jpeg', 0.6), 
          senderId: currentUser.id, 
          senderName: currentUser.name 
        });
        e.target.value = "";
      };
    };
  };

  const handlePress = (v) => {
    if (v === "=") {
      if (USERS[calcDisplay]) { setCurrentUser(USERS[calcDisplay]); setIsUnlocked(true); }
      else { try { setCalcDisplay(String(eval(calcDisplay))); } catch { setCalcDisplay("Error"); setTimeout(() => setCalcDisplay(""), 800); } }
    } else if (v === "C") setCalcDisplay("");
    else setCalcDisplay(p => p === "Error" ? v : p + v);
  };

  const sendText = () => {
    if (message.trim()) {
      socket.emit('send_message', { 
        text: message, 
        image: null, 
        senderId: currentUser.id, 
        senderName: currentUser.name 
      });
      setMessage("");
    }
  };

  return (
    <div style={{ ...styles.appViewport, height: vh }}>
      <AnimatePresence mode="wait">
        {!isUnlocked ? (
          <motion.div key="calc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={styles.calcPage}>
            <div style={styles.calcCard}>
              <div style={styles.calcDisplay}>{calcDisplay || "0"}</div>
              <div style={styles.calcGrid}>
                {["C", "/", "*", "-", "7", "8", "9", "+", "4", "5", "6", "(", "1", "2", "3", ")", "0", ".", "="].map(btn => (
                  <button key={btn} onClick={() => handlePress(btn)} style={{...styles.calcBtn, ...(btn === "=" ? styles.equalBtn : {})}}>{btn}</button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="chat" initial={{ y: "100%" }} animate={{ y: 0 }} style={styles.chatPage} onClick={() => {
            if (Date.now() - lastTap.current < 300) { setIsUnlocked(false); setCalcDisplay(""); }
            else lastTap.current = Date.now();
          }}>
            
            {/* 🔥 ATMOSPHERE LAYER (3s Spreading Color) */}
            <motion.div 
              style={{ ...styles.atmosphere, background: moodColor, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }} 
              animate={{ background: moodColor }}
              transition={{ duration: 3, ease: "easeInOut" }}
            />

            <div style={styles.chatHeader}>
              <div style={{ display: 'flex', alignItems: 'center' }}><div style={styles.statusDot} /><span style={{ color: '#fff', fontWeight: 'bold' }}>Vault</span></div>
              <button onClick={() => { setIsUnlocked(false); setCalcDisplay(""); }} style={styles.lockBtn}>Done</button>
            </div>
            
            <div style={styles.messageList}>
              {chatLog.map((m, i) => {
                const isMe = m.senderId === currentUser.id;
                const isMood = ["❤️", "🫂", "😁"].includes(m.text?.trim());
                return (
                  <div key={i} style={{ ...styles.msgRow, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{ 
                      ...styles.bubble, 
                      backgroundColor: isMe ? 'rgba(138, 154, 142, 0.85)' : 'rgba(26, 26, 26, 0.85)', 
                      color: isMe ? '#000' : '#fff',
                      backdropFilter: 'blur(5px)'
                    }}>
                      {m.image && <><img src={m.image} alt="v" style={{ maxWidth: '100%', borderRadius: '12px' }} /><a href={m.image} download style={{ ...styles.downloadLink, color: isMe ? '#000' : '#8a9a8e' }}>Download</a></>}
                      {m.text && <div style={{ wordBreak: 'break-word', fontSize: isMood ? '45px' : '16px' }}>{m.text}</div>}
                      <div style={{ fontSize: '10px', opacity: 0.5, marginTop: '4px' }}>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} style={{ height: '20px' }} />
            </div>

            <div style={{ ...styles.inputArea, paddingBottom: keyboardOpen ? '10px' : 'calc(10px + env(safe-area-inset-bottom))' }} onClick={e => e.stopPropagation()}>
              <input type="file" id="imgInput" hidden onChange={handleImageUpload} accept="image/*" />
              <button onClick={() => document.getElementById('imgInput').click()} style={styles.imgBtn}>📷</button>
              <input 
                style={styles.input} 
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                placeholder="Message..." 
                onKeyPress={e => e.key === 'Enter' && sendText()} 
              />
              <button onClick={sendText} style={styles.sendBtn}>➔</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;