export const styles = {
  // ... Keep all your existing chat styles (appViewport, chatPage, etc.)
  
  appViewport: { 
    width: '100vw', 
    height: '100dvh', 
    backgroundColor: '#fff', // Changed to white for shopping look
    display: 'flex', 
    flexDirection: 'column', 
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif',
    position: 'relative'
  },

  // SHOPPING DISGUISE STYLES
  shopPage: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
    zIndex: 20,
  },
  shopHeader: {
    padding: '50px 20px 15px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #eee',
  },
  shopTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#000',
    letterSpacing: '1px',
    marginBottom: '15px',
    textAlign: 'center'
  },
  searchContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  shopSearchInput: {
    flex: 1,
    padding: '12px 15px 12px 40px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#f5f5f5',
    fontSize: '14px',
    outline: 'none',
    color: '#000'
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: '#888',
    fontSize: '18px'
  },
  shopScrollArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '15px'
  },
  shopGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '15px'
  },
  productCard: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '10px'
  },
  productImage: {
    width: '100%',
    aspectRatio: '3/4',
    backgroundColor: '#f9f9f9',
    borderRadius: '12px',
    objectFit: 'cover',
    marginBottom: '8px'
  },
  productName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '4px'
  },
  productPrice: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#000'
  },
  
  // POPUP STYLE
  popupOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '40px'
  },
  popupContent: {
    backgroundColor: '#fff',
    padding: '25px',
    borderRadius: '20px',
    textAlign: 'center',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
  },
  popupText: {
    color: '#333',
    fontSize: '14px',
    lineHeight: '1.6',
    marginBottom: '15px'
  },
  popupBtn: {
    padding: '10px 25px',
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 'bold'
  },

  // Keep your existing chat styles below...
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
    zIndex: 10, flexShrink: 0 ,
    position:'relative'
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