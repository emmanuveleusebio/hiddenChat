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
  const [moodColor, setMoodColor] = useState("#050505");
  const [showKiss, setShowKiss] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState(null);

  const typingTimeoutRef = useRef(null);
  const chatEndRef = useRef(null);
  const lastTap = useRef(0);

  // 1. MOOD LOGIC
  useEffect(() => {
    if (chatLog.length === 0) return;
    const lastMsg = chatLog[chatLog.length - 1].text?.trim();
    if ((lastMsg?.includes("🫂") && lastMsg?.includes("💋")) || (lastMsg?.includes("💋") && lastMsg?.includes("🫂"))) {
      setMoodColor("linear-gradient(135deg, #4d0a2b 0%, #1a0a4d 50%, #0a2d4d 100%)");
      setShowKiss(true);
      setTimeout(() => setShowKiss(false), 2500);
    } else if (lastMsg === "❤️") setMoodColor("radial-gradient(circle at center, #800a0a 0%, #3d0505 100%)");
    else if (lastMsg === "🫂") setMoodColor("radial-gradient(circle at center, #0a2480 0%, #050f3d 100%)");
    else if (lastMsg?.includes("❤️") && lastMsg?.includes("🫂")) setMoodColor("linear-gradient(135deg, #610a0a 0%, #0a1c61 100%)");
    else if (lastMsg === "😁") setMoodColor("#050505");
  }, [chatLog]);

  // 2. SOCKET LISTENERS
  useEffect(() => {
    socket.on('receive_message', (msg) => { setChatLog(prev => [...prev, msg]); });
    socket.on('message_deleted', (msgId) => {
      setChatLog(prev => prev.filter(m => m._id !== msgId && m.id !== msgId));
    });
    socket.on('display_typing', (data) => {
      if (data.userId !== currentUser?.id) setOtherUserTyping(data.typing);
    });
    return () => {
      socket.off('receive_message');
      socket.off('message_deleted');
      socket.off('display_typing');
    };
  }, [currentUser]);

  useEffect(() => {
    if (isUnlocked && currentUser) axios.get(`${API_BASE}/messages`).then(res => setChatLog(res.data));
  }, [isUnlocked, currentUser]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatLog, otherUserTyping]);

  // 3. HANDLERS
  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit('typing', { userId: currentUser.id, typing: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { userId: currentUser.id, typing: false });
    }, 2000);
  };

  const unsend = (msgId) => {
    socket.emit('delete_message', msgId);
    setSelectedMsg(null);
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
      socket.emit('send_message', { text: message, image: null, senderId: currentUser.id, senderName: currentUser.name });
      socket.emit('typing', { userId: currentUser.id, typing: false });
      setMessage("");
    }
  };

  return (
    <div style={styles.appViewport} onClick={() => setSelectedMsg(null)}>
      <AnimatePresence>
        {showKiss && (
          <motion.div key="kiss" initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.2, 5], opacity: [0, 1, 0] }} transition={{ duration: 2.2 }} style={styles.kissLayer}>
            <span style={{ fontSize: '120px' }}>💋</span>
          </motion.div>
        )}
      </AnimatePresence>

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
          <motion.div key="chat" style={styles.chatPage} onClick={() => {
            if (Date.now() - lastTap.current < 300) { setIsUnlocked(false); setCalcDisplay(""); }
            else lastTap.current = Date.now();
          }}>
            <motion.div style={{ ...styles.atmosphere, background: moodColor }} animate={{ background: moodColor }} transition={{ duration: 3 }} />

            <div style={styles.chatHeader}>
              <div style={{ display: 'flex', alignItems: 'center' }}><div style={styles.statusDot} /><span style={{ color: '#fff', fontWeight: 'bold' }}>VAULT</span></div>
              <button onClick={() => { setIsUnlocked(false); setCalcDisplay(""); }} style={styles.lockBtn}>EXIT</button>
            </div>
            
            <div style={styles.messageList}>
              {chatLog.map((m, i) => {
                const isMe = m.senderId === currentUser.id;
                const isSelected = selectedMsg === m._id;
                const isMood = ["❤️", "🫂", "😁", "💋"].some(e => m.text?.includes(e));
                return (
                  <div key={i} style={{ ...styles.msgRow, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                      <AnimatePresence>
                        {isMe && isSelected && (
                          <motion.button initial={{ scale: 0, x: 20 }} animate={{ scale: 1, x: 0 }} exit={{ scale: 0 }} onClick={() => unsend(m._id)} style={styles.unsendActionBtn}>Unsend</motion.button>
                        )}
                      </AnimatePresence>
                      <div 
                        onClick={(e) => { e.stopPropagation(); isMe && setSelectedMsg(m._id); }}
                        style={{ ...styles.bubble, backgroundColor: isMe ? 'rgba(138, 154, 142, 0.92)' : 'rgba(26, 26, 26, 0.92)', color: isMe ? '#000' : '#fff', border: isSelected ? '1px solid #fff' : '1px solid rgba(255,255,255,0.08)' }}
                      >
                        {m.text && <div style={{ wordBreak: 'break-word', fontSize: isMood ? '48px' : '15px' }}>{m.text}</div>}
                        <div style={{ fontSize: '10px', opacity: 0.5, marginTop: '6px', textAlign: 'right' }}>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} style={{ height: '10px' }} />
            </div>

            {otherUserTyping && <div style={styles.typingIndicator}>{currentUser.id === "9492" ? "Rahitha" : "Eusebio"} is typing...</div>}

            <div style={styles.inputArea}>
              <input style={styles.input} value={message} onChange={handleTyping} placeholder="Message..." onKeyPress={e => e.key === 'Enter' && sendText()} />
              <button onClick={sendText} style={styles.sendBtn}>➔</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;