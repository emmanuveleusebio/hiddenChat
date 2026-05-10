export const styles = {
  // --- GLOBAL & VIEWPORT ---
  appViewport: { 
    width: '100vw', 
    height: '100dvh', 
    backgroundColor: '#fff', 
    display: 'flex', 
    flexDirection: 'column', 
    overflow: 'hidden',
    fontFamily: '"Outfit", "Inter", -apple-system, sans-serif',
    position: 'relative'
  },

  // --- LUXURY SHOPPING DISGUISE (ELARA) ---
  shopPage: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
    zIndex: 20,
  },
  shopHeader: {
    padding: '60px 24px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #f0f0f0',
    position: 'sticky',
    top: 0,
    zIndex: 30
  },
  shopTitle: {
    fontSize: '28px',
    fontWeight: '300',
    color: '#1a1a1a',
    letterSpacing: '4px',
    marginBottom: '20px',
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  searchContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    maxWidth: '400px',
    margin: '0 auto',
    width: '100%'
  },
  shopSearchInput: {
    flex: 1,
    padding: '14px 15px 14px 45px',
    borderRadius: '100px',
    border: '1px solid #e0e0e0',
    backgroundColor: '#fafafa',
    fontSize: '14px',
    outline: 'none',
    color: '#333',
    transition: 'all 0.3s ease'
  },
  searchIcon: {
    position: 'absolute',
    left: '18px',
    color: '#999',
    fontSize: '16px'
  },
  shopScrollArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px'
  },
  shopGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px'
  },
  productCard: {
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer'
  },
  productImage: {
    width: '100%',
    aspectRatio: '0.8',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    objectFit: 'cover',
    marginBottom: '12px',
    transition: 'transform 0.3s ease'
  },
  productName: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#1a1a1a',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px'
  },
  productPrice: {
    fontSize: '14px',
    fontWeight: '300',
    color: '#666'
  },
  
  // --- PREMIUM VAULT (CHAT) ---
  chatPage: { 
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column', 
    backgroundColor: '#050505', 
    overflow: 'hidden', 
    position: 'relative' 
  },
  atmosphere: { 
    position: 'absolute', 
    top: 0, left: 0, right: 0, bottom: 0, 
    zIndex: 1,
    transition: 'background 2s ease'
  },
  chatHeader: { 
    padding: '60px 24px 15px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderBottom: '1px solid rgba(255,255,255,0.05)', 
    backgroundColor: 'rgba(5, 5, 5, 0.7)', 
    backdropFilter: 'blur(20px)',
    zIndex: 10, 
    position: 'relative'
  },
  statusDot: { 
    width: '6px', height: '6px', 
    borderRadius: '50%', 
    backgroundColor: '#c4a484', // Champagne Gold
    marginRight: '12px', 
    boxShadow: '0 0 12px rgba(196, 164, 132, 0.8)' 
  },
  lockBtn: { 
    background: 'rgba(255,255,255,0.05)', 
    border: '1px solid rgba(255,255,255,0.1)', 
    color: '#fff', 
    padding: '6px 12px',
    borderRadius: '100px',
    fontWeight: '500', 
    fontSize: '11px', 
    textTransform: 'uppercase', 
    letterSpacing: '1.5px' 
  },
  messageList: { 
    flex: 1, 
    padding: '24px', 
    overflowY: 'auto', 
    display: 'flex', 
    flexDirection: 'column', 
    zIndex: 5, 
    position: 'relative',
    gap: '4px'
  },
  msgRow: { 
    display: 'flex', 
    marginBottom: '12px', 
    width: '100%', 
    position: 'relative', 
    alignItems: 'center' 
  },
  bubble: { 
    padding: '12px 18px', 
    borderRadius: '20px', 
    maxWidth: '80%', 
    fontSize: '15px', 
    lineHeight: '1.6',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)', 
    position: 'relative', 
    fontFamily: '"Inter", sans-serif',
    wordWrap: 'break-word', 
    whiteSpace: 'pre-wrap'
  },
  myBubble: {
    background: 'linear-gradient(135deg, #c4a484 0%, #a68b6d 100%)', // Gold Gradient
    color: '#000',
    borderTopRightRadius: '4px',
  },
  theirBubble: {
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#fff',
    borderTopLeftRadius: '4px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  unsendActionBtn: {
    backgroundColor: '#ff3b30', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '8px', 
    padding: '6px 10px',
    fontSize: '10px', 
    fontWeight: '600', 
    marginRight: '8px', 
    textTransform: 'uppercase'
  },
  typingIndicator: {
    padding: '8px 24px', 
    fontSize: '12px', 
    color: '#c4a484', 
    opacity: 0.8,
    fontStyle: 'italic', 
    zIndex: 10
  },
  inputArea: { 
    padding: '20px 24px 40px', 
    display: 'flex', 
    gap: '15px', 
    backgroundColor: 'rgba(5, 5, 5, 0.9)', 
    borderTop: '1px solid rgba(255,255,255,0.05)', 
    alignItems: 'center', 
    zIndex: 10, 
    backdropFilter: 'blur(30px)'
  },
  input: { 
    flex: 1, 
    padding: '12px 20px', 
    borderRadius: '100px', 
    border: '1px solid rgba(255,255,255,0.1)', 
    backgroundColor: 'rgba(255,255,255,0.03)', 
    color: '#fff', 
    fontSize: '15px', 
    outline: 'none',
    transition: 'border 0.3s ease'
  },
  sendBtn: { 
    width: '44px', 
    height: '44px', 
    borderRadius: '50%', 
    border: 'none', 
    backgroundColor: '#c4a484', 
    color: '#000', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    fontSize: '18px',
    boxShadow: '0 4px 12px rgba(196, 164, 132, 0.3)'
  },
  
  // --- SHARED SECRETS (NOTES) ---
  noteCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '15px',
    position: 'relative',
    overflow: 'hidden'
  },
  noteAccent: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: '4px',
    background: '#c4a484'
  },

  // --- POPUP ---
  popupOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '30px'
  },
  popupContent: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '24px',
    textAlign: 'center',
    maxWidth: '320px',
    width: '100%'
  },
  popupText: {
    color: '#1a1a1a',
    fontSize: '14px',
    lineHeight: '1.6',
    marginBottom: '20px'
  },
  popupBtn: {
    padding: '12px 30px',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    border: 'none',
    borderRadius: '100px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontSize: '12px'
  }
};