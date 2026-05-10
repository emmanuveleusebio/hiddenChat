import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { styles } from './styles';
import { requestForToken } from './firebase-config';
import VaultDisguise from './components/Vault/VaultDisguise';
import ChatWindow from './components/Chat/ChatWindow';
import NotesSection from './components/Vault/NotesSection';

const API_BASE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname === "::1") 
  ? "http://localhost:5000" 
  : "https://calcsocket.onrender.com";

console.log("🔗 Connecting to API at:", API_BASE);
const socket = io.connect(API_BASE);
const USERS = { "9492": { name: "Eusebio", id: "9492" }, "9746": { name: "Rahitha", id: "9746" } };

function App() {
  // --- State ---
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
  const [showBugPopup, setShowBugPopup] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [emojiRain, setEmojiRain] = useState(null);
  const [pingHeart, setPingHeart] = useState(false);
  const [isPartnerPresent, setIsPartnerPresent] = useState(false);

  // --- Refs ---
  const typingTimeoutRef = useRef(null);
  const chatEndRef = useRef(null);
  const pageLastTap = useRef(0);
  const pageTapCount = useRef(0);
  const msgLastTap = useRef({ id: null, time: 0 });
  const partnerId = currentUser?.id === "9492" ? "9746" : "9492";

  // --- Socket Effects ---
  useEffect(() => {
    if (isUnlocked && currentUser) {
      requestForToken(currentUser.id, API_BASE);
      socket.emit('user_active', currentUser.id); 
    }
  }, [isUnlocked, currentUser]);

  useEffect(() => {
    socket.on('receive_message', (msg) => {
      setChatLog(prev => [...prev, msg]);
      if (isUnlocked && currentUser && msg.senderId !== currentUser.id) markAsSeen(currentUser.id);
    });
    socket.on('presence_update', (users) => {
      const pId = currentUser?.id === "9492" ? "9746" : "9492";
      setIsPartnerPresent(users.includes(pId));
    });
    socket.on('receive_heart_ping', () => {
      setPingHeart(true);
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      setTimeout(() => setPingHeart(false), 2500);
    });
    socket.on('note_updated', fetchNotes);
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
      socket.off('presence_update');
      socket.off('receive_heart_ping');
      socket.off('note_updated');
    };
  }, [isUnlocked, currentUser]);

  // --- Fetching ---
  const fetchMessages = () => 
    axios.get(`${API_BASE}/messages`)
      .then(res => setChatLog(res.data))
      .catch(err => console.error("❌ Error fetching messages:", err));

  const fetchNotes = () => 
    axios.get(`${API_BASE}/notes`)
      .then(res => setNotes(res.data))
      .catch(err => console.error("❌ Error fetching notes:", err));

  const markAsSeen = (id) => 
    axios.post(`${API_BASE}/seen`, { userId: id })
      .catch(err => console.error("❌ Error marking seen:", err));

  useEffect(() => {
    if (isUnlocked && currentUser) { 
      fetchMessages(); 
      fetchNotes();
      markAsSeen(currentUser.id); 
    }
  }, [isUnlocked, currentUser]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatLog, otherUserTyping]);

  // --- Mood Logic ---
  useEffect(() => {
    if (chatLog.length === 0) return;
    const lastMsg = chatLog[chatLog.length - 1].text?.trim();
    if (lastMsg?.includes("🎈")) triggerRain("🎈");
    if (lastMsg?.includes("❄️")) triggerRain("❄️");
    if (lastMsg?.includes("✨")) triggerRain("✨");

    if ((lastMsg?.includes("🫂") && lastMsg?.includes("💋")) || (lastMsg?.includes("💋") && lastMsg?.includes("🫂"))) {
      setMoodColor("linear-gradient(135deg, #4d0a2b 0%, #1a0a4d 50%, #0a2d4d 100%)");
      setShowKiss(true);
      setTimeout(() => setShowKiss(false), 2500);
    } else if (lastMsg === "❤️") setMoodColor("radial-gradient(circle at center, #800a0a 0%, #3d0505 100%)");
    else if (lastMsg === "🫂") setMoodColor("radial-gradient(circle at center, #0a2480 0%, #050f3d 100%)");
    else if (lastMsg?.includes("❤️") && lastMsg?.includes("🫂")) setMoodColor("linear-gradient(135deg, #610a0a 0%, #0a1c61 100%)");
    else if (lastMsg === "😁") setMoodColor("#050505");
  }, [chatLog]);

  const triggerRain = (emoji) => {
    setEmojiRain(emoji);
    setTimeout(() => setEmojiRain(null), 4000);
  };

  // --- Handlers ---
  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit('typing', { userId: currentUser.id, typing: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { userId: currentUser.id, typing: false });
    }, 2000);
  };

  const sendHeartPing = () => {
    socket.emit('heart_ping', { from: currentUser.id });
    setPingHeart(true);
    setTimeout(() => setPingHeart(false), 2500);
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
        const replyData = replyingTo ? {
          text: replyingTo.text || "",
          image: replyingTo.image || null,
          senderName: replyingTo.senderName
        } : null;
        socket.emit('send_message', {
          text: "",
          image: canvas.toDataURL('image/jpeg', 0.6),
          senderId: currentUser.id,
          senderName: currentUser.name,
          replyTo: replyData
        });
        setReplyingTo(null);
        e.target.value = "";
      };
    };
  };

  const sendText = () => {
    if (message.trim()) {
      const currentReply = replyingTo ? {
        text: replyingTo.text || "",
        image: replyingTo.image || null,
        senderName: replyingTo.senderName || ""
      } : null;
      socket.emit('send_message', {
        text: message,
        image: null,
        senderId: currentUser.id,
        senderName: currentUser.name,
        replyTo: currentReply
      });
      setMessage("");
      setReplyingTo(null);
      socket.emit('typing', { userId: currentUser.id, typing: false });
    }
  };

  const saveNote = () => {
    if (!newNote.trim()) return;
    axios.post(`${API_BASE}/notes`, { content: newNote });
    setNewNote("");
  };

  const handleSearchTrigger = (e) => {
    if (e.key === 'Enter') {
      const code = calcDisplay.trim();
      if (USERS[code]) { 
        setCurrentUser(USERS[code]); 
        setIsUnlocked(true); 
      } else if (code === "1111") { 
        setIsNotesOpen(true); 
        setIsUnlocked(true); 
        setCurrentUser(USERS["9492"]); 
      } else {
        setShowBugPopup(true);
      }
    }
  };

  const unsend = (msgId) => {
    socket.emit('delete_message', msgId);
    setSelectedMsg(null);
  };

  const handlePageDoubleTap = () => {
    const now = Date.now();
    if (now - pageLastTap.current < 400) {
      pageTapCount.current += 1;
      // TRIPLE TAP = EXIT (Panic Feature)
      if (pageTapCount.current >= 2) {
        setIsUnlocked(false);
        setCalcDisplay("");
        pageTapCount.current = 0;
      }
    } else {
      pageTapCount.current = 1;
    }
    pageLastTap.current = now;
  };

  const handleMsgTap = (e, m, isMe) => {
    e.stopPropagation();
    const now = Date.now();
    const isSameMsg = msgLastTap.current.id === m._id;
    const isDoubleTap = isSameMsg && (now - msgLastTap.current.time < 300);
    if (isDoubleTap) {
      setReplyingTo({
        text: m.text || "",
        image: m.image || null,
        senderName: isMe ? "You" : m.senderName
      });
      setSelectedMsg(null);
      msgLastTap.current = { id: null, time: 0 };
    } else {
      if (isMe) setSelectedMsg(m._id);
      msgLastTap.current = { id: m._id, time: now };
    }
  };

  // --- Render ---
  return (
    <div style={{ ...styles.appViewport, overflow: 'hidden' }} onClick={() => setSelectedMsg(null)}>
      {isUnlocked && isPartnerPresent && (
        <motion.div 
          animate={{ 
            opacity: [0.1, 0.3, 0.1], 
            boxShadow: [
              'inset 0 0 50px rgba(196, 164, 132, 0.2)', 
              'inset 0 0 100px rgba(196, 164, 132, 0.4)', 
              'inset 0 0 50px rgba(196, 164, 132, 0.2)'
            ] 
          }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99 }}
        />
      )}
      
      {showBugPopup && (
        <div style={styles.popupOverlay} onClick={() => setShowBugPopup(false)}>
          <motion.div initial={{scale: 0.8, opacity: 0}} animate={{scale: 1, opacity: 1}} style={styles.popupContent} onClick={e => e.stopPropagation()}>
            <div style={styles.popupText}>
              <strong>Network Error [502]</strong><br/>
              The search service is currently undergoing maintenance. Our team is working to fix this bug. Please try again later.
            </div>
            <button style={styles.popupBtn} onClick={() => setShowBugPopup(false)}>OK</button>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {emojiRain && [...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -50, x: Math.random() * window.innerWidth, opacity: 1, rotate: 0 }}
            animate={{ y: window.innerHeight + 50, opacity: 0, rotate: 360 }}
            transition={{ duration: 3 + Math.random() * 2, ease: "linear" }}
            style={{ position: 'fixed', zIndex: 1000, fontSize: '30px' }}
          >
            {emojiRain}
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {(showKiss || pingHeart) && (
          <motion.div key="kiss" initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.2, 5], opacity: [0, 1, 0] }} transition={{ duration: 2.2 }} style={styles.kissLayer}>
            <span style={{ fontSize: '120px' }}>{showKiss ? '💋' : '❤️'}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!isUnlocked ? (
          <VaultDisguise 
            calcDisplay={calcDisplay} 
            setCalcDisplay={setCalcDisplay} 
            handleSearchTrigger={handleSearchTrigger} 
            setShowBugPopup={setShowBugPopup} 
          />
        ) : isNotesOpen ? (
          <NotesSection 
            notes={notes} 
            newNote={newNote} 
            setNewNote={setNewNote} 
            saveNote={saveNote} 
            setIsNotesOpen={setIsNotesOpen} 
          />
        ) : (
          <ChatWindow 
            chatLog={chatLog}
            currentUser={currentUser}
            partnerId={partnerId}
            isPartnerPresent={isPartnerPresent}
            moodColor={moodColor}
            handlePageDoubleTap={handlePageDoubleTap}
            sendHeartPing={sendHeartPing}
            setIsUnlocked={setIsUnlocked}
            setCalcDisplay={setCalcDisplay}
            selectedMsg={selectedMsg}
            handleMsgTap={handleMsgTap}
            unsend={unsend}
            otherUserTyping={otherUserTyping}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            message={message}
            handleTyping={handleTyping}
            sendText={sendText}
            handleImageUpload={handleImageUpload}
            chatEndRef={chatEndRef}
            socket={socket}
          />
        )}
      </AnimatePresence>
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
}

export default App;