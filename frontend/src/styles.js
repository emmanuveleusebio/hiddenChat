export const styles = {
  // 🔥 THE LOCK: This prevents the browser from shifting the page up
  appViewport: { 
    width: '100vw', 
    backgroundColor: '#000', 
    overflow: 'hidden', 
    display: 'flex', 
    flexDirection: 'column',
    position: 'fixed', // Mandatory
    top: 0, left: 0, right: 0, bottom: 0,
    overscrollBehavior: 'none'
  },
  // ... Calculator styles remain the same ...
  calcPage: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, zIndex: 20 },
  calcCard: { width: '100%', maxWidth: '400px', padding: '20px' },
  calcDisplay: { fontSize: '70px', color: '#8a9a8e', textAlign: 'right', padding: '40px 10px' },
  calcGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' },
  calcBtn: { aspectRatio: '1', borderRadius: '18px', border: 'none', backgroundColor: '#111', color: '#fff', fontSize: '24px' },
  equalBtn: { backgroundColor: '#8a9a8e', color: '#000', fontWeight: 'bold' },

  chatPage: { 
    height: '100%', display: 'flex', flexDirection: 'column', 
    backgroundColor: '#050505', overflow: 'hidden', position: 'relative' 
  },
  atmosphere: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 },
  
  chatHeader: { 
    padding: '60px 24px 15px', display: 'flex', justifyContent: 'space-between', 
    alignItems: 'center', borderBottom: '1px solid #111', backgroundColor: '#0a0a0a',
    zIndex: 10, flexShrink: 0 
  },
  
  messageList: { 
    flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', 
    flexDirection: 'column', zIndex: 5, position: 'relative',
    WebkitOverflowScrolling: 'touch'
  },

  // 🔥 THE ANCHOR: This stays at the bottom of the VISIBLE screen
  inputArea: { 
    padding: '12px 15px', display: 'flex', gap: '10px', 
    backgroundColor: '#0a0a0a', borderTop: '1px solid #222', 
    alignItems: 'center', zIndex: 10, flexShrink: 0 
  },
  input: { 
    flex: 1, padding: '12px 18px', borderRadius: '25px', border: 'none', 
    backgroundColor: '#1a1a1a', color: '#fff', fontSize: '16px', outline: 'none' 
  },
  sendBtn: { width: '45px', height: '45px', borderRadius: '50%', border: 'none', backgroundColor: '#8a9a8e' },
  msgRow: { display: 'flex', marginBottom: '14px', width: '100%' },
  bubble: { padding: '12px 18px', borderRadius: '22px', maxWidth: '85%' },
  statusDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ade80', marginRight: '10px' },
  lockBtn: { background: 'none', border: 'none', color: '#8a9a8e', fontWeight: 'bold' }
};