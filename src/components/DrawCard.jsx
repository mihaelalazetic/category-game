import './DrawCard.css'
import { useRef } from 'react'

export default function DrawCard({ card, onDragStart, onCardClick, onDrawCard, deckEmpty, isSelected, isTouchMode }) {
  const cardRef = useRef(null)

  const handleDragStart = (e) => {
    if (card && !isTouchMode) {
      onDragStart(card)
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move'
      }
    }
  }

  const handleCardClick = () => {
    if (card && isTouchMode && onCardClick) {
      onCardClick(card)
    }
  }

  const handlePointerDown = (e) => {
    if (card && e.pointerType === 'touch' && !isTouchMode) {
      onDragStart(card)
      e.currentTarget.style.opacity = '0.7'
    }
  }

  const handlePointerUp = (e) => {
    e.currentTarget.style.opacity = '1'
  }

  if (deckEmpty) {
    return (
      <div className="draw-card">
        <div className="empty-deck-message">
          <div className="empty-deck-text">No more cards!</div>
          <div className="empty-deck-subtext">All available cards have been drawn</div>
        </div>
      </div>
    )
  }

  if (!card) {
    return null
  }

  const isCategory = card.type === 'category'
//   const backgroundColor = isCategory ? card.category.color : undefined
  const backgroundColor = card.category.color ;

  return (
    <div className="draw-card">
      <div className="card-container">
        <div
          className={`card ${card.type} card-flip-in ${isSelected ? 'selected' : ''}`}
          ref={cardRef}
          draggable={!isTouchMode}
          onDragStart={handleDragStart}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onClick={handleCardClick}
          style={backgroundColor ? { background: backgroundColor } : {}}
        >
          <div className="card-content">
            {isCategory ? (
              <>
                <div className="item-count-badge">{card.category.items.length} items</div>
                <div className="card-emoji">{card.category.emoji}</div>
                <div className="card-name">{card.category.name}</div>
                <div className="card-type-label">Category</div>
              </>
            ) : (
              <>
                <div className="card-emoji">{card.item.emoji}</div>
                <div className="card-name">{card.item.name}</div>
                <div className="card-category">{card.category.name}</div>
                <div className="card-type-label">Item</div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* <div className="drag-hint">Drag to place</div> */}
    </div>
  )
}
