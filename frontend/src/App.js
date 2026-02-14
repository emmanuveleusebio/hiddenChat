import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io.connect('https://calcsocket.onrender.com');
const SECRET_CODE = "1234";

function App() {
  const [calcDisplay, setCalcDisplay] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isUnlocked) {
      axios.get('https://calcsocket.onrender.com/messages')
        .then(res => setChatLog(res.data))
        .catch(err => console.error("Could not load history", err));
    }
  }, [isUnlocked]);

  useEffect(() => {
    socket.on('receive_message', (newMessage) => {
      setChatLog((prev) => [...prev, newMessage]);
    });
    return () => socket.off('receive_message');
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  const handleCalcPress = (val) => {
    if (val === "=") {
      if (calcDisplay === SECRET_CODE) {
        setIsUnlocked(true);
      } else {
        setCalcDisplay("Error");
        setTimeout(() => setCalcDisplay(""), 800);
      }
    } else {
      setCalcDisplay(prev => (prev === "Error" ? val : prev + val));
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('send_message', { text: message, sender: 'me' });
      setMessage("");
    }
  };

  if (isUnlocked) {
    return (
      <div style={styles.chatWrapper}>
        <div style={styles.chatHeader}>
          <span style={styles.onlineDot}></span>
          <span style={styles.headerTitle}>Private Cloud</span>
          <button onClick={() => setIsUnlocked(false)} style={styles.lockBtn}>🔒</button>
        </div>
        
        <div style={styles.messageList}>
          {chatLog.map((m, i) => (
            <div key={i} style={styles.msgContainer}>
              <div style={styles.msgBubble}>
                <p style={styles.msgText}>{m.text}</p>
                <span style={styles.msgTime}>
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div style={styles.inputArea}>
          <input 
            style={styles.input}
            value={message}
            placeholder="Type a message..."
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage} style={styles.sendBtn}>➔</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.calcContainer}>
      <div style={styles.calcContent}>
        <div style={styles.displayArea}>
          <div style={styles.calcValue}>{calcDisplay || "0"}</div>
        </div>
        <div style={styles.keypad}>
          {["C", "/", "*", "7", "8", "9", "4", "5", "6", "1", "2", "3", "0", ".", "="].map(btn => (
            <button 
              key={btn} 
              onClick={() => btn === 'C' ? setCalcDisplay("") : handleCalcPress(btn)} 
              style={{
                ...styles.key,
                ...(btn === '=' ? styles.equalKey : {}),
                ...(btn === '0' ? styles.zeroKey : {}),
                ...(isNaN(btn) && btn !== '.' ? styles.operatorKey : {})
              }}
            >
              {btn}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  // --- Global ---
  calcContainer: {
    height: '100dvh', // Uses dynamic viewport height (better for mobile)
    backgroundColor: '#000',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  calcContent: {
    padding: '20px',
    maxWidth: '500px',
    width: '100%',
    margin: '0 auto',
  },
  displayArea: {
    padding: '20px',
    marginBottom: '20px',
  },
  calcValue: {
    color: '#fff',
    fontSize: 'clamp(40px, 15vw, 80px)', // Font shrinks if text is long
    textAlign: 'right',
    fontWeight: '300',
  },
  keypad: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)', // 3 columns looks more like a vault calc
    gap: '12px',
  },
  key: {
    aspectRatio: '1 / 1',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#333',
    color: '#fff',
    fontSize: '24px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.1s',
  },
  equalKey: { backgroundColor: '#FF9F0A' },
  operatorKey: { backgroundColor: '#A5A5A5', color: '#000' },
  zeroKey: { 
    gridColumn: 'span 2', 
    aspectRatio: 'auto', 
    borderRadius: '40px',
    height: '70px' 
  },

  // --- Chat View ---
  chatWrapper: {
    height: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#F2F2F7',
  },
  chatHeader: {
    padding: '15px 20px',
    backgroundColor: '#fff',
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid #E5E5EA',
    paddingTop: 'env(safe-area-inset-top)', // Support for iPhone notch
  },
  headerTitle: { flex: 1, fontWeight: '600', fontSize: '17px', marginLeft: '10px' },
  onlineDot: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#34C759' },
  lockBtn: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' },
  
  messageList: {
    flex: 1,
    padding: '15px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  msgContainer: {
    marginBottom: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  msgBubble: {
    backgroundColor: '#fff',
    padding: '10px 14px',
    borderRadius: '18px',
    borderBottomLeftRadius: '4px',
    maxWidth: '85%',
    boxShadow: '0 1px 1px rgba(0,0,0,0.05)',
  },
  msgText: { margin: 0, fontSize: '16px', color: '#000', lineHeight: '1.4' },
  msgTime: { fontSize: '11px', color: '#8E8E93', marginTop: '4px', display: 'block' },
  
  inputArea: {
    padding: '10px 15px',
    paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
    backgroundColor: '#fff',
    display: 'flex',
    alignItems: 'center',
    borderTop: '1px solid #E5E5EA',
  },
  input: {
    flex: 1,
    padding: '10px 16px',
    backgroundColor: '#F2F2F7',
    border: 'none',
    borderRadius: '20px',
    fontSize: '16px',
    outline: 'none',
  },
  sendBtn: {
    marginLeft: '12px',
    backgroundColor: '#007AFF',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
  }
};

export default App;