import './CentralDeck.css'

export default function CentralDeck({ 
  drawnCard, 
  onPlaceInSlot, 
  onPlaceInBottomDeck,
  canPlaceInSlot,
  canPlaceInBottomDeck
}) {
  if (!drawnCard) {
    return (
      <div className="central-deck">
        <div className="no-card">
          <span>Shuffling...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="central-deck">
      <div className="card-display">
        <div className="drawn-card">
          <div className="card-content">
            <div className="item-emoji">{drawnCard.item.emoji}</div>
            <div className="item-name">{drawnCard.item.name}</div>
            <div className="category-label">
              <span>{drawnCard.category.name}</span>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button
            className="action-btn place-slot-btn"
            onClick={() => onPlaceInSlot(0)}
            disabled={!canPlaceInSlot}
            title={canPlaceInSlot ? "Place this category in a slot" : "No empty slots available"}
          >
            <span className="btn-label">Place as Category</span>
            <span className="btn-hint">→ Slot</span>
          </button>

          <button
            className="action-btn place-deck-btn"
            onClick={onPlaceInBottomDeck}
            disabled={!canPlaceInBottomDeck}
            title={canPlaceInBottomDeck ? "Stack item in bottom deck" : "Cannot stack: category is in a slot or completed"}
          >
            <span className="btn-label">Stack Item</span>
            <span className="btn-hint">→ Deck</span>
          </button>
        </div>
      </div>
    </div>
  )
}
