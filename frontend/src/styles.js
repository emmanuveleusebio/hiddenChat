export const styles = {
  appViewport: { 
    width: '100vw', 
    height: '100dvh', 
    backgroundColor: '#000', 
    display: 'flex', 
    flexDirection: 'column',
    overflow: 'hidden',
    // 🔥 Stylish modern base font
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif'
  },

  // --- Calculator UI (Funny/Hacker Font) ---
  calcPage: { 
    height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1,
    background: 'radial-gradient(circle at center, #1a1a1a 0%, #000 100%)'
  },
  calcCard: { width: '100%', maxWidth: '400px', padding: '20px' },
  calcDisplay: { 
    fontSize: '75px', 
    color: '#8a9a8e', 
    textAlign: 'right', 
    padding: '40px 10px', 
    minHeight: '160px',
    // 🔥 Funny/Retro Hacker font
    fontFamily: '"Courier New", Courier, monospace',
    fontWeight: 'bold',
    letterSpacing: '-2px'
  },
  calcGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' },
  calcBtn: { 
    aspectRatio: '1', borderRadius: '22px', border: 'none', 
    backgroundColor: '#111', color: '#fff', fontSize: '26px',
    fontFamily: '"Courier New", Courier, monospace',
    fontWeight: '900'
  },
  equalBtn: { backgroundColor: '#8a9a8e', color: '#000' },

  // --- Chat UI (Sleek Stylish Font) ---
  chatPage: { 
    height: '100%', display: 'flex', flexDirection: 'column', 
    backgroundColor: '#050505', overflow: 'hidden', position: 'relative' 
  },
  atmosphere: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 },
  chatHeader: { 
    padding: '60px 24px 15px', display: 'flex', justifyContent: 'space-between', 
    alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', 
    backgroundColor: 'rgba(10, 10, 10, 0.8)', backdropFilter: 'blur(10px)',
    zIndex: 10, flexShrink: 0 
  },
  statusDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ade80', marginRight: '10px' },
  lockBtn: { 
    background: 'none', border: 'none', color: '#8a9a8e', 
    fontWeight: '900', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' 
  },

  messageList: { 
    flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', 
    flexDirection: 'column', WebkitOverflowScrolling: 'touch', zIndex: 5, position: 'relative'
  },
  msgRow: { display: 'flex', marginBottom: '16px', width: '100%' },
  bubble: { 
    padding: '14px 20px', borderRadius: '25px', maxWidth: '85%', 
    fontSize: '15px', lineHeight: '1.5',
    boxShadow: '0 8px 30px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)',
    position: 'relative', overflow: 'visible',
    // 🔥 Stylish, clean reading font
    fontFamily: 'Inter, -apple-system, sans-serif'
  },

  inputArea: { 
    padding: '15px 18px', display: 'flex', gap: '12px', 
    backgroundColor: 'rgba(10, 10, 10, 0.95)', borderTop: '1px solid #222', 
    alignItems: 'center', zIndex: 10, flexShrink: 0, backdropFilter: 'blur(20px)'
  },
  input: { 
    flex: 1, padding: '14px 22px', borderRadius: '18px', border: '1px solid #333', 
    backgroundColor: '#151515', color: '#fff', fontSize: '16px', outline: 'none',
    fontFamily: 'Inter, sans-serif'
  },
  sendBtn: { 
    width: '48px', height: '48px', borderRadius: '50%', border: 'none', 
    backgroundColor: '#8a9a8e', color: '#000', display: 'flex', 
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    fontSize: '20px'
  }
};