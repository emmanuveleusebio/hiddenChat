import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { styles } from './styles';
import { requestForToken } from './firebase-config';

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
  const [replyingTo, setReplyingTo] = useState(null);

  const typingTimeoutRef = useRef(null);
  const chatEndRef = useRef(null);
  const lastTap = useRef(0);

  useEffect(() => {
    if (isUnlocked && currentUser) {
      console.log("Vault unlocked, requesting token...");
      requestForToken(currentUser.id, API_BASE);
    }
  }, [isUnlocked, currentUser]);

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

  // 2. FETCH & SEEN LOGIC
  const fetchMessages = () => axios.get(`${API_BASE}/messages`).then(res => setChatLog(res.data));
  const markAsSeen = (id) => axios.post(`${API_BASE}/seen`, { userId: id });

  // 3. SOCKET LISTENERS
  useEffect(() => {
    socket.on('receive_message', (msg) => {
      setChatLog(prev => [...prev, msg]);
      if (isUnlocked && currentUser && msg.senderId !== currentUser.id) markAsSeen(currentUser.id);
    });

    socket.on('message_deleted', (msgId) => {
      setChatLog(prev => prev.filter(m => m._id !== msgId && m.id !== msgId));
    });

    socket.on('display_typing', (data) => {
      if (data.userId !== currentUser?.id) setOtherUserTyping(data.typing);
    });

    socket.on('messages_seen', fetchMessages);

    return () => {
      socket.off('receive_message');
      socket.off('message_deleted');
      socket.off('display_typing');
      socket.off('messages_seen');
    };
  }, [isUnlocked, currentUser]);

  useEffect(() => {
    if (isUnlocked && currentUser) { fetchMessages(); markAsSeen(currentUser.id); }
  }, [isUnlocked, currentUser]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatLog, otherUserTyping]);

  // 4. HANDLERS
  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit('typing', { userId: currentUser.id, typing: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { userId: currentUser.id, typing: false });
    }, 2000);
  };

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
        socket.emit('send_message', { 
          text: "", 
          image: canvas.toDataURL('image/jpeg', 0.6), 
          senderId: currentUser.id, 
          senderName: currentUser.name,
          replyTo: replyingTo 
        });
        setReplyingTo(null);
        e.target.value = "";
      };
    };
  };

  const sendText = () => {
    if (message.trim()) {
      const payload = {
        text: message,
        image: null,
        senderId: currentUser.id,
        senderName: currentUser.name,
        replyTo: replyingTo
      };
      socket.emit('send_message', payload);
      socket.emit('typing', { userId: currentUser.id, typing: false });
      setMessage("");
      setReplyingTo(null);
    }
  };
console.log(replyingTo, '==============================================')
  const handlePress = (v) => {
    if (v === "=") {
      if (USERS[calcDisplay]) { setCurrentUser(USERS[calcDisplay]); setIsUnlocked(true); }
      else { try { setCalcDisplay(String(eval(calcDisplay))); } catch { setCalcDisplay("Error"); setTimeout(() => setCalcDisplay(""), 800); } }
    } else if (v === "C") setCalcDisplay("");
    else setCalcDisplay(p => p === "Error" ? v : p + v);
  };

  const unsend = (msgId) => {
    socket.emit('delete_message', msgId);
    setSelectedMsg(null);
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
                  <button key={btn} onClick={() => handlePress(btn)} style={{ ...styles.calcBtn, ...(btn === "=" ? styles.equalBtn : {}) }}>{btn}</button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="chat" style={styles.chatPage} onClick={() => {
            const now = Date.now();
            if (now - lastTap.current < 300) { setIsUnlocked(false); setCalcDisplay(""); }
            else lastTap.current = now;
          }}>
            <motion.div style={{ ...styles.atmosphere, background: moodColor }} animate={{ background: moodColor }} transition={{ duration: 3 }} />

            <div style={styles.chatHeader}>
              <div style={{ display: 'flex', alignItems: 'center' }}><div style={styles.statusDot} /><span style={{ color: '#fff', fontWeight: 'bold' }}>VAULT</span></div>
              <button onClick={(e) => { e.stopPropagation(); setIsUnlocked(false); setCalcDisplay(""); }} style={styles.lockBtn}>EXIT</button>
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
                        onClick={(e) => {
                          e.stopPropagation();
                          const now = Date.now();
                          if (now - lastTap.current < 300) {
                            setReplyingTo({ text: m.text, image: m.image, senderName: m.senderName });
                            setSelectedMsg(null);
                          } else {
                            if (isMe) setSelectedMsg(m._id);
                          }
                          lastTap.current = now;
                        }}
                        style={{
                          ...styles.bubble,
                          backgroundColor: isMe ? 'rgba(138, 154, 142, 0.92)' : 'rgba(26, 26, 26, 0.92)',
                          color: isMe ? '#000' : '#fff',
                          border: isSelected ? '1px solid #fff' : '1px solid rgba(255,255,255,0.08)'
                        }}
                      >
                        {m.replyTo && (
                          <div style={{
                            background: 'rgba(0,0,0,0.15)',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            borderLeft: `3px solid ${isMe ? '#000' : '#8a9a8e'}`,
                            marginBottom: '8px',
                            fontSize: '12px'
                          }}>
                            <div style={{ fontWeight: 'bold', fontSize: '11px', color: isMe ? '#444' : '#8a9a8e' }}>
                              {m.replyTo.senderName}
                            </div>
                            <div style={{ opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
                              {m.replyTo.text || "📷 Image"}
                            </div>
                          </div>
                        )}
                        
                        {m.image && <img src={m.image} alt="v" style={{ maxWidth: '100%', borderRadius: '12px', display: 'block', marginBottom: '8px' }} />}
                        {m.text && <div style={{ wordBreak: 'break-word', fontSize: isMood ? '48px' : '15px' }}>{m.text}</div>}

                        <div style={{ fontSize: '10px', opacity: 0.5, marginTop: '6px', textAlign: 'right' }}>
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isMe && <span style={{ marginLeft: '4px' }}>{m.seen ? "✓✓" : "✓"}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} style={{ height: '10px' }} />
            </div>

            {otherUserTyping && <div style={styles.typingIndicator}>{currentUser.id === "9492" ? "Rahitha" : "Eusebio"} is typing...</div>}

            <AnimatePresence>
              {replyingTo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    padding: '10px 15px',
                    background: 'rgba(30, 30, 30, 0.98)',
                    borderLeft: '4px solid #8a9a8e',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backdropFilter: 'blur(10px)',
                    position: 'relative',
                    zIndex: 10,
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                  }}>
                  <div style={{ fontSize: '12px', color: '#ccc', flex: 1 }}>
                    <div style={{ fontWeight: 'bold', color: '#8a9a8e' }}>Replying to {replyingTo.senderName}</div>
                    <div style={{ opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px' }}>
                      {replyingTo.text || "Image 📷"}
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setReplyingTo(null); }} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', marginLeft: '10px' }}>✕</button>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={styles.inputArea} onClick={(e) => e.stopPropagation()}>
              <input type="file" id="imgInput" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              <button onClick={() => document.getElementById('imgInput').click()} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>📷</button>
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