import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { styles } from './styles';

// 🔥 IMPORTANT: Change '192.168.1.15' to your ACTUAL Laptop IP from 'ipconfig'
const LAPTOP_IP = "192.168.1.15"; 
const API_BASE = window.location.hostname === "localhost" ? `http://${LAPTOP_IP}:5000` : "https://your-production.com";
const socket = io.connect(API_BASE);

const USERS = { "9492": { name: "Eusebio", id: "9492" }, "9746": { name: "Rahitha", id: "9746" } };

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

const FloatingHearts = () => (
  <div style={{ position: 'absolute', top: 0, left: '50%', pointerEvents: 'none', zIndex: 5 }}>
    {[...Array(6)].map((_, i) => (
      <motion.span key={i} initial={{ y: 0, opacity: 1, scale: 0.5 }}
        animate={{ y: -120 - Math.random() * 60, x: (Math.random() - 0.5) * 50, opacity: 0, scale: 1.5 }}
        transition={{ duration: 1.8, delay: i * 0.1, ease: "easeOut" }}
        style={{ position: 'absolute', fontSize: '24px' }}>❤️</motion.span>
    ))}
  </div>
);

function App() {
  const [calcDisplay, setCalcDisplay] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [vh, setVh] = useState('100dvh');
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const chatEndRef = useRef(null);
  const lastTap = useRef(0);

  useEffect(() => {
    const updateViewport = () => {
      if (window.visualViewport) {
        setVh(`${window.visualViewport.height}px`);
        setKeyboardOpen(window.visualViewport.height < window.innerHeight * 0.85);
        if (window.visualViewport.height < window.innerHeight) {
          setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 150);
        }
      }
    };
    window.visualViewport?.addEventListener('resize', updateViewport);
    updateViewport();
    return () => window.visualViewport?.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    if (isUnlocked) {
      (async () => {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js');
          const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array('BCa8ewu1Ijm208I2oCUPuDppfrUIAcbKIam1zZWtrtY0rdELTpka-CT_Dqe2kUCy808DhyGPjGYjlCPPh2eYhWs')
          });
          await axios.post(`${API_BASE}/subscribe`, sub);
        } catch (e) { console.warn(e); }
      })();
    }
  }, [isUnlocked]);

  const fetchMessages = () => axios.get(`${API_BASE}/messages`).then(res => setChatLog(res.data));

  useEffect(() => {
    socket.on('receive_message', (msg) => {
      setChatLog(prev => [...prev, msg]);
      if (isUnlocked && currentUser && msg.senderId !== currentUser.id) axios.post(`${API_BASE}/seen`, { userId: currentUser.id });
    });
    socket.on('messages_seen', fetchMessages);
    return () => { socket.off('receive_message'); socket.off('messages_seen'); };
  }, [isUnlocked, currentUser]);

  useEffect(() => {
    if (isUnlocked && currentUser) { fetchMessages(); axios.post(`${API_BASE}/seen`, { userId: currentUser.id }); }
  }, [isUnlocked, currentUser]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatLog]);

  const handlePress = (v) => {
    if (v === "=") {
      if (USERS[calcDisplay]) { setCurrentUser(USERS[calcDisplay]); setIsUnlocked(true); }
      else { try { setCalcDisplay(String(eval(calcDisplay))); } catch { setCalcDisplay("Error"); setTimeout(() => setCalcDisplay(""), 800); } }
    } else if (v === "C") setCalcDisplay("");
    else setCalcDisplay(p => p === "Error" ? v : p + v);
  };

  const send = () => {
    if (message.trim()) {
      socket.emit('send_message', { text: message, image: null, senderId: currentUser.id, senderName: currentUser.name });
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
                  <button key={btn} onClick={() => handlePress(btn)} style={{...styles.calcBtn, ...(btn === "=" ? styles.equalBtn : {}), ...(isNaN(btn) && btn !== "." ? styles.opBtn : {})}}>{btn}</button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="chat" initial={{ y: "100%" }} animate={{ y: 0 }} style={styles.chatPage} onClick={() => {
            if (Date.now() - lastTap.current < 300) { setIsUnlocked(false); setCalcDisplay(""); }
            else lastTap.current = Date.now();
          }}>
            <div style={styles.chatHeader}>
              <div style={{ display: 'flex', alignItems: 'center' }}><div style={styles.statusDot} /><span style={{ color: '#fff' }}>Vault</span></div>
              <button onClick={() => setIsUnlocked(false)} style={styles.lockBtn}>Done</button>
            </div>
            <div style={styles.messageList}>
              {chatLog.map((m, i) => {
                const isMe = m.senderId === currentUser.id;
                const isLove = m.text?.trim() === "❤️";
                return (
                  <div key={i} style={{ ...styles.msgRow, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{ ...styles.bubble, backgroundColor: isMe ? '#8a9a8e' : '#1a1a1a', color: isMe ? '#000' : '#fff' }}>
                      {isLove && <FloatingHearts />}
                      {m.image && <><img src={m.image} alt="v" style={{ maxWidth: '100%', borderRadius: '12px' }} /><a href={m.image} download style={{ ...styles.downloadLink, color: isMe ? '#000' : '#8a9a8e' }}>Download</a></>}
                      {m.text && <div style={{ fontSize: isLove ? '45px' : '16px' }}>{m.text}</div>}
                      <div style={{ fontSize: '10px', opacity: 0.5 }}>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{isMe && (m.seen ? " ✓✓" : " ✓")}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            <div style={{ ...styles.inputArea, paddingBottom: keyboardOpen ? '10px' : 'calc(10px + env(safe-area-inset-bottom))' }} onClick={e => e.stopPropagation()}>
              <button onClick={() => document.getElementById('imgInput').click()} style={styles.imgBtn}>📷</button>
              <input type="file" id="imgInput" hidden onChange={(e) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (ev) => {
                  const img = new Image(); img.src = ev.target.result;
                  img.onload = () => {
                    const canv = document.createElement('canvas'); const ctx = canv.getContext('2d');
                    canv.width = 800; canv.height = img.height * (800 / img.width);
                    ctx.drawImage(img, 0, 0, canv.width, canv.height);
                    socket.emit('send_message', { text: "", image: canv.toDataURL('image/jpeg', 0.6), senderId: currentUser.id, senderName: currentUser.name });
                  };
                };
              }} />
              <input style={styles.input} value={message} onChange={e => setMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && send()} />
              <button onClick={send} style={styles.sendBtn}>➔</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;