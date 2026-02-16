export const styles = {
  appViewport: { 
    width: '100vw', 
    backgroundColor: '#000', 
    overflow: 'hidden', 
    display: 'flex', 
    flexDirection: 'column',
    position: 'relative'
  },
  // --- Calculator UI ---
  calcPage: { 
    height: '100%', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    flex: 1,
    background: 'radial-gradient(circle at center, #1a1a1a 0%, #000 100%)'
  },
  calcCard: { 
    width: '100%', 
    maxWidth: '400px', 
    padding: '20px',
    display: 'flex',
    flexDirection: 'column'
  },
  calcDisplay: { 
    fontSize: '70px', 
    color: '#8a9a8e', 
    textAlign: 'right', 
    padding: '40px 10px', 
    fontWeight: '200', 
    minHeight: '160px',
    wordBreak: 'break-all'
  },
  calcGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(4, 1fr)', 
    gap: '12px' 
  },
  calcBtn: { 
    aspectRatio: '1', 
    borderRadius: '18px', 
    border: 'none', 
    backgroundColor: '#111', 
    color: '#fff', 
    fontSize: '24px',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
  },
  opBtn: { backgroundColor: '#222', color: '#8a9a8e' },
  equalBtn: { backgroundColor: '#8a9a8e', color: '#000', fontWeight: 'bold' },

  // --- Chat UI ---
  chatPage: { 
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column', 
    backgroundColor: '#050505',
    overflow: 'hidden'
  },
  chatHeader: { 
    padding: '60px 24px 15px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderBottom: '1px solid #111', 
    backgroundColor: '#0a0a0a' 
  },
  statusDot: { 
    width: '8px', 
    height: '8px', 
    borderRadius: '50%', 
    backgroundColor: '#4ade80', 
    marginRight: '10px',
    boxShadow: '0 0 10px #4ade80'
  },
messageList: { 
    flex: 1, 
    padding: '20px', 
    /* 🔥 Added significant bottom padding so you can scroll past the last message */
    paddingBottom: '100px', 
    overflowY: 'auto', 
    display: 'flex', 
    flexDirection: 'column',
    /* Ensures smooth, momentum-based scrolling on iPhones */
    WebkitOverflowScrolling: 'touch',
    /* Hides scrollbar for a cleaner 'App' look */
    scrollbarWidth: 'none', 
    msOverflowStyle: 'none'
  },
  msgRow: { display: 'flex', marginBottom: '14px', width: '100%' },
  bubble: { 
    padding: '12px 18px', 
    borderRadius: '22px', 
    maxWidth: '80%', 
    fontSize: '16px',
    position: 'relative'
  },
  inputArea: { 
    padding: '15px 20px', 
    paddingBottom: 'calc(15px + env(safe-area-inset-bottom))', 
    display: 'flex', 
    gap: '12px', 
    backgroundColor: '#0a0a0a', 
    borderTop: '1px solid #111' 
  },
  input: { 
    flex: 1, 
    padding: '14px 20px', 
    borderRadius: '30px', 
    border: 'none', 
    backgroundColor: '#1a1a1a', 
    color: '#fff', 
    fontSize: '16px', /* Prevents iOS Zoom */
    outline: 'none' 
  },
  sendBtn: { 
    width: '48px', 
    height: '48px', 
    borderRadius: '50%', 
    border: 'none', 
    backgroundColor: '#8a9a8e', 
    color: '#000',
    fontSize: '20px'
  }
};