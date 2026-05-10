import React from 'react';
import { motion } from 'framer-motion';
import { styles } from '../../styles';

const DRESSES = [
  { id: 1, name: "Floral Summer Maxi", price: "₹1,299", img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80" },
  { id: 2, name: "Evening Silk Gown", price: "₹3,450", img: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500&q=80" },
  { id: 3, name: "Casual Cotton One-Piece", price: "₹899", img: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&q=80" },
  { id: 4, name: "Vintage Party Dress", price: "₹2,100", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZpxQw20ZQY3ejfad-m1mP21COiIO5p0zh8Q&s" },
  { id: 5, name: "Boho Chic Midi", price: "₹1,550", img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&q=80" },
  { id: 6, name: "Linen Shirt Dress", price: "₹1,100", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFkBxdEeH3DLpfcMjjeitdel_xOl8zR3aO7A&s" }
];

const VaultDisguise = ({ calcDisplay, setCalcDisplay, handleSearchTrigger, setShowBugPopup }) => {
  return (
    <motion.div key="shop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.shopPage}>
      <div style={styles.shopHeader}>
        <div style={styles.shopTitle}>ELARA FASHION</div>
        <div style={styles.searchContainer}>
          <span style={styles.searchIcon}>🔍</span>
          <input 
            style={styles.shopSearchInput} 
            placeholder="Search for dresses, tops..." 
            value={calcDisplay}
            onChange={(e) => setCalcDisplay(e.target.value)}
            onKeyPress={handleSearchTrigger}
          />
        </div>
      </div>
      <div style={styles.shopScrollArea} className="hide-scrollbar">
        <div style={styles.shopGrid}>
          {DRESSES.map(item => (
            <div key={item.id} style={styles.productCard} onClick={() => setShowBugPopup(true)}>
              <img src={item.img} style={styles.productImage} alt={item.name} />
              <div style={styles.productName}>{item.name}</div>
              <div style={styles.productPrice}>{item.price}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default VaultDisguise;
