import './BottomDeck.css'

export default function BottomDeck({ items }) {
  return (
    <div className="bottom-deck">
      <div className="deck-label">Stacked Items</div>
      <div className="deck-container">
        {items.length === 0 ? (
          <div className="empty-deck">
            <span>Stack items here</span>
          </div>
        ) : (
          <div className="stacked-items">
            {items.map((item, index) => (
              <div 
                key={index}
                className="stacked-item"
                style={{
                  transform: `translateY(${index * 8}px) translateX(${(index % 2) * 4}px)`,
                  zIndex: index
                }}
              >
                <div className="item-badge">
                  <span className="badge-emoji">{item.emoji}</span>
                  <span className="badge-name">{item.name}</span>
                </div>
              </div>
            ))}
            <div className="item-count">{items.length} item{items.length !== 1 ? 's' : ''}</div>
          </div>
        )}
      </div>
    </div>
  )
}
