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
      else { setCalcDisplay("0"); }
    } else if (val === "C") {
      setCalcDisplay("");
    } else {
      setCalcDisplay(prev => prev.length < 10 ? prev + val : prev);
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
          <div style={{display: 'flex', alignItems: 'center'}}>
            <div style={styles.dot} />
            <span style={{fontWeight: '600'}}>Cloud Sync</span>
          </div>
          <button onClick={() => setIsUnlocked(false)} style={styles.exitBtn}>Done</button>
        </div>
        <div style={styles.messageList}>
          {chatLog.map((m, i) => (
            <div key={i} style={styles.msgBubble}>
              <p style={{margin: 0}}>{m.text}</p>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div style={styles.inputArea}>
          <input 
            style={styles.input} 
            value={message} 
            onChange={e => setMessage(e.target.value)}
            placeholder="Update..." 
            onKeyPress={e => e.key === 'Enter' && sendMessage()}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.displayWrapper}>
        <div style={styles.display}>{calcDisplay || "0"}</div>
      </div>
      <div style={styles.grid}>
        {["C", "/", "*", "-", "7", "8", "9", "+", "4", "5", "6", "1", "2", "3", "0", ".", "="].map(btn => (
          <button 
            key={btn} 
            onClick={() => handlePress(btn)}
            style={{
              ...styles.btn,
              ...(btn === "=" ? styles.orangeBtn : {}),
              ...(btn === "0" ? styles.longBtn : {}),
              ...(isNaN(btn) && btn !== "." ? styles.grayBtn : {})
            }}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: '100dvh',
    backgroundColor: '#000',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    paddingBottom: '30px',
    boxSizing: 'border-box',
    fontFamily: 'sans-serif'
  },
  displayWrapper: {
    padding: '0 30px',
    marginBottom: '10px'
  },
  display: {
    fontSize: '70px',
    textAlign: 'right',
    fontWeight: '300',
    overflow: 'hidden'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
    padding: '0 20px'
  },
  btn: {
    aspectRatio: '1',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#333',
    color: '#fff',
    fontSize: '24px',
    cursor: 'pointer',
    outline: 'none',
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
  orangeBtn: { backgroundColor: '#FF9F0A' },
  grayBtn: { backgroundColor: '#A5A5A5', color: '#000' },
  
  // Chat Styles
  chatWrapper: { height: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' },
  chatHeader: { padding: '40px 20px 15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' },
  dot: { width: '8px', height: '8px', backgroundColor: '#34C759', borderRadius: '50%', marginRight: '8px' },
  exitBtn: { color: '#007AFF', border: 'none', background: 'none', fontWeight: '600' },
  messageList: { flex: 1, padding: '20px', overflowY: 'auto' },
  msgBubble: { backgroundColor: '#E9E9EB', padding: '10px 15px', borderRadius: '18px', marginBottom: '8px', maxWidth: '80%', alignSelf: 'flex-start' },
  inputArea: { padding: '15px 20px 40px', borderTop: '1px solid #eee' },
  input: { width: '100%', padding: '12px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none', boxSizing: 'border-box' }
};

export default App;