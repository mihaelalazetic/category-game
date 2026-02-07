import { useState } from 'react'
import './StackSlots.css'

export default function StackSlots({ slots, categorySlots, onDropCard, draggedCard }) {
  const [dragOverIndex, setDragOverIndex] = useState(null)

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggedCard && draggedCard.type === 'item') {
      const categoryInSlot = categorySlots[index]
      if (categoryInSlot && categoryInSlot.id === draggedCard.category.id) {
        setDragOverIndex(index)
      }
    }
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e, index) => {
    e.preventDefault()
    if (draggedCard) {
      onDropCard(draggedCard, index)
      setDragOverIndex(null)
    }
  }

  return (
    <div className="stack-slots">
      <div className="stack-label">Stack Area</div>
      <div className="slots-grid">
        {slots.map((stack, index) => {
          const categoryInSlot = categorySlots[index]
          const canDrop =
            draggedCard &&
            draggedCard.type === 'item' &&
            categoryInSlot &&
            categoryInSlot.id === draggedCard.category.id

          return (
            <div
              key={index}
              className={`stack-slot ${
                dragOverIndex === index && canDrop ? 'drag-over' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
            >
              {!categoryInSlot ? (
                <div className="empty-stack">
                  <span className="empty-text">No category</span>
                </div>
              ) : stack.length === 0 ? (
                <div className="empty-items">
                  <span className="category-hint">{categoryInSlot.emoji}</span>
                  <span className="items-text">Drop items here</span>
                </div>
              ) : (
                <div className="stacked-items">
                  {stack.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="item-in-stack"
                      style={{
                        transform: `translateY(${itemIndex * 6}px)`,
                        zIndex: itemIndex
                      }}
                    >
                      <div className="stack-item-badge">
                        <span className="badge-emoji">{item.emoji}</span>
                        <span className="badge-name">{item.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {stack.length > 0 && (
                <div className="stack-count">{stack.length}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
