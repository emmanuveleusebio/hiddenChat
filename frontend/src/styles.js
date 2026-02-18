export const styles = {
  // 🔥 LOCK VIEWPORT: Prevents the "drag-down" white space bug
  appViewport: { 
    width: '100vw', 
    backgroundColor: '#000', 
    overflow: 'hidden', 
    display: 'flex', 
    flexDirection: 'column',
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    touchAction: 'none' 
  },

  // --- Calculator UI ---
  calcPage: { 
    height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1,
    background: 'radial-gradient(circle at center, #1a1a1a 0%, #000 100%)', zIndex: 20
  },
  calcCard: { width: '100%', maxWidth: '400px', padding: '20px' },
  calcDisplay: { fontSize: '70px', color: '#8a9a8e', textAlign: 'right', padding: '40px 10px', minHeight: '160px' },
  calcGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' },
  calcBtn: { aspectRatio: '1', borderRadius: '18px', border: 'none', backgroundColor: '#111', color: '#fff', fontSize: '24px' },
  equalBtn: { backgroundColor: '#8a9a8e', color: '#000', fontWeight: 'bold' },

  // --- Chat UI ---
  chatPage: { 
    height: '100%', display: 'flex', flexDirection: 'column', 
    backgroundColor: '#050505', overflow: 'hidden', position: 'relative' 
  },

  // 🔥 Atmosphere Layer (Z-INDEX: 1)
  atmosphere: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 1
  },

  chatHeader: { 
    padding: '60px 24px 15px', display: 'flex', justifyContent: 'space-between', 
    alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', 
    backgroundColor: 'rgba(10, 10, 10, 0.8)', backdropFilter: 'blur(10px)',
    zIndex: 10, flexShrink: 0 
  },

  statusDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ade80', marginRight: '10px' },
  lockBtn: { background: 'none', border: 'none', color: '#8a9a8e', fontWeight: 'bold', fontSize: '16px' },

  // 🔥 Content Layer (Z-INDEX: 5)
  messageList: { 
    flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', 
    flexDirection: 'column', WebkitOverflowScrolling: 'touch', zIndex: 5, 
    position: 'relative', touchAction: 'pan-y'
  },

  msgRow: { display: 'flex', marginBottom: '14px', width: '100%' },
  
  bubble: { 
    padding: '12px 18px', borderRadius: '22px', maxWidth: '85%', fontSize: '16px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)',
    position: 'relative', overflow: 'visible'
  },

  inputArea: { 
    padding: '12px 15px', display: 'flex', gap: '12px', 
    backgroundColor: 'rgba(10, 10, 10, 0.9)', borderTop: '1px solid #222', 
    alignItems: 'center', zIndex: 10, flexShrink: 0, backdropFilter: 'blur(10px)'
  },

  input: { 
    flex: 1, padding: '12px 18px', borderRadius: '15px', border: '1px solid #333', 
    backgroundColor: '#151515', color: '#fff', fontSize: '16px', outline: 'none',
    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
  },

  sendBtn: { 
    width: '45px', height: '45px', borderRadius: '50%', border: 'none', 
    backgroundColor: '#8a9a8e', color: '#000', display: 'flex', 
    alignItems: 'center', justifyContent: 'center', flexShrink: 0 
  },

  downloadLink: { 
    display: 'block', fontSize: '11px', textDecoration: 'none', 
    marginTop: '8px', textAlign: 'center', fontWeight: 'bold' 
  }
};