import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

// Connect to your Node.js server
const socket = io.connect('http://localhost:5000');
const SECRET_CODE = "1234"; // 👈 Set your secret code here!

function App() {
  const [calcDisplay, setCalcDisplay] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const chatEndRef = useRef(null);

  // 1. Fetch history from DB when unlocked
  useEffect(() => {
    if (isUnlocked) {
      axios.get('http://localhost:5000/messages')
        .then(res => setChatLog(res.data))
        .catch(err => console.error("Could not load history", err));
    }
  }, [isUnlocked]);

  // 2. Listen for live updates (No refresh needed)
  useEffect(() => {
    socket.on('receive_message', (newMessage) => {
      setChatLog((prev) => [...prev, newMessage]);
    });
  }, []);

  // 3. Auto-scroll to bottom
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
      setCalcDisplay(prev => prev + val);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('send_message', { text: message, sender: 'me' });
      setMessage("");
    }
  };

  // --- CHAT VIEW ---
  if (isUnlocked) {
    return (
      <div style={styles.chatContainer}>
        <div style={styles.header}>Secret Chat</div>
        <div style={styles.messageList}>
          {chatLog.map((m, i) => (
            <div key={i} style={styles.msgBubble}>
              <p style={styles.msgText}>{m.text}</p>
              <span style={styles.msgTime}>{new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div style={styles.inputArea}>
          <input 
            style={styles.input}
            value={message}
            placeholder="Write something..."
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage} style={styles.sendBtn}>➔</button>
        </div>
      </div>
    );
  }

  // --- CALCULATOR VIEW ---
  return (
    <div style={styles.calcWrapper}>
      <div style={styles.screen}>{calcDisplay || "0"}</div>
      <div style={styles.numPad}>
        {["7", "8", "9", "4", "5", "6", "1", "2", "3", "C", "0", "="].map(btn => (
          <button 
            key={btn} 
            onClick={() => btn === 'C' ? setCalcDisplay("") : handleCalcPress(btn)} 
            style={btn === '=' ? styles.equalBtn : styles.btn}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  calcWrapper: { height: '100vh', backgroundColor: '#000', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' },
  screen: { color: '#fff', fontSize: '80px', textAlign: 'right', marginBottom: '30px', fontWeight: '200' },
  numPad: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' },
  btn: { height: '80px', borderRadius: '40px', fontSize: '28px', border: 'none', backgroundColor: '#333', color: '#fff' },
  equalBtn: { height: '80px', borderRadius: '40px', fontSize: '28px', border: 'none', backgroundColor: '#f09433', color: '#fff' },
  chatContainer: { height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' },
  header: { padding: '15px', textAlign: 'center', fontWeight: '600', borderBottom: '1px solid #eee' },
  messageList: { flex: 1, padding: '15px', overflowY: 'auto' },
  msgBubble: { backgroundColor: '#f1f0f0', padding: '10px 15px', borderRadius: '18px', marginBottom: '10px', alignSelf: 'flex-start', maxWidth: '80%' },
  msgText: { margin: 0, fontSize: '16px' },
  msgTime: { fontSize: '10px', color: '#999' },
  inputArea: { padding: '15px', display: 'flex', alignItems: 'center', borderTop: '1px solid #eee' },
  input: { flex: 1, padding: '12px', borderRadius: '25px', border: '1px solid #ddd', outline: 'none' },
  sendBtn: { marginLeft: '10px', backgroundColor: '#007AFF', color: '#fff', border: 'none', borderRadius: '50%', width: '45px', height: '45px', fontSize: '20px' }
};

export default App;