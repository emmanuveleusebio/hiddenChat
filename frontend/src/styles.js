export const styles = {
  // 🔥 Fixed to viewport to prevent "dragging down" into white space
  appViewport: { 
    width: '100vw', 
    backgroundColor: '#000', 
    overflow: 'hidden', 
    display: 'flex', 
    flexDirection: 'column',
    position: 'fixed', // Back to fixed to lock the screen
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },

  // --- Calculator UI ---
  calcPage: { 
    height: '100%', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    flex: 1,
    background: 'radial-gradient(circle at center, #1a1a1a 0%, #000 100%)',
    zIndex: 10
  },
  calcCard: { width: '100%', maxWidth: '400px', padding: '20px' },
  calcDisplay: { 
    fontSize: '70px', 
    color: '#8a9a8e', 
    textAlign: 'right', 
    padding: '40px 10px', 
    minHeight: '160px',
    fontFamily: 'monospace' 
  },
  calcGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' },
  calcBtn: { 
    aspectRatio: '1', 
    borderRadius: '18px', 
    border: 'none', 
    backgroundColor: '#111', 
    color: '#fff', 
    fontSize: '24px',
    boxShadow: '0 4px 0 #000'
  },
  opBtn: { backgroundColor: '#222', color: '#8a9a8e' },
  equalBtn: { backgroundColor: '#8a9a8e', color: '#000', fontWeight: 'bold' },

  // --- Chat UI ---
  chatPage: { 
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column', 
    backgroundColor: '#050505',
    overflow: 'hidden',
    position: 'relative' 
  },

  // 🔥 Atmosphere Layer: This sits behind everything and changes color
  atmosphere: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 1,
    transition: 'background 3s ease-in-out' // Fallback if framer-motion isn't used
  },

  chatHeader: { 
    padding: '60px 24px 15px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderBottom: '1px solid rgba(255,255,255,0.05)', 
    backgroundColor: 'rgba(10, 10, 10, 0.7)',
    backdropFilter: 'blur(15px)', // Glassmorphism
    zIndex: 10,
    flexShrink: 0 
  },

  statusDot: { 
    width: '8px', height: '8px', borderRadius: '50%', 
    backgroundColor: '#4ade80', marginRight: '10px', boxShadow: '0 0 10px #4ade80' 
  },

  lockBtn: { background: 'none', border: 'none', color: '#8a9a8e', fontWeight: 'bold', fontSize: '16px' },

  messageList: { 
    flex: 1, 
    padding: '20px', 
    overflowY: 'auto', 
    display: 'flex', 
    flexDirection: 'column',
    WebkitOverflowScrolling: 'touch',
    zIndex: 5,
    position: 'relative'
  },

  msgRow: { display: 'flex', marginBottom: '14px', width: '100%' },

  // 🔥 Updated Bubble with borders and deep shadows
  bubble: { 
    padding: '12px 18px', 
    borderRadius: '20px', 
    maxWidth: '85%', 
    fontSize: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)', // Soft border
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)', // Deep shadow
    position: 'relative',
    overflow: 'visible'
  },
  
  // 🔥 Updated Input Area
  inputArea: { 
    padding: '12px 15px', 
    display: 'flex', 
    gap: '12px', 
    backgroundColor: 'rgba(10, 10, 10, 0.9)', 
    borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
    alignItems: 'center',
    flexShrink: 0,
    zIndex: 10,
    backdropFilter: 'blur(10px)'
  },

  imgBtn: { background: 'none', border: 'none', fontSize: '22px', color: '#fff', flexShrink: 0 },

  // 🔥 Updated Input Box
  input: { 
    flex: 1, 
    padding: '12px 18px', 
    borderRadius: '15px', 
    border: '1px solid #333', // Noticeable border
    backgroundColor: '#151515', 
    color: '#fff', 
    fontSize: '16px', 
    outline: 'none',
    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
  },

  sendBtn: { 
    width: '45px', 
    height: '45px', 
    borderRadius: '50%', 
    border: 'none', 
    backgroundColor: '#8a9a8e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(138, 154, 142, 0.3)'
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