import { useState } from 'react'
import './CategorySlots.css'

export default function CategorySlots({ categorySlots, topItems, onPlaceCategory, onPlaceItem, draggedCard, completedCategories, isTouchMode, selectedCard, onSlotClick, onSelectItem }) {
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  const playInvalidSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()
    
    oscillator.connect(gain)
    gain.connect(audioContext.destination)
    
    oscillator.frequency.value = 300
    oscillator.type = 'sine'
    
    gain.gain.setValueAtTime(0.3, audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.1)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleItemAboveClick = (e, item, slotIndex, category) => {
    e.stopPropagation()
    if (!isTouchMode || !onSelectItem) return
    
    // Select this single item from the top items
    onSelectItem({
      type: 'item',
      item: item,
      items: [item],
      category: category,
      fromTopSlot: slotIndex
    })
  }

  const handleDrop = (e, index) => {
    e.preventDefault()
    setDragOverIndex(null)
    
    if (!draggedCard) return

    if (draggedCard.type === 'category') {
      onPlaceCategory(draggedCard, index)
    } else if (draggedCard.type === 'item') {
      // Check if there's a category in this slot
      if (!categorySlots[index]) {
        setErrorMessage('No category here')
        playInvalidSound()
        setTimeout(() => setErrorMessage(null), 2000)
      } else if (categorySlots[index].id !== draggedCard.category.id) {
        setErrorMessage(`Need ${categorySlots[index].name}`)
        playInvalidSound()
        setTimeout(() => setErrorMessage(null), 2000)
      } else {
        // Valid placement
        onPlaceItem(draggedCard, index)
      }
    }
  }

  return (
    <div className="category-slots">
      {errorMessage && <div className="error-message-overlay">{errorMessage}</div>}
      {categorySlots.map((category, index) => (
        <div
          key={index}
          className="slot-container"
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onClick={() => isTouchMode && onSlotClick(index)}
          style={{ cursor: isTouchMode && selectedCard ? 'pointer' : 'default' }}
        >
          {category ? (
            <div className="filled-slot">
              {/* Items stacked above the category */}
              {topItems[index] && topItems[index].length > 0 && (
                <div className="items-above">
                  {topItems[index].map((item, itemIndex) => (
                    <div 
                      key={itemIndex} 
                      className="item-above"
                      onClick={(e) => handleItemAboveClick(e, item, index, category)}
                      style={{ cursor: isTouchMode ? 'pointer' : 'default' }}
                    >
                      {item.emoji}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Category card */}
              <div className={`category-card ${
                dragOverIndex === index && draggedCard?.type === 'item' ? 'drag-over' : ''
              } ${category && completedCategories.has(category.id) ? 'completing' : ''}`}
              style={{ background: category.color }}>
                <div className="category-emoji">{category.emoji}</div>
                <div className="category-name">{category.name}</div>
                <div className="item-count">{topItems[index]?.length || 0}/{category.items.length}</div>
              </div>
            </div>
          ) : (
            <div className={`empty-slot ${dragOverIndex === index && draggedCard?.type === 'category' ? 'drag-over' : ''}`}>
              <span className="slot-text">Drop Category</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
