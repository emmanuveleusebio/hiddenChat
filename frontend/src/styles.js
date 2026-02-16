export const styles = {
  appViewport: { 
    width: '100vw', 
    backgroundColor: '#000', 
    overflow: 'hidden', 
    display: 'flex', 
    flexDirection: 'column',
    position: 'relative', // Changed from fixed
    top: 0,
    left: 0
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
  calcCard: { width: '100%', maxWidth: '400px', padding: '20px' },
  calcDisplay: { fontSize: '70px', color: '#8a9a8e', textAlign: 'right', padding: '40px 10px', minHeight: '160px' },
  calcGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' },
  calcBtn: { aspectRatio: '1', borderRadius: '18px', border: 'none', backgroundColor: '#111', color: '#fff', fontSize: '24px' },
  opBtn: { backgroundColor: '#222', color: '#8a9a8e' },
  equalBtn: { backgroundColor: '#8a9a8e', color: '#000', fontWeight: 'bold' },

  // --- Chat UI ---
  chatPage: { 
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column', 
    backgroundColor: '#050505',
    overflow: 'hidden',
    position: 'relative' // Ensure proper stacking
  },
  chatHeader: { 
    padding: '60px 24px 15px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderBottom: '1px solid #111', 
    backgroundColor: '#0a0a0a',
    zIndex: 10,
    flexShrink: 0 // Prevent header from shrinking
  },
  statusDot: { 
    width: '8px', height: '8px', borderRadius: '50%', 
    backgroundColor: '#4ade80', marginRight: '10px', boxShadow: '0 0 10px #4ade80' 
  },
  lockBtn: { background: 'none', border: 'none', color: '#8a9a8e', fontWeight: 'bold', fontSize: '16px' },
  messageList: { 
    flex: 1, 
    padding: '20px', 
    paddingBottom: '10px', // Reduced padding
    overflowY: 'auto', 
    overflowX: 'hidden',
    display: 'flex', 
    flexDirection: 'column',
    WebkitOverflowScrolling: 'touch',
    minHeight: 0 // Important: allows flex child to shrink below content size
  },
  msgRow: { display: 'flex', marginBottom: '14px', width: '100%' },
  bubble: { padding: '12px 18px', borderRadius: '22px', maxWidth: '85%', fontSize: '16px' },
  
  // 🔥 Fixed Input Area - sticks to bottom of viewport
  inputArea: { 
    padding: '10px 15px', 
    paddingBottom: 'max(10px, env(safe-area-inset-bottom))', // Respect safe area
    display: 'flex', 
    gap: '10px', 
    backgroundColor: '#0a0a0a', 
    borderTop: '1px solid #111', 
    alignItems: 'center',
    flexShrink: 0, // Prevent input area from shrinking
    zIndex: 10
  },
  imgBtn: { background: 'none', border: 'none', fontSize: '22px', color: '#fff', flexShrink: 0 },
  input: { 
    flex: 1, 
    padding: '12px 18px', 
    borderRadius: '25px', 
    border: 'none', 
    backgroundColor: '#1a1a1a', 
    color: '#fff', 
    fontSize: '16px', 
    outline: 'none',
    minWidth: 0 // Allows flex child to shrink
  },
  sendBtn: { 
    width: '45px', 
    height: '45px', 
    borderRadius: '50%', 
    border: 'none', 
    backgroundColor: '#8a9a8e',
    flexShrink: 0 
  },
  downloadLink: { 
    display: 'block', 
    fontSize: '11px', 
    textDecoration: 'none', 
    marginTop: '8px', 
    textAlign: 'center', 
    fontWeight: 'bold' 
  }
};