export const styles = {
  // 🔥 BASE VIEWPORT: Standard mobile lock to prevent white space bounce
  appViewport: { 
    width: '100vw', 
    height: '100dvh', 
    backgroundColor: '#000', 
    display: 'flex', 
    flexDirection: 'column', 
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif',
    position: 'relative'
  },

  // --- Calculator UI (Retro Hacker Style) ---
  calcPage: { 
    height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1,
    background: 'radial-gradient(circle at center, #1a1a1a 0%, #000 100%)', zIndex: 20
  },
  calcCard: { width: '100%', maxWidth: '400px', padding: '20px' },
  calcDisplay: { 
    fontSize: '75px', color: '#8a9a8e', textAlign: 'right', padding: '40px 10px', minHeight: '160px',
    fontFamily: '"Courier New", Courier, monospace', fontWeight: 'bold', letterSpacing: '-2px'
  },
  calcGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' },
  calcBtn: { 
    aspectRatio: '1', borderRadius: '22px', border: 'none', backgroundColor: '#111', 
    color: '#fff', fontSize: '26px', fontFamily: '"Courier New", Courier, monospace', fontWeight: '900'
  },
  equalBtn: { backgroundColor: '#8a9a8e', color: '#000' },

  // --- Chat UI (Masterpiece Atmosphere) ---
  chatPage: { 
    height: '100%', display: 'flex', flexDirection: 'column', 
    backgroundColor: '#050505', overflow: 'hidden', position: 'relative' 
  },

  // 🔥 Atmosphere Layer: Z-Index 1 (Behind everything)
  atmosphere: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 },

  // 🔥 Kiss Animation Layer: Z-Index 100 (Front of everything)
  kissLayer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 100, pointerEvents: 'none'
  },

  chatHeader: { 
    padding: '60px 24px 15px', display: 'flex', justifyContent: 'space-between', 
    alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', 
    backgroundColor: 'rgba(10, 10, 10, 0.8)', backdropFilter: 'blur(10px)',
    zIndex: 10, flexShrink: 0 
  },

  statusDot: { 
    width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ade80', 
    marginRight: '10px', boxShadow: '0 0 10px #4ade80' 
  },

  lockBtn: { 
    background: 'none', border: 'none', color: '#8a9a8e', 
    fontWeight: '900', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' 
  },

  messageList: { 
    flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', 
    flexDirection: 'column', WebkitOverflowScrolling: 'touch', zIndex: 5, position: 'relative'
  },

  msgRow: { display: 'flex', marginBottom: '16px', width: '100%' },

  // 🔥 ONE-TAP UNSEND BUTTON
  unsendActionBtn: {
    backgroundColor: '#ff4d4d',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '8px 14px',
    fontSize: '11px',
    fontWeight: '900',
    marginRight: '10px',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(255,77,77,0.3)',
    zIndex: 20,
    textTransform: 'uppercase'
  },

  bubble: { 
    padding: '14px 20px', borderRadius: '25px', maxWidth: '85%', fontSize: '15px', lineHeight: '1.5',
    boxShadow: '0 8px 30px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)',
    position: 'relative', overflow: 'visible', fontFamily: 'Inter, -apple-system, sans-serif'
  },

  // 🔥 TYPING INDICATOR (Subtle Fade In)
  typingIndicator: {
    padding: '8px 24px',
    fontSize: '13px',
    color: '#8a9a8e',
    fontStyle: 'italic',
    zIndex: 10,
    backgroundColor: 'transparent',
    fontWeight: '500',
    letterSpacing: '0.5px'
  },

  inputArea: { 
    padding: '15px 18px', display: 'flex', gap: '12px', backgroundColor: 'rgba(10, 10, 10, 0.95)', 
    borderTop: '1px solid #222', alignItems: 'center', zIndex: 10, flexShrink: 0, backdropFilter: 'blur(20px)'
  },

  input: { 
    flex: 1, padding: '14px 22px', borderRadius: '18px', border: '1px solid #333', 
    backgroundColor: '#151515', color: '#fff', fontSize: '16px', outline: 'none'
  },

  sendBtn: { 
    width: '48px', height: '48px', borderRadius: '50%', border: 'none', 
    backgroundColor: '#8a9a8e', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '20px'
  }
};