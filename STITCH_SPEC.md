# Stitch Design Specification: Site Monitor Dashboard

This document provides a precise specification and prompt for Google Stitch to redesign the "Site Monitor" dashboard while maintaining the existing code structure and functional requirements.

## 1. Project Context
- **Name:** Site Monitor
- **Target Audience:** Webmasters and SEO specialists.
- **Current Core:** Next.js 14+ (App Router), Tailwind CSS, Supabase.
- **Base Aesthetic:** Dark mode, Glassmorphism, Modern SaaS dashboard.

## 2. Core Components to Redesign

### Screen: Main Dashboard (`/dashboard`)
1. **Header Section:**
   - Title: "Рабочий стол"
   - Subtitle: "Мониторинг ваших веб-сайтов в реальном времени"
   - CTA: "Добавить сайт" button with an icon.

2. **Stats Grid (3 Cards):**
   - Site Count (Icon: Globe)
   - Changes Today (Icon: Zap)
   - Checking Interval (Icon: Clock)

3. **Recent Changes List:**
   - Title: "Последние изменения"
   - "View all" link.
   - List Items:
     - Status Indicator (Color-coded: Added/Green, Removed/Red, Modified/Yellow).
     - Site Name.
     - Change Summary (Snippet of text).
     - Timestamp.
     - Badge for `change_type`.

## 3. Technical Implementation Details (Keep these!)
- **Icons:** Use `lucide-react`.
- **Styling:** Vanilla Tailwind CSS (no custom CSS files if possible).
- **Interactions:** Use hover effects (`hover:scale-105`), active states, and smooth transitions.
- **Glassmorphism:** Use `backdrop-blur-xl`, `bg-white/[0.03]`, and subtle borders `border-white/[0.08]`.

---

## 4. Stitch Prompt (Copy and Paste to Stitch)

**Prompt Area:**
> Redesign the Dashboard screen for a high-end "Site Monitor" SaaS application. 
> 
> **Context:**
> The app tracks changes on websites in real-time. Use a dark, premium aesthetic with deep blues and purples. Apply Glassmorphism (semi-transparent cards with blurs).
> 
> **Screen Requirements:**
> 1. Header: Bold title "Рабочий стол" and a high-contrast primary button "Добавить сайт" (plus icon).
> 2. Stats Grid: Three modern cards showing "Сайтов" (Globe icon), "За сегодня" (Zap icon), and "Интервал" (Clock icon). Use neon glow effects for icons.
> 3. Activity Feed: A list titled "Последние изменения". Each item should represent a website change. 
>    - Include a status dot (Green for Added, Red for Removed, Yellow for Changed).
>    - Show Site Name, a 2-line text summary, and a subtle timestamp.
>    - Add mini-badges mapping to types: "Добавлено", "Удалено", "Изменено".
> 
> **Visual Style:**
> - Minimalist layout but with rich micro-interactions.
> - Premium typography (Inter or modern Sans).
> - Use subtle gradients for backgrounds.
> - Responsive design (Desktop focus but mobile-ready).
> 
> **Export Format:**
> Generate a single Next.js component using Tailwind CSS and Lucide icons. Focus on clean, modular class usage.

---

## 5. How to use this with Anti-Gravity
1. **Upload Screenshot:** Upload your current dashboard screenshot to Stitch.
2. **Apply Prompt:** Paste the prompt from Section 4.
3. **Iterate:** Use Stitch's "Variants" to find the best look.
4. **Link via MCP:** Once you have a design you like, tell Anti-Gravity (me):
   *"Я выбрал дизайн в Stitch (ID: [ID проекта]). Прочитай код из Stitch и обнови src/app/dashboard/page.tsx, сохранив логику работы с Supabase."*
