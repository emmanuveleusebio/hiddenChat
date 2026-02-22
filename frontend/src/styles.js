export const styles = {
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
  calcPage: { 
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: 'center', 
    flex: 1,
    background: 'radial-gradient(circle at center, #1a1a1a 0%, #000 100%)', 
    zIndex: 20
  },
  calcCard: { 
    width: '100%', 
    maxWidth: '500px', 
    height: '95%', // Fills most of the height
    display: 'flex',
    flexDirection: 'column',
    padding: '20px' ,
    paddingTop: 0
  },
  calcDisplay: { 
    fontSize: '75px', 
    color: '#8a9a8e', 
    textAlign: 'right', 
    padding: '10px 10px', 
    // minHeight: '160px',
    fontFamily: '"Courier New", Courier, monospace', 
    fontWeight: 'bold', 
    letterSpacing: '-2px',
    wordBreak: 'break-all',
    flexShrink: 0
  },
  calcScrollArea: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column'
  },
  calcGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(4, 1fr)', 
    gap: '14px',
    flex: 1 // Makes the grid grow to fill space
  },
  calcBtn: { 
    width: '100%',
    height: '100%', // Fills grid cell height
    minHeight: '65px',
    borderRadius: '22px', 
    border: 'none', 
    backgroundColor: '#111', 
    color: '#fff', 
    fontSize: '26px', 
    fontFamily: '"Courier New", Courier, monospace', 
    fontWeight: '900',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  equalBtn: { backgroundColor: '#8a9a8e', color: '#000' },
  chatPage: { 
    height: '100%', display: 'flex', flexDirection: 'column', 
    backgroundColor: '#050505', overflow: 'hidden', position: 'relative' 
  },
  atmosphere: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 },
  kissLayer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 100, pointerEvents: 'none'
  },
  chatHeader: { 
    padding: '70px 24px 15px', display: 'flex', justifyContent: 'space-between', 
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
  msgRow: { 
    display: 'flex', marginBottom: '16px', width: '100%', position: 'relative', alignItems: 'center' 
  },
  bubble: { 
    padding: '14px 20px', borderRadius: '25px', maxWidth: '75%', fontSize: '15px', lineHeight: '1.5',
    boxShadow: '0 8px 30px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)',
    position: 'relative', overflow: 'visible', fontFamily: 'Inter, -apple-system, sans-serif',
    wordWrap: 'break-word', whiteSpace: 'pre-wrap', minWidth: 'fit-content' 
  },
  unsendActionBtn: {
    backgroundColor: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '12px', padding: '8px 12px',
    fontSize: '11px', fontWeight: '900', marginRight: '8px', flexShrink: 0, zIndex: 20,
    textTransform: 'uppercase', boxShadow: '0 4px 12px rgba(255, 77, 77, 0.4)'
  },
  typingIndicator: {
    padding: '8px 24px', fontSize: '13px', color: '#8a9a8e', fontStyle: 'italic', zIndex: 10, fontWeight: '500'
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