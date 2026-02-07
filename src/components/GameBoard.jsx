import { useState, useEffect, useContext } from 'react'
import { CATEGORIES } from '../data/categories'
import './GameBoard.css'
import CategorySlots from './CategorySlots'
import SortSlots from './SortSlots'
import DrawCard from './DrawCard'
import LanguageSelector from './LanguageSelector'
import { LanguageContext } from '../context/LanguageContext'
import { translations, categoryNames, itemNames } from '../data/translations'

export default function GameBoard() {
  const { language } = useContext(LanguageContext)
  const t = translations[language]
  // Initialize deck with all categories and all items
  const initializeDeck = () => {
    const deck = []
    
    // Add all categories to deck
    CATEGORIES.forEach(category => {
      deck.push({
        type: 'category',
        category,
        id: `cat-${category.id}`
      })
    })
    
    // Add all items from all categories to deck
    CATEGORIES.forEach(category => {
      category.items.forEach(item => {
        deck.push({
          type: 'item',
          category,
          item,
          id: `item-${category.id}-${item.id}`
        })
      })
    })
    
    // Shuffle the deck
    return deck.sort(() => Math.random() - 0.5)
  }

  const [gameState, setGameState] = useState({
    categorySlots: [null, null, null], // 3 top slots for categories
    topItems: [[], [], []], // items stacked ABOVE each category in top slots
    sortSlots: [[], [], []], // 3 bottom slots for sorting - can contain items or categories
    drawnCard: null,
    allCategories: [...CATEGORIES],
    completedCategories: new Set(),
    usedCardIds: new Set(), // Track all cards that have been drawn or placed
    deck: initializeDeck(), // shuffled deck of all cards
    deckIndex: 0, // current position in deck
    moves: 0 // move counter
  })

  const [draggedCard, setDraggedCard] = useState(null)
  const [selectedCard, setSelectedCard] = useState(null) // For mobile click-to-select mode
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [touchDragState, setTouchDragState] = useState({
    isDragging: false,
    card: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0
  })

  // Detect if device supports touch
  useEffect(() => {
    const isMobile = () => {
      return (
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0 ||
        'ontouchstart' in window
      ) && window.innerWidth <= 768
    }
    setIsTouchDevice(isMobile())
  }, [])

  // Play invalid placement sound
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

  // Draw a card from the deck
  const drawCard = () => {
    setGameState(prev => {
      let currentIndex = prev.deckIndex
      let currentDeck = prev.deck

      // If we've reached the end of the deck
      if (currentIndex >= currentDeck.length) {
        // Use the already-tracked usedCardIds from drawn cards
        const placedCardIds = new Set(prev.usedCardIds)
        
        // Filter deck to only include cards that haven't been used
        const remainingCards = currentDeck.filter(card => !placedCardIds.has(card.id))
        
        // If no remaining cards, we're done
        if (remainingCards.length === 0) {
          return { ...prev, drawnCard: null }
        }
        
        // Shuffle remaining cards
        const shuffledRemaining = remainingCards.sort(() => Math.random() - 0.5)
        
        // Draw the first card from shuffled remaining
        return {
          ...prev,
          deck: shuffledRemaining,
          deckIndex: 1,
          drawnCard: shuffledRemaining[0]
        }
      }

      // Draw the next card in sequence from the deck
      const card = currentDeck[currentIndex]
      
      return {
        ...prev,
        drawnCard: card,
        deckIndex: currentIndex + 1
      }
    })
  }

  // Initialize game
  useEffect(() => {
    if (!gameState.drawnCard) {
      drawCard()
    }
  }, [])

  // Clear completed categories after animation finishes
  useEffect(() => {
    const completedIds = Array.from(gameState.completedCategories)
    if (completedIds.length > 0) {
      const timer = setTimeout(() => {
        setGameState(prev => {
          const newCategorySlots = [...prev.categorySlots]
          const newTopItems = [...prev.topItems]
          
          // Clear any slots that have completed categories
          newCategorySlots.forEach((category, index) => {
            if (category && prev.completedCategories.has(category.id)) {
              newCategorySlots[index] = null
              newTopItems[index] = []
            }
          })
          
          return {
            ...prev,
            categorySlots: newCategorySlots,
            topItems: newTopItems
          }
        })
      }, 800) // Match animation duration
      
      return () => clearTimeout(timer)
    }
  }, [gameState.completedCategories])

  // Handle selecting a card on mobile (click-to-select mode)
  const handleSelectCard = (card) => {
    if (isTouchDevice) {
      setSelectedCard(card)
      setDraggedCard(card)
    }
  }

  // Handle selecting card from sort slots on mobile
  const handleSelectSortItem = (itemData) => {
    if (isTouchDevice) {
      setSelectedCard(itemData)
      setDraggedCard(itemData)
    }
  }

  // Handle selecting item from top category slots on mobile
  const handleSelectTopItem = (itemData) => {
    if (isTouchDevice) {
      setSelectedCard(itemData)
      setDraggedCard(itemData)
    }
  }

  // Handle clearing selection
  const handleClearSelection = () => {
    setSelectedCard(null)
    setDraggedCard(null)
  }

  // Handle placing selected card on mobile
  const handlePlaceSelectedCard = (handler, slotIndex) => {
    if (selectedCard) {
      handler(selectedCard, slotIndex)
      handleClearSelection()
    }
  }

  // Handle slot click on mobile
  const handleCategorySlotClick = (slotIndex) => {
    if (!isTouchDevice || !selectedCard) return
    
    if (selectedCard.type === 'category') {
      handlePlaceSelectedCard(handlePlaceCategory, slotIndex)
    } else if (selectedCard.type === 'item') {
      handlePlaceSelectedCard(handlePlaceItemInTop, slotIndex)
    }
  }

  const handleSortSlotClick = (slotIndex) => {
    if (!isTouchDevice || !selectedCard) return
    
    if (selectedCard.type === 'item') {
      // Check if item is from top slot
      if (selectedCard.fromTopSlot !== undefined) {
        handlePlaceSelectedCard(handlePlaceItemFromTopInSort, slotIndex)
      } else {
        handlePlaceSelectedCard(handlePlaceItemInSort, slotIndex)
      }
    } else if (selectedCard.type === 'category') {
      handlePlaceSelectedCard(handlePlaceCategoryInSort, slotIndex)
    }
  }

  const handlePlaceCategory = (card, slotIndex) => {
    if (card.type !== 'category' || gameState.categorySlots[slotIndex]) {
      playInvalidSound()
      return
    }

    setGameState(prev => {
      const newSlots = [...prev.categorySlots]
      newSlots[slotIndex] = card.category
      
      const newTopItems = [...prev.topItems]
      const newSortSlots = prev.sortSlots.map((slot, idx) => [...slot]) // Create deep copy of all sort slots
      
      // If category is being moved from sort slot with stacked items
      if (card.fromSortSlot !== undefined && card.stackedItems) {
        // Get all items from the stacked items
        const itemsToMove = card.stackedItems.filter(item => item.type === 'item')
        newTopItems[slotIndex] = itemsToMove
        
        // Remove the category and items from the sort slot
        newSortSlots[card.fromSortSlot] = newSortSlots[card.fromSortSlot].filter(
          item => !(item.type === 'category' && item.category.id === card.category.id) &&
                  !(item.type === 'item' && item.categoryId === card.category.id)
        )
      }
      
      // If category is being moved from sort slot with all items, mark it as completed
      let newCompleted = prev.completedCategories
      if (card.fromSortSlot !== undefined && card.stackedItems) {
        const itemsToMove = card.stackedItems.filter(item => item.type === 'item')
        if (itemsToMove.length === card.category.items.length) {
          newCompleted = new Set([...prev.completedCategories, card.category.id])
        }
      }

      const newState = {
        ...prev,
        categorySlots: newSlots,
        topItems: newTopItems,
        sortSlots: newSortSlots,
        completedCategories: newCompleted,
        moves: prev.moves + 1,
        usedCardIds: new Set([...prev.usedCardIds, card.id])
      }

      // Only clear drawn card if the category came from the drawn card (not from sort slot)
      if (card.fromSortSlot === undefined) {
        newState.drawnCard = null
      } else {
        newState.drawnCard = prev.drawnCard
      }

      return newState
    })

    // Only draw next card if this category came from the drawn card (not from sort slot)
    if (card.fromSortSlot === undefined) {
      setTimeout(() => drawCard(), 300)
    }
  }

  // Handle placing category in sort slot
  const handlePlaceCategoryInSort = (card, slotIndex) => {
    if (card.type !== 'category') {
      playInvalidSound()
      return
    }

    // Check if there's already a category in this slot
    const hasCategoryInSlot = gameState.sortSlots[slotIndex].some(item => item.type === 'category')
    if (hasCategoryInSlot) {
      playInvalidSound()
      return
    }

    // If slot has items, they must be of the same category
    const hasItems = gameState.sortSlots[slotIndex].some(item => item.type === 'item')
    if (hasItems) {
      const hasItemsOfDifferentCategory = gameState.sortSlots[slotIndex].some(item => item.type === 'item' && item.categoryId !== card.category.id)
      if (hasItemsOfDifferentCategory) {
        playInvalidSound()
        return
      }
    }

    setGameState(prev => {
      const newSortSlots = prev.sortSlots.map((slot, idx) => [...slot]) // Deep copy all slots
      
      // Add category to target slot
      newSortSlots[slotIndex] = [
        ...newSortSlots[slotIndex],
        {
          type: 'category',
          category: card.category,
          id: `sort-cat-${card.category.id}-${Date.now()}`
        }
      ]

      // If moving from another sort slot, remove from source slot
      if (card.fromSortSlot !== undefined && card.fromSortSlot !== slotIndex) {
        newSortSlots[card.fromSortSlot] = newSortSlots[card.fromSortSlot].filter(
          item => !(item.type === 'category' && item.category.id === card.category.id)
        )
      }

      const newState = {
        ...prev,
        sortSlots: newSortSlots,
        moves: prev.moves + 1,
        usedCardIds: new Set([...prev.usedCardIds, card.id])
      }

      // Only clear drawn card if the category came from the drawn card (not from sort slot)
      if (card.fromSortSlot === undefined) {
        newState.drawnCard = null
      } else {
        newState.drawnCard = prev.drawnCard
      }

      return newState
    })

    // Only draw next card if this category came from the drawn card (not from sort slot)
    if (card.fromSortSlot === undefined) {
      setTimeout(() => drawCard(), 300)
    }
  }

  // Handle placing item in top slot (collecting it under its category)
  const handlePlaceItemInTop = (card, slotIndex) => {
    if (card.type !== 'item') return
    
    const category = gameState.categorySlots[slotIndex]
    if (!category || category.id !== card.category.id) return

    // Check if category is already completed - if so, don't allow placement
    if (gameState.completedCategories.has(category.id)) {
      playInvalidSound()
      return
    }

    // Check if category is already full - if so, don't allow placement
    if (gameState.topItems[slotIndex].length >= category.items.length) {
      playInvalidSound()
      return
    }

    setGameState(prev => {
      const newTopItems = [...prev.topItems]
      
      // Handle both single item and multiple grouped items
      const itemsToAdd = card.items || [card.item]
      newTopItems[slotIndex] = [...newTopItems[slotIndex], ...itemsToAdd]

      // Check if all items of this category are collected
      const allItemsCollected = newTopItems[slotIndex].length === category.items.length
      
      let newCompleted = prev.completedCategories
      let newCategorySlots = [...prev.categorySlots]
      let newTopItemsResult = newTopItems
      let newSortSlots = [...prev.sortSlots]
      
      if (allItemsCollected) {
        newCompleted = new Set([...prev.completedCategories, category.id])
        
        // Check if this category exists in sort slots
        let categoryFoundInSort = false
        let categoryInSortSlotIndex = -1
        
        for (let i = 0; i < newSortSlots.length; i++) {
          const categoryCard = newSortSlots[i].find(item => item.type === 'category' && item.category.id === category.id)
          if (categoryCard) {
            categoryFoundInSort = true
            categoryInSortSlotIndex = i
            break
          }
        }
        
        // If category is in sort slot, move it and its items to the freed top slot
        if (categoryFoundInSort) {
          const sortedItems = newSortSlots[categoryInSortSlotIndex].filter(item => item.type === 'item' && item.categoryId === category.id)
          
          newCategorySlots[slotIndex] = category
          newTopItemsResult[slotIndex] = sortedItems
          
          // Remove category and its items from sort slot
          newSortSlots[categoryInSortSlotIndex] = newSortSlots[categoryInSortSlotIndex].filter(
            item => !(item.type === 'category' && item.category.id === category.id) && 
                   !(item.type === 'item' && item.categoryId === category.id)
          )
        } else {
          // Don't clear the slot yet - let the animation play first
          // We'll clear it after the animation completes (0.8s)
          // For now, keep the category in the slot so the animation can render
        }
      }

      // If from sort slots, remove the items
      let newSortSlotsResult = newSortSlots
      if (card.fromSortSlot !== undefined) {
        newSortSlotsResult = [...newSortSlots]
        // Remove all the items that were dragged
        const itemsToRemove = card.items || [card.item]
        const itemIdsToRemove = new Set(itemsToRemove.map(item => item.id))
        
        newSortSlotsResult[card.fromSortSlot] = newSortSlotsResult[card.fromSortSlot].filter(
          item => !itemIdsToRemove.has(item.id)
        )
      }

      return {
        ...prev,
        topItems: newTopItemsResult,
        categorySlots: newCategorySlots,
        completedCategories: newCompleted,
        sortSlots: newSortSlotsResult,
        drawnCard: card.fromSortSlot !== undefined ? prev.drawnCard : null,
        moves: prev.moves + 1,
        usedCardIds: new Set([...prev.usedCardIds, ...((card.items || [card.item]).map(item => `item-${card.category.id}-${item.id}`))])
      }
    })

    if (card.fromSortSlot === undefined) {
      setTimeout(() => drawCard(), 300)
    }
  }

  // Handle placing item from top slot in sort slot
  const handlePlaceItemFromTopInSort = (card, slotIndex) => {
    if (card.type !== 'item' || card.fromTopSlot === undefined) return

    // Item can only go to sort slot if its category is NOT in another top slot
    // But it's okay if it came from a top slot
    const category = gameState.categorySlots[card.fromTopSlot]
    if (!category || category.id !== card.category.id) return

    // Cannot go to a sort slot if there's a different category card in that slot
    const hasCategoryInSortSlot = gameState.sortSlots[slotIndex].some(item => item.type === 'category' && item.categoryId !== card.category.id)
    if (hasCategoryInSortSlot) {
      playInvalidSound()
      return
    }

    setGameState(prev => {
      const newSortSlots = [...prev.sortSlots]
      const newTopItems = [...prev.topItems]
      
      // Add items to sort slot
      const itemsToAdd = card.items || [card.item]
      const itemsWithMetadata = itemsToAdd.map(item => ({
        ...item,
        id: item.id,
        type: 'item',
        categoryId: card.category.id,
        deckId: `item-${card.category.id}-${item.id}`
      }))
      
      newSortSlots[slotIndex] = [...newSortSlots[slotIndex], ...itemsWithMetadata]
      
      // Remove items from top slot
      const itemIdsToRemove = new Set(itemsToAdd.map(item => item.id))
      newTopItems[card.fromTopSlot] = newTopItems[card.fromTopSlot].filter(
        item => !itemIdsToRemove.has(item.id)
      )

      return {
        ...prev,
        topItems: newTopItems,
        sortSlots: newSortSlots,
        moves: prev.moves + 1,
        usedCardIds: new Set([...prev.usedCardIds, ...itemsToAdd.map(item => `item-${card.category.id}-${item.id}`)])
      }
    })
  }

  // Handle placing item in sort slot
  const handlePlaceItemInSort = (card, slotIndex) => {
    if (card.type !== 'item') return

    // Item can only go to sort slot if its category is NOT in a top slot
    const categoryInTopSlot = gameState.categorySlots.some(cat => cat && cat.id === card.category.id)
    if (categoryInTopSlot) {
      playInvalidSound()
      return
    }

    // Also cannot go to a sort slot if there's a category card in that slot
    const hasCategoryInSortSlot = gameState.sortSlots[slotIndex].some(item => item.type === 'category')
    if (hasCategoryInSortSlot) {
      playInvalidSound()
      return
    }

    // Check if there are items from different categories in this slot
    const existingItems = gameState.sortSlots[slotIndex].filter(item => item.type === 'item')
    if (existingItems.length > 0) {
      const differentCategory = existingItems.some(item => item.categoryId !== card.category.id)
      if (differentCategory) {
        playInvalidSound()
        return
      }
    }

    setGameState(prev => {
      const newSortSlots = [...prev.sortSlots]
      
      // Handle both single item and grouped items
      const itemsToAdd = card.items || [card.item]
      const itemsWithMetadata = itemsToAdd.map(item => ({
        ...item,
        id: item.id,
        type: 'item',
        categoryId: card.category.id,
        // Store the original deck ID for proper tracking during deck recycling
        deckId: `item-${card.category.id}-${item.id}`
      }))
      
      newSortSlots[slotIndex] = [...newSortSlots[slotIndex], ...itemsWithMetadata]

      // If from another sort slot, remove the items
      let newSortSlotsResult = newSortSlots
      if (card.fromSortSlot !== undefined && card.fromSortSlot !== slotIndex) {
        newSortSlotsResult = [...newSortSlots]
        const itemIdsToRemove = new Set(itemsToAdd.map(item => item.id))
        newSortSlotsResult[card.fromSortSlot] = newSortSlotsResult[card.fromSortSlot].filter(
          item => !itemIdsToRemove.has(item.id)
        )
      }

      return {
        ...prev,
        sortSlots: newSortSlotsResult,
        drawnCard: card.fromSortSlot !== undefined ? prev.drawnCard : null,
        moves: prev.moves + 1,
        usedCardIds: new Set([...prev.usedCardIds, ...((card.items || [card.item]).map(item => `item-${card.category.id}-${item.id}`))])
      }
    })

    if (card.fromSortSlot === undefined) {
      setTimeout(() => drawCard(), 300)
    }
  }

  // Touch drag handlers for mobile
  const handleTouchDragStart = (card) => {
    setTouchDragState({
      isDragging: true,
      card: card,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0
    })
    setDraggedCard(card)
  }

  const handleTouchDragEnd = () => {
    setTouchDragState({
      isDragging: false,
      card: null,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0
    })
  }

  return (
    <div className="game-board">
      <div className="game-container">
        <div className="header-bar">
          <h1 className="game-title">{t.gameTitle}</h1>
          <div className="header-right">
            <div className="move-counter">{t.moves}: {gameState.moves}</div>
            <LanguageSelector />
          </div>
        </div>

        <div className="game-layout">
          {/* Top: Category Slots */}
          <CategorySlots
            categorySlots={gameState.categorySlots}
            topItems={gameState.topItems}
            onPlaceCategory={handlePlaceCategory}
            onPlaceItem={handlePlaceItemInTop}
            draggedCard={draggedCard}
            completedCategories={gameState.completedCategories}
            isTouchMode={isTouchDevice}
            selectedCard={selectedCard}
            onSlotClick={handleCategorySlotClick}
            onSelectItem={handleSelectTopItem}
          />

          {/* Middle: Drawn Card with Deck */}
          <div className="middle-section">
            <DrawCard
              card={gameState.drawnCard}
              onDragStart={setDraggedCard}
              onCardClick={isTouchDevice ? handleSelectCard : undefined}
              onDrawCard={drawCard}
              deckEmpty={!gameState.drawnCard && gameState.deckIndex >= gameState.deck.length}
              isSelected={selectedCard === gameState.drawnCard}
              isTouchMode={isTouchDevice}
            />
            <div className="deck-placeholder" onClick={drawCard} title="Click to draw next card">
              {/* <span className="deck-emoji">🃏</span> */}
              {/* <div className="deck-label">Deck<br/>({gameState.deck.length - gameState.deckIndex} left)</div> */}
            </div>
            
          </div>

          {/* Bottom: Sort Slots */}
          <SortSlots
            sortSlots={gameState.sortSlots}
            categorySlots={gameState.categorySlots}
            onPlaceItem={handlePlaceItemInSort}
            onPlaceCategory={handlePlaceCategoryInSort}
            onDragStart={setDraggedCard}
            draggedCard={draggedCard}
            isTouchMode={isTouchDevice}
            selectedCard={selectedCard}
            onSlotClick={handleSortSlotClick}
            onSelectItem={handleSelectSortItem}
          />
        </div>
      </div>

      {/* Game Completion Celebration */}
      {gameState.completedCategories.size === CATEGORIES.length && !gameState.drawnCard && (
        <div className="celebration-overlay">
          <div className="celebration-content">
            <div className="celebration-emoji">🎉</div>
            <h2 className="celebration-title">Congratulations!</h2>
            <p className="celebration-message">You've successfully sorted all categories!</p>
            <div className="celebration-stats">
              <p>Total Moves: <span className="stat-value">{gameState.moves}</span></p>
            </div>
            <button className="celebration-button" onClick={() => window.location.reload()}>
              Play Again
            </button>
            <div className="celebration-confetti">
              <span className="confetti-piece">🌟</span>
              <span className="confetti-piece">✨</span>
              <span className="confetti-piece">🎊</span>
              <span className="confetti-piece">🌟</span>
              <span className="confetti-piece">✨</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
