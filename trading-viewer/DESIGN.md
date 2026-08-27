# DESIGN.md — Apple Pro Dark Design System

A photography-and-artifact-first interface inspired by Apple's Pro web and hardware interfaces. Dark gallery canvases (Pure Black #000000 & Apple Slate #161617) framed by SF Pro typography with negative letter-spacing, subtle translucent frosted chrome, and a single signature Action Blue (#2997ff) for interactive states. UI chrome recedes so the trading charts and lessons can speak with zero distraction.

## Design Tokens

### Colors (Apple Pro Dark)
- **Canvas (Deep Black):** `#000000`
- **Surface Canvas (Tile Base):** `#161617`
- **Surface Card (Tile 1):** `#1d1d1f`
- **Surface Elevated (Tile 2):** `#252527`
- **Surface Translucent Capsule:** `rgba(255, 255, 255, 0.08)`
- **Surface Hover:** `rgba(255, 255, 255, 0.12)`
- **Primary Action (Apple Dark Blue):** `#2997ff`
- **Primary Hover / Active:** `#0071e3`
- **Text Body / On Dark:** `#f5f5f7`
- **Text Muted (80%):** `#a1a1a6`
- **Text Subdued (48%):** `#86868b`
- **Hairline Divider / Border:** `rgba(255, 255, 255, 0.10)`
- **Hairline Subtle:** `rgba(255, 255, 255, 0.06)`
- **Success / Completed:** `#30d158`
- **Warning / Bookmark:** `#ffd60a`
- **Danger:** `#ff453a`

### Typography (SF Pro System Scale)
- **Hero Display:** `SF Pro Display, -apple-system, sans-serif`, `fontSize: 48px`, `fontWeight: 600`, `letterSpacing: -0.025em`, `lineHeight: 1.08`
- **Display Medium:** `SF Pro Display, -apple-system, sans-serif`, `fontSize: 32px`, `fontWeight: 600`, `letterSpacing: -0.02em`, `lineHeight: 1.15`
- **Title Large:** `SF Pro Display, -apple-system, sans-serif`, `fontSize: 22px`, `fontWeight: 600`, `letterSpacing: -0.015em`
- **Body Regular:** `SF Pro Text, -apple-system, sans-serif`, `fontSize: 15px`, `fontWeight: 400`, `lineHeight: 1.47`, `letterSpacing: -0.01em`
- **Body Medium / Strong:** `SF Pro Text, -apple-system, sans-serif`, `fontSize: 15px`, `fontWeight: 500`, `letterSpacing: -0.01em`
- **Caption / Label:** `SF Pro Text, -apple-system, sans-serif`, `fontSize: 12px`, `fontWeight: 500`, `letterSpacing: 0`
- **Mono Technical:** `SF Mono, monospace`, `fontSize: 12px`

### Radii & Geometry
- **Capsule / Pill:** `9999px` (Buttons, segmented controls, status badges)
- **Tile Card Large:** `22px` (Hero containers, lesson preview cards)
- **Utility / Control:** `12px` (Buttons, input boxes, toolbars)
- **Thumb:** `8px` (Filmstrip preview thumbnails)

### Elevation & Glassmorphism
- **Frosted Glass:** `backdrop-filter: blur(20px) saturate(180%)`, background `rgba(22, 22, 23, 0.82)`, border `1px solid rgba(255, 255, 255, 0.08)`
- **Product Elevation:** `box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7)` on chart frames resting on dark canvas.
