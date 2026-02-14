import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const socket = io.connect('https://calcsocket.onrender.com');
const SECRET_CODE = "1234";

function App() {
  const [calcDisplay, setCalcDisplay] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const chatEndRef = useRef(null);

  // Lock logic: Reset everything on exit
  const lockApp = () => {
    setIsUnlocked(false);
    setCalcDisplay("");
  };

  useEffect(() => {
    if (isUnlocked) {
      axios.get('https://calcsocket.onrender.com/messages')
        .then(res => setChatLog(res.data))
        .catch(err => console.error(err));
    }
  }, [isUnlocked]);

  useEffect(() => {
    socket.on('receive_message', (msg) => setChatLog(prev => [...prev, msg]));
    return () => socket.off('receive_message');
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  const handlePress = (val) => {
    if (val === "=") {
      if (calcDisplay === SECRET_CODE) setIsUnlocked(true);
      else {
        setCalcDisplay("Error");
        setTimeout(() => setCalcDisplay(""), 800);
      }
    } else if (val === "C") {
      setCalcDisplay("");
    } else {
      if (calcDisplay.length < 8) setCalcDisplay(prev => prev + val);
    }
  };

  return (
    <div style={styles.mainContainer}>
      <AnimatePresence mode="wait">
        {!isUnlocked ? (
          /* --- CALCULATOR PAGE --- */
          <motion.div 
            key="calc"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={styles.container}
          >
            <div style={styles.displayWrapper}>
              <motion.div 
                key={calcDisplay}
                initial={{ scale: 0.9, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                style={styles.display}
              >
                {calcDisplay || "0"}
              </motion.div>
            </div>
            <div style={styles.grid}>
              {["C", "/", "*", "-", "7", "8", "9", "+", "4", "5", "6", "1", "2", "3", "0", ".", "="].map(btn => (
                <motion.button 
                  whileTap={{ scale: 0.9, backgroundColor: "#4a5d4e" }}
                  key={btn} 
                  onClick={() => handlePress(btn)}
                  style={{
                    ...styles.btn,
                    ...(btn === "=" ? styles.sageBtn : {}),
                    ...(btn === "0" ? styles.longBtn : {}),
                    ...(isNaN(btn) && btn !== "." ? styles.darkBtn : {})
                  }}
                >
                  {btn}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          /* --- CHAT PAGE --- */
          <motion.div 
            key="chat"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            style={styles.chatWrapper}
          >
            <div style={styles.chatHeader}>
              <div style={{display: 'flex', alignItems: 'center'}}>
                <div style={styles.onlineDot} />
                <span style={{fontWeight: '600', color: '#f5f5f5'}}>Vault Messenger</span>
              </div>
              <button onClick={lockApp} style={styles.exitBtn}>Done</button>
            </div>

            <div style={styles.messageList}>
              {chatLog.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  style={styles.msgBubble}
                >
                  <p style={{margin: 0}}>{m.text}</p>
                </motion.div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div style={styles.inputArea}>
              <input 
                style={styles.input} 
                value={message} 
                onChange={e => setMessage(e.target.value)}
                placeholder="Message..." 
                onKeyPress={e => e.key === 'Enter' && sendMessage()}
              />
              <motion.button 
                whileTap={{ scale: 0.9 }} 
                onClick={() => {
                  if (message.trim()) {
                    socket.emit('send_message', { text: message, sender: 'me' });
                    setMessage("");
                  }
                }} 
                style={styles.sendBtn}
              >
                ➔
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  mainContainer: {
    height: '100dvh',
    backgroundColor: '#000',
    overflow: 'hidden'
  },
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: '0 20px 40px',
    boxSizing: 'border-box',
    backgroundColor: '#1c1c1c', // Charcoal black
  },
  displayWrapper: {
    padding: '0 10px',
    marginBottom: '20px'
  },
  display: {
    fontSize: '80px',
    textAlign: 'right',
    fontWeight: '200',
    color: '#dae3dc', // Very light sage
    fontFamily: 'Helvetica, Arial, sans-serif'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '14px',
  },
  btn: {
    aspectRatio: '1',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#333',
    color: '#fff',
    fontSize: '28px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  longBtn: {
    gridColumn: 'span 2',
    aspectRatio: 'auto',
    borderRadius: '50px',
    height: 'auto'
  },
  sageBtn: { backgroundColor: '#8a9a8e', color: '#1c1c1c' }, // Sage iPhone color
  darkBtn: { backgroundColor: '#2a2a2a', color: '#8a9a8e' },
  
  // Chat Styles
  chatWrapper: { 
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column', 
    backgroundColor: '#121212' // Deep black for chat
  },
  chatHeader: { 
    padding: '50px 20px 15px', 
    backgroundColor: '#1c1c1c',
    display: 'flex', 
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #2a2a2a'
  },
  onlineDot: { width: '8px', height: '8px', backgroundColor: '#8a9a8e', borderRadius: '50%', marginRight: '10px' },
  exitBtn: { color: '#8a9a8e', border: 'none', background: 'none', fontWeight: '600', fontSize: '16px' },
  
  messageList: { 
    flex: 1, 
    padding: '20px', 
    overflowY: 'auto',
    background: 'linear-gradient(to bottom, #121212, #1c1c1c)' 
  },
  msgBubble: { 
    backgroundColor: '#2a2a2a', 
    color: '#dae3dc',
    padding: '12px 18px', 
    borderRadius: '20px', 
    borderBottomLeftRadius: '4px',
    marginBottom: '12px', 
    maxWidth: '75%', 
    fontSize: '16px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
  },
  inputArea: { 
    padding: '15px 20px 40px', 
    backgroundColor: '#1c1c1c',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  input: { 
    flex: 1, 
    padding: '14px 20px', 
    borderRadius: '25px', 
    border: 'none', 
    backgroundColor: '#2a2a2a', 
    color: '#fff', 
    outline: 'none',
    fontSize: '16px'
  },
  sendBtn: {
    backgroundColor: '#8a9a8e',
    border: 'none',
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    color: '#1c1c1c',
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};

export default App;