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
  const [vh, setVh] = useState(window.innerHeight); // Track exact pixels
  const [moodColor, setMoodColor] = useState("#050505");

  const chatEndRef = useRef(null);

  // 🔥 THE FIX: Stop the browser from scrolling the page up
  useEffect(() => {
    const fixViewport = () => {
      if (window.visualViewport) {
        // Set height to the actual space available above the keyboard
        setVh(window.visualViewport.height);
        
        // ❌ FORCE the browser to stay at the top (0,0)
        // This prevents the input box from flying to the top of the screen
        window.scrollTo(0, 0); 
      }
    };

    window.visualViewport?.addEventListener('resize', fixViewport);
    window.visualViewport?.addEventListener('scroll', fixViewport);
    
    return () => {
      window.visualViewport?.removeEventListener('resize', fixViewport);
      window.visualViewport?.removeEventListener('scroll', fixViewport);
    };
  }, []);

  // Mood Sync
  useEffect(() => {
    if (chatLog.length === 0) return;
    const lastMsg = chatLog[chatLog.length - 1].text?.trim();
    if (lastMsg?.includes("❤️") && lastMsg?.includes("🫂")) setMoodColor("linear-gradient(135deg, #3d0a0a 0%, #0a1a3d 100%)");
    else if (lastMsg === "❤️") setMoodColor("#3d0a0a");
    else if (lastMsg === "🫂") setMoodColor("#0a1a3d");
    else if (lastMsg === "😁") setMoodColor("#050505");
  }, [chatLog]);

  // Sockets & Initial Load
  useEffect(() => {
    socket.on('receive_message', (msg) => setChatLog(p => [...p, msg]));
    return () => socket.off('receive_message');
  }, []);

  useEffect(() => {
    if (isUnlocked && currentUser) axios.get(`${API_BASE}/messages`).then(res => setChatLog(res.data));
  }, [isUnlocked, currentUser]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatLog]);

  const handlePress = (v) => {
    if (v === "=") {
      if (USERS[calcDisplay]) { setCurrentUser(USERS[calcDisplay]); setIsUnlocked(true); }
      else { try { setCalcDisplay(String(eval(calcDisplay))); } catch { setCalcDisplay("0"); } }
    } else if (v === "C") setCalcDisplay("");
    else setCalcDisplay(p => p + v);
  };

  const send = () => {
    if (message.trim()) {
      socket.emit('send_message', { text: message, image: null, senderId: currentUser.id, senderName: currentUser.name });
      setMessage("");
    }
  };

  return (
    <div style={{ ...styles.appViewport, height: `${vh}px` }}>
      <AnimatePresence mode="wait">
        {!isUnlocked ? (
          <motion.div key="calc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.calcPage}>
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
          <motion.div key="chat" initial={{ y: "100%" }} animate={{ y: 0 }} style={styles.chatPage}>
            <motion.div style={{ ...styles.atmosphere, background: moodColor }} animate={{ background: moodColor }} transition={{ duration: 3 }} />
            
            <div style={styles.chatHeader}>
              <div style={{ display: 'flex', alignItems: 'center' }}><div style={styles.statusDot} /><span style={{ color: '#fff' }}>Vault</span></div>
              <button onClick={() => { setIsUnlocked(false); setCalcDisplay(""); }} style={styles.lockBtn}>Done</button>
            </div>

            <div style={styles.messageList}>
              {chatLog.map((m, i) => {
                const isMe = m.senderId === currentUser.id;
                const isMood = ["❤️", "🫂", "😁"].includes(m.text?.trim());
                return (
                  <div key={i} style={{ ...styles.msgRow, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{ ...styles.bubble, backgroundColor: isMe ? 'rgba(138, 154, 142, 0.9)' : 'rgba(26, 26, 26, 0.9)', color: isMe ? '#000' : '#fff' }}>
                      <div style={{ wordBreak: 'break-word', fontSize: isMood ? '45px' : '16px' }}>{m.text}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            <div style={styles.inputArea}>
              <input style={styles.input} value={message} onChange={e => setMessage(e.target.value)} placeholder="Message..." onKeyPress={e => e.key === 'Enter' && send()} />
              <button onClick={send} style={styles.sendBtn}>➔</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;