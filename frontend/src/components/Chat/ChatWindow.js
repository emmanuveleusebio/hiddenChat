import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { styles } from '../../styles';
import VoiceCall from '../../VoiceCall';
import MessageBubble from './MessageBubble';

const ChatWindow = ({ 
  chatLog, currentUser, partnerId, isPartnerPresent, moodColor, 
  handlePageDoubleTap, sendHeartPing, setIsUnlocked, setCalcDisplay,
  selectedMsg, handleMsgTap, unsend, otherUserTyping, replyingTo, 
  setReplyingTo, message, handleTyping, sendText, handleImageUpload,
  chatEndRef, socket
}) => {
  return (
    <motion.div key="chat" style={styles.chatPage} onClick={handlePageDoubleTap}>
      <motion.div style={{ ...styles.atmosphere, background: moodColor }} animate={{ background: moodColor }} transition={{ duration: 3 }} />
      <div style={styles.chatHeader}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ ...styles.statusDot, background: isPartnerPresent ? '#4caf50' : '#555' }} />
          <span style={{ color: '#fff', fontWeight: 'bold' }}>VAULT</span>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <VoiceCall 
            socket={socket} 
            currentUser={currentUser} 
            partnerId={partnerId} 
          />
          <button onClick={sendHeartPing} style={{ background: 'none', border: 'none', fontSize: '18px' }}>💖</button>
          <button onClick={(e) => { e.stopPropagation(); setIsUnlocked(false); setCalcDisplay(""); }} style={styles.lockBtn}>EXIT</button>
        </div>
      </div>
      
      <div style={styles.messageList}>
        {chatLog.map((m, i) => (
          <MessageBubble 
            key={m._id || i}
            m={m} i={i} 
            currentUser={currentUser} 
            selectedMsg={selectedMsg} 
            handleMsgTap={handleMsgTap} 
            unsend={unsend} 
          />
        ))}
        <div ref={chatEndRef} style={{ height: '10px' }} />
      </div>

      {otherUserTyping && <div style={styles.typingIndicator}>{currentUser.id === "9492" ? "Rahitha" : "Eusebio"} is typing...</div>}
      
      <AnimatePresence>
        {replyingTo && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ padding: '10px 15px', background: 'rgba(30, 30, 30, 0.98)', borderLeft: '4px solid #8a9a8e', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(10px)', position: 'relative', zIndex: 10, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '12px', color: '#ccc', flex: 1 }}>
              <div style={{ fontWeight: 'bold', color: '#8a9a8e' }}>Replying to {replyingTo.senderName}</div>
              <div style={{ opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px' }}>{replyingTo.text || "Image 📷"}</div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setReplyingTo(null); }} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px' }}>✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={styles.inputArea} onClick={(e) => e.stopPropagation()}>
        <input type="file" id="imgInput" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
        <button onClick={() => document.getElementById('imgInput').click()} style={{ background: 'none', border: 'none', fontSize: '20px' }}>📷</button>
        <input style={styles.input} value={message} onChange={handleTyping} placeholder="Message..." onKeyPress={e => e.key === 'Enter' && sendText()} />
        <button onClick={sendText} style={styles.sendBtn}>➔</button>
      </div>
    </motion.div>
  );
};

export default ChatWindow;
