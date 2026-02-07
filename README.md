# 🃏 Category Sort Game  

A simple sorting game built with **React + Vite**.

👉 **Play it here:**  
https://mihaelalazetic.github.io/category-game/

---

## 🎮 What the game is  

Category Sort is a card-based puzzle game where you organize items into the right categories.

You draw cards from a deck that contains:
- **Category cards** (Animals, Fruits, Ocean, etc.)
- **Item cards** that belong to those categories  

Your goal is to place each item under its correct category using the available slots.

It’s meant to be:
- easy to understand  
- relaxed rather than stressful  
- more about organizing than speed  

---

## 🃏 How you play  

1. Draw a card from the deck  
2. If it’s a **category**, place it in one of the top slots  
3. If it’s an **item**, place it under the matching category  
4. Use the bottom slots as temporary sorting space  
5. When all items of a category are collected, that category clears  
6. Keep going until all cards are sorted  

There’s a move counter so you can see how efficiently you played.

---

## 📱 Controls  

**Desktop**
- Drag and drop cards with your mouse  

**Mobile / Tablet**
- Tap to select a card  
- Tap again to place it  
- No awkward dragging — just simple taps  

The layout adapts to smaller screens.

---

## 🎨 Design  

The game uses:
- gradient backgrounds  
- emoji-style cards  
- simple animations and card flips  
- color-coded areas for different categories  

The focus is on clarity and a clean, friendly look.

---

## 🛠️ Tech details  

Built with:
- **React 19**  
- **Vite**  
- **CSS (responsive layout)**  

State is managed with React hooks (`useState`, `useEffect`) and tracks:
- the deck  
- drawn cards  
- category slots  
- sorting slots  
- completed categories  
- move count  

---

## ▶️ Run locally  

```bash
npm install
npm run dev
