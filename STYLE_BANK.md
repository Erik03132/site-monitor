# 💎 Style Treasure Chest: Dark Luxury (Aether Edition)

Этот документ содержит спецификации дизайна, который тебе понравился. Ты можешь использовать эти данные для любого нового проекта, чтобы мгновенно получить премиальный вид.

## 🎨 Visual Concept
**Style Name:** Dark Luxury Glassmorphism  
**Core Aesthetic:** Глубокий обсидиановый фон, яркие янтарные акценты, эффекты матового стекла и мягкое неоновое свечение.

---

## 🤖 Image Generation Prompt (AI Mockup)
Используй этот промпт в Midjourney, DALL-E или Antigravity `generate_image`, чтобы получить вдохновение:
> *A high-end SaaS dashboard UI design, Dark luxury aesthetic, deep obsidian background (#050507) with vibrant amber accents (#FF8A00). Glassmorphism effect on cards, 25px backdrop blur, subtle neon glow on icons. Premium typography (Inter), 4k, professional UI/UX, minimalist layout, sophisticated and futuristic.*

---

## 🛠 Technical Specs (Tailwind CSS)

### 1. Color Palette
```javascript
colors: {
    primary: '#FF8A00',          // Amber Glow
    obsidian: '#050507',         // Deep Space
    'obsidian-light': '#0a0a0c', // Card Background
    success: '#10b981',          // Emerald Accent
}
```

### 2. Glassmorphism Effect
Добавь эти стили в свой CSS для создания эффекта стекла:
```css
.glass-card {
    background: rgba(15, 15, 18, 0.6);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.8);
}
```

### 3. Amber Button (Premium)
```css
.amber-button {
    background: #FF8A00;
    color: #050507;
    font-weight: 800;
    box-shadow: 0 4px 20px rgba(255, 138, 0, 0.3);
    transition: all 0.3s ease;
}
.amber-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 30px rgba(255, 138, 0, 0.5);
}
```

---

## 📌 Principles
- **Minimalism**: Минимум лишних линий. Разделение за счет теней и блюра.
- **Typography**: Только `Inter` или `Outfit`. Тонкие начертания для описаний, очень жирные (Black) для заголовков.
- **Glow**: Используй `drop-shadow` с цветом `#FF8A00` для активных элементов.

---
*Сохранено агентом Antigravity по запросу Igor Vasin.*
