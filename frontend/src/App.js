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
      if (calcDisplay === SECRET_CODE) {
        setIsUnlocked(true);
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
      socket.emit('send_message', { text: message, sender: 'me' });
      setMessage("");
    }
  };

  return (
    <div style={styles.mainContainer}>
      <AnimatePresence mode="wait">
        {!isUnlocked ? (
          /* --- CALCULATOR PAGE --- */
          <motion.div 
            key="calculator-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ y: "-100vh", opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={styles.container}
          >
            <div style={styles.displayWrapper}>
              <motion.div 
                key={calcDisplay}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={styles.display}
              >
                {calcDisplay || "0"}
              </motion.div>
            </div>
            
            <div style={styles.grid}>
              {["C", "/", "*", "-", "7", "8", "9", "+", "4", "5", "6", "1", "2", "3", "0", ".", "="].map(btn => (
                <motion.button 
                  key={btn}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9, backgroundColor: "#4a5d4e" }}
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
            key="chat-page"
            initial={{ y: "100vh" }}
            animate={{ y: 0 }}
            exit={{ y: "100vh" }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            style={styles.chatWrapper}
          >
            <div style={styles.chatHeader}>
              <div style={{display: 'flex', alignItems: 'center'}}>
                <motion.div 
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={styles.onlineDot} 
                />
                <span style={{fontWeight: '600', color: '#f5f5f5', fontSize: '18px'}}>Vault</span>
              </div>
              <button onClick={lockApp} style={styles.exitBtn}>Done</button>
            </div>

            <div style={styles.messageList}>
              {chatLog.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={i} 
                  style={styles.msgBubble}
                >
                  {m.text}
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
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }} 
                onClick={sendMessage} 
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
  mainContainer: { height: '100dvh', backgroundColor: '#000', overflow: 'hidden' },
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: '0 20px 50px',
    backgroundColor: '#1c1c1c', // Charcoal
  },
  displayWrapper: { padding: '0 10px', marginBottom: '30px' },
  display: {
    fontSize: '85px',
    textAlign: 'right',
    fontWeight: '200',
    color: '#8a9a8e', // Sage
    fontFamily: 'sans-serif'
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' },
  btn: {
    aspectRatio: '1',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#333',
    color: '#fff',
    fontSize: '30px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  longBtn: { gridColumn: 'span 2', aspectRatio: 'auto', borderRadius: '50px', height: 'auto' },
  sageBtn: { backgroundColor: '#8a9a8e', color: '#1c1c1c' }, 
  darkBtn: { backgroundColor: '#2a2a2a', color: '#8a9a8e' },
  
  chatWrapper: { height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#121212' },
  chatHeader: { 
    padding: '60px 25px 20px', 
    backgroundColor: '#1c1c1c',
    display: 'flex', 
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #2a2a2a'
  },
  onlineDot: { width: '10px', height: '10px', backgroundColor: '#8a9a8e', borderRadius: '50%', marginRight: '10px' },
  exitBtn: { color: '#8a9a8e', background: 'none', border: 'none', fontWeight: 'bold', fontSize: '17px' },
  messageList: { flex: 1, padding: '25px', overflowY: 'auto' },
  msgBubble: { 
    backgroundColor: '#2a2a2a', 
    color: '#dae3dc',
    padding: '14px 20px', 
    borderRadius: '22px', 
    borderBottomLeftRadius: '4px',
    marginBottom: '15px', 
    maxWidth: '80%', 
    fontSize: '17px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.4)'
  },
  inputArea: { 
    padding: '20px 20px 50px', 
    backgroundColor: '#1c1c1c',
    display: 'flex',
    gap: '12px'
  },
  input: { 
    flex: 1, 
    padding: '16px 22px', 
    borderRadius: '30px', 
    border: 'none', 
    backgroundColor: '#2a2a2a', 
    color: '#fff', 
    fontSize: '17px',
    outline: 'none'
  },
  sendBtn: {
    backgroundColor: '#8a9a8e',
    border: 'none',
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    color: '#1c1c1c',
    fontSize: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};

export default App;