import { useState } from 'react'
import { CATEGORIES } from '../data/categories'
import './SortSlots.css'

export default function SortSlots({ sortSlots, categorySlots, onPlaceItem, onPlaceCategory, onDragStart, draggedCard, isTouchMode, selectedCard, onSlotClick, onSelectItem }) {
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [errorSlotIndex, setErrorSlotIndex] = useState(null)

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

  const canDropItemHere = (index, card) => {
    if (!card || card.type !== 'item') return false
    // Item can only go to sort slot if its category is NOT in top slot
    const categoryInTop = categorySlots.some(cat => cat && cat.id === card.category.id)
    // And there's no category card in this sort slot
    const hasCategoryInSlot = sortSlots[index].some(item => item.type === 'category')
    return !categoryInTop && !hasCategoryInSlot
  }

  const canDropCategoryHere = (index, card) => {
    if (!card || card.type !== 'category') return false
    // Category can go to sort slot if:
    // 1. There's no category already in this slot
    // 2. Either slot is empty OR it contains items of the same category
    const hasCategoryInSlot = sortSlots[index].some(item => item.type === 'category')
    const hasItemsOfThisCategory = sortSlots[index].some(item => item.type === 'item' && item.categoryId === card.category.id)
    const hasItemsOfDifferentCategory = sortSlots[index].some(item => item.type === 'item' && item.categoryId !== card.category.id)
    return !hasCategoryInSlot && !hasItemsOfDifferentCategory && (sortSlots[index].length === 0 || hasItemsOfThisCategory)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggedCard && (canDropItemHere(index, draggedCard) || canDropCategoryHere(index, draggedCard))) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e, index) => {
    e.preventDefault()
    setDragOverIndex(null)
    
    if (!draggedCard) return

    if (draggedCard.type === 'item' && canDropItemHere(index, draggedCard)) {
      onPlaceItem(draggedCard, index)
    } else if (draggedCard.type === 'category' && canDropCategoryHere(index, draggedCard)) {
      onPlaceCategory(draggedCard, index)
    } else if (draggedCard.type === 'item') {
      // Show appropriate error message
      const categoryInTopSlot = categorySlots.some(cat => cat && cat.id === draggedCard.category.id)
      const hasCategoryInSlot = sortSlots[index].some(item => item.type === 'category')
      
      if (categoryInTopSlot) {
        setErrorMessage('Item belongs in top slot')
      } else if (hasCategoryInSlot) {
        setErrorMessage('Clear category first')
      } else {
        // Different category in slot
        const existingItems = sortSlots[index].filter(item => item.type === 'item')
        if (existingItems.length > 0) {
          const existingCategory = CATEGORIES.find(cat => cat.id === existingItems[0].categoryId)
          setErrorMessage(`Need ${existingCategory?.name}`)
        }
      }
      setErrorSlotIndex(index)
      playInvalidSound()
      setTimeout(() => {
        setErrorMessage(null)
        setErrorSlotIndex(null)
      }, 2000)
    }
  }

  const handleItemDragStart = (e, item, slotIndex) => {
    e.stopPropagation()
    if (item.type === 'category') {
      // Dragging a category from sort slot - drag entire stack together
      const allItems = sortSlots[slotIndex]
      onDragStart({
        type: 'category',
        category: item.category,
        fromSortSlot: slotIndex,
        stackedItems: allItems
      })
    } else {
      // Find the category this item belongs to using the stored categoryId
      const category = CATEGORIES.find(cat => cat.id === item.categoryId)
      
      // Get all items of the same category in this slot (grouped drag)
      const groupedItems = sortSlots[slotIndex].filter(
        slotItem => slotItem.type === 'item' && slotItem.categoryId === item.categoryId
      )
      
      onDragStart({
        type: 'item',
        items: groupedItems,
        category: category,
        fromSortSlot: slotIndex
      })
    }
  }

  const handleItemPointerDown = (e, item, slotIndex) => {
    if (e.pointerType === 'touch') {
      e.stopPropagation()
      const element = e.currentTarget
      element.style.opacity = '0.7'
      
      if (item.type === 'category') {
        const allItems = sortSlots[slotIndex]
        onDragStart({
          type: 'category',
          category: item.category,
          fromSortSlot: slotIndex,
          stackedItems: allItems
        })
      } else {
        const category = CATEGORIES.find(cat => cat.id === item.categoryId)
        const groupedItems = sortSlots[slotIndex].filter(
          slotItem => slotItem.type === 'item' && slotItem.categoryId === item.categoryId
        )
        onDragStart({
          type: 'item',
          items: groupedItems,
          category: category,
          fromSortSlot: slotIndex
        })
      }
    }
  }

  const handleItemPointerUp = (e) => {
    const element = e.currentTarget
    element.style.opacity = '1'
  }

  const handleItemClick = (item, slotIndex) => {
    if (isTouchMode) {
      if (item.type === 'category') {
        // Dragging a category from sort slot - drag entire stack together
        const allItems = sortSlots[slotIndex]
        const cardData = {
          type: 'category',
          category: item.category,
          fromSortSlot: slotIndex,
          stackedItems: allItems
        }
        onSelectItem(cardData)
      } else {
        // Find the category this item belongs to using the stored categoryId
        const category = CATEGORIES.find(cat => cat.id === item.categoryId)
        
        // Get all items of the same category in this slot (grouped drag)
        const groupedItems = sortSlots[slotIndex].filter(
          slotItem => slotItem.type === 'item' && slotItem.categoryId === item.categoryId
        )
        
        const cardData = {
          type: 'item',
          items: groupedItems,
          category: category,
          fromSortSlot: slotIndex
        }
        onSelectItem(cardData)
      }
    }
  }

  return (
    <div className="sort-slots">
      <div className="sort-label">Sorting Area</div>
      <div className="slots-grid">
        {sortSlots.map((slot, index) => {
          const hasCategory = slot.some(item => item.type === 'category')
          
          return (
            <div
              key={index}
              className={`sort-slot ${
                dragOverIndex === index ? 'drag-over' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onClick={() => isTouchMode && onSlotClick(index)}
              style={{ cursor: isTouchMode && selectedCard ? 'pointer' : 'grab' }}
            >
              {errorMessage && errorSlotIndex === index && (
                <div className="error-message-overlay">{errorMessage}</div>
              )}
              {slot.length === 0 ? (
                <div className="empty-sort">
                  <span className="sort-text">Drop here</span>
                </div>
              ) : hasCategory ? (
                // Show category card in sort slot
                <div className="sort-category-card">
                  {slot.map((item, itemIndex) => {
                    if (item.type === 'category') {
                      const isSelected = selectedCard && selectedCard.type === 'category' && selectedCard.category.id === item.category.id && selectedCard.fromSortSlot === index
                      return (
                        <div
                          key={itemIndex}
                          className={`sort-category ${isSelected ? 'selected' : ''}`}
                          draggable
                          onDragStart={(e) => handleItemDragStart(e, item, index)}
                          onPointerDown={(e) => handleItemPointerDown(e, item, index)}
                          onPointerUp={handleItemPointerUp}
                          onClick={() => handleItemClick(item, index)}
                          style={{ background: item.category.color, cursor: isTouchMode ? 'pointer' : 'grab' }}
                        >
                          <div className="sort-cat-emoji">{item.category.emoji}</div>
                          <div className="sort-cat-name">{item.category.name}</div>
                        </div>
                      )
                    }
                    return null
                  })}
                </div>
              ) : (
                // Show items in sort slot
                <div className="sorted-items">
                  {slot.map((item, itemIndex) => {
                    const category = CATEGORIES.find(cat => cat.id === item.categoryId)
                    const isSelected = selectedCard && selectedCard.type === 'item' && selectedCard.items && selectedCard.items.some(i => i.id === item.id) && selectedCard.fromSortSlot === index
                    return (
                      <div
                        key={itemIndex}
                        className={`sort-item ${isSelected ? 'selected' : ''}`}
                        draggable
                        onDragStart={(e) => handleItemDragStart(e, item, index)}
                        onPointerDown={(e) => handleItemPointerDown(e, item, index)}
                        onPointerUp={handleItemPointerUp}
                        onClick={() => handleItemClick(item, index)}
                        style={{ zIndex: itemIndex, background: category?.color, cursor: isTouchMode ? 'pointer' : 'grab' }}
                      >
                        <div className="item-badge" style={{ background: category?.color }}>
                          <span className="badge-emoji">{item.emoji}</span>
                          <span className="badge-name">{item.name}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              {slot.length > 0 && (
                <div className="item-count" style={{ background: slot[0].categoryId ? CATEGORIES.find(cat => cat.id === slot[0].categoryId)?.color : (slot[0].category?.color) }}>
                  {slot.length}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
