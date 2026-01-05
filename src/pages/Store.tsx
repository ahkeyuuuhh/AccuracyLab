export default function Store() {
  const storeItems = [
    { name: 'Premium Theme Pack', price: 500, icon: '🎨', type: 'Theme' },
    { name: 'Elite Sound Pack', price: 300, icon: '🎵', type: 'Audio' },
    { name: 'Golden Target Set', price: 750, icon: '🎯', type: 'Target' },
    { name: 'VIP Badge', price: 1000, icon: '👑', type: 'Badge' },
    { name: 'Particle Effects Pro', price: 600, icon: '✨', type: 'Effects' },
    { name: 'Exclusive Avatar Frame', price: 450, icon: '🖼️', type: 'Cosmetic' },
  ]

  return (
    <div className="page-container">
      <h1 className="page-title">STORE</h1>
      <div className="page-content">
        <div className="currency-display">
          <span className="currency-amount">💰 2,340 Coins</span>
          <button className="btn btn-primary">Buy Coins</button>
        </div>
        <div className="store-grid">
          {storeItems.map((item, index) => (
            <div key={index} className="store-item">
              <div className="item-icon">{item.icon}</div>
              <span className="item-type">{item.type}</span>
              <h3>{item.name}</h3>
              <div className="item-footer">
                <span className="item-price">💰 {item.price}</span>
                <button className="btn btn-primary">Buy</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
