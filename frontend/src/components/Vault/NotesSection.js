import React from 'react';
import { motion } from 'framer-motion';
import { styles } from '../../styles';

const NotesSection = ({ notes, newNote, setNewNote, saveNote, setIsNotesOpen }) => {
  return (
    <motion.div key="notes" style={styles.chatPage}>
      <div style={styles.chatHeader}>
         <span style={{ color: '#fff', fontWeight: 'bold' }}>SHARED SECRETS</span>
         <button onClick={() => setIsNotesOpen(false)} style={styles.lockBtn}>BACK</button>
      </div>
      <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
         <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
           <input 
             style={{ ...styles.input, flex: 1 }} 
             placeholder="Secret note..." 
             value={newNote} 
             onChange={(e) => setNewNote(e.target.value)} 
           />
           <button onClick={saveNote} style={styles.sendBtn}>+</button>
         </div>
         {notes.map((n) => (
           <div key={n._id} style={{ 
             background: 'rgba(255,255,255,0.05)', 
             padding: '15px', 
             borderRadius: '12px', 
             marginBottom: '10px', 
             borderLeft: '3px solid #8a9a8e' 
           }}>
             <div style={{ color: '#eee' }}>{n.content}</div>
           </div>
         ))}
      </div>
    </motion.div>
  );
};

export default NotesSection;
