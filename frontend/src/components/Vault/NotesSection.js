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
           <div key={n._id} style={styles.noteCard}>
             <div style={styles.noteAccent} />
             <div style={{ color: '#eee', fontSize: '15px', lineHeight: '1.6' }}>{n.content}</div>
             <div style={{ color: '#666', fontSize: '10px', marginTop: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
               {new Date(n.timestamp).toLocaleDateString()}
             </div>
           </div>
         ))}
      </div>
    </motion.div>
  );
};

export default NotesSection;
