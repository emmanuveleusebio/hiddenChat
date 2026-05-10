import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { styles } from '../../styles';

const MessageBubble = ({ m, i, currentUser, selectedMsg, handleMsgTap, unsend }) => {
  const isMe = m.senderId === currentUser.id;
  const isSelected = selectedMsg === m._id;
  const isMood = ["❤️", "🫂", "😁", "💋"].some(e => m.text?.includes(e));
  const hasReply = m.replyTo && (m.replyTo.text || m.replyTo.image);

  return (
    <div key={m._id || i} style={{ ...styles.msgRow, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        <AnimatePresence>
          {isMe && isSelected && (
            <motion.button 
              initial={{ scale: 0, x: 20 }} 
              animate={{ scale: 1, x: 0 }} 
              exit={{ scale: 0 }} 
              onClick={() => unsend(m._id)} 
              style={styles.unsendActionBtn}
            >
              Unsend
            </motion.button>
          )}
        </AnimatePresence>
        <div 
          onClick={(e) => handleMsgTap(e, m, isMe)} 
          style={{ 
            ...styles.bubble, 
            ...(isMe ? styles.myBubble : styles.theirBubble),
            userSelect: 'none', 
            WebkitUserSelect: 'none', 
            border: isSelected ? '1px solid #fff' : (isMe ? 'none' : styles.theirBubble.border) 
          }}
        >
          {hasReply && (
            <div style={{ 
              background: isMe ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)', 
              padding: '8px 10px', 
              borderRadius: '8px', 
              borderLeft: `4px solid ${isMe ? '#444' : '#8a9a8e'}`, 
              marginBottom: '8px', 
              fontSize: '12px', 
              backdropFilter: 'blur(5px)' 
            }}>
              <div style={{ fontWeight: 'bold', fontSize: '11px', color: isMe ? '#222' : '#8a9a8e', marginBottom: '2px' }}>
                {m.replyTo.senderName === currentUser.name ? "You" : m.replyTo.senderName}
              </div>
              <div style={{ opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
                {m.replyTo.text ? m.replyTo.text : "📷 Image"}
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
};

export default MessageBubble;
