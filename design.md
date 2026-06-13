---
name: Academic Utility System
colors:
  surface: '#fcf8ff'
  surface-dim: '#dcd8e5'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f2ff'
  surface-container: '#f0ecf9'
  surface-container-high: '#eae6f4'
  surface-container-highest: '#e4e1ee'
  on-surface: '#1b1b24'
  on-surface-variant: '#464555'
  inverse-surface: '#302f39'
  inverse-on-surface: '#f3effc'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#7e3000'
  on-tertiary: '#ffffff'
  tertiary-container: '#a44100'
  on-tertiary-container: '#ffd2be'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#fcf8ff'
  on-background: '#1b1b24'
  surface-variant: '#e4e1ee'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-bold:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-timer:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  container-max: 1280px
  gutter: 16px
---

## Brand & Style

The design system is engineered for high-utility environment management within academic institutions. It prioritizes clarity, fairness, and administrative efficiency. The target audience includes library staff managing high-traffic periods and students seeking quiet study spaces. 

The aesthetic is **Modern Corporate**, leaning into functional minimalism. It avoids decorative elements in favor of data density and immediate information scent. The visual language evokes a sense of "quiet productivity"—clean lines, generous whitespace between functional groups, and a rigorous adherence to accessibility standards to ensure the UI remains usable under varied lighting conditions common in library environments.

## Colors

The palette is anchored by a scholarly **Indigo** primary and a **Slate** secondary to maintain a professional, institutional feel. The core of the system relies on high-contrast semantic colors to communicate desk status instantly.

- **Primary (#4F46E5):** Used for primary actions, active navigation states, and brand presence.
- **Secondary (#64748B):** Used for supporting text, icons, and non-critical UI borders.
- **Semantic Statuses:** These colors must be used consistently across maps, lists, and badges. 
    - **Occupied (Red):** High urgency, indicates no availability.
    - **Available (Green):** Low urgency, indicates immediate action possible.
    - **Away (Yellow):** Medium urgency, indicates a pending state or temporary absence.
    - **Abandoned (Gray):** Neutral state, indicates a desk requiring staff reset.

## Typography

This design system utilizes **Inter** exclusively to leverage its exceptional legibility in data-heavy environments. The typeface's tall x-height ensures that desk numbers and timers remain readable at small sizes.

Numerical data, specifically countdown timers and desk IDs, should utilize **tabular figures** (`tnum`) to prevent visual jitter during active counting. Headlines use a slight negative letter spacing to maintain a compact, authoritative feel, while labels are uppercase with increased tracking for rapid scanning of categories.

## Layout & Spacing

The system follows a **4px baseline grid** for precise alignment of dense information. 

- **Desktop:** 12-column fluid grid with 24px margins. Content is primarily organized in a split-view: a persistent sidebar for desk lists and a main viewport for the interactive map.
- **Tablet:** 8-column grid. The map becomes the primary focus, with the list view accessible via a collapsible panel or bottom sheet.
- **Mobile:** 4-column grid. Heavy use of card-based layouts and simplified status headers. 

Spacing between related items (e.g., a desk label and its timer) should use `sm` (8px), while spacing between unrelated sections should use `lg` (24px).

## Elevation & Depth

To maintain a clean, academic look, the design system uses **Tonal Layers** and **Low-contrast Outlines** rather than heavy shadows.

- **Surface Level 0:** The main background, using `bg_surface`.
- **Surface Level 1:** White cards and containers, defined by a 1px solid border in Slate-200. No shadow.
- **Surface Level 2 (Active/Hover):** Applied to interactive desk elements or modals. Uses a soft, subtle shadow (0px 4px 12px rgba(0,0,0,0.05)) to suggest "lift" without cluttering the interface.
- **Overlays:** Alert banners use high-saturation backgrounds (from the semantic palette) with zero transparency to ensure maximum contrast and urgency.

## Shapes

The design system uses a **Soft (0.25rem)** roundedness approach. This provides a professional balance—less aggressive than sharp corners, but more structured and "serious" than highly rounded consumer apps.

- **Standard Elements:** 4px radius (Buttons, Input fields, Small badges).
- **Large Elements:** 8px radius (Cards, Map containers, Modals).
- **Interactive Map Desks:** Should follow the 4px radius to reflect the physical geometry of library furniture.

## Components

### Status Badges
Small, high-visibility indicators. Use a light tinted background of the semantic color with dark text of the same hue for maximum legibility (e.g., Light Green background with Dark Green text for "Available").

### Interactive Map Elements (Desks)
Desks should be represented as geometric shapes. The fill color must reflect the current status. Upon selection, a 2px Indigo border (Primary) should appear to indicate focus.

### Timers
Used for "Away" and "Abandoned" states. Timers should be paired with an icon. For "Away" states, the timer should count down; for "Abandoned," it should count up to show how long the desk has been vacant.

### Alert Banners
Full-width banners that appear at the top of the viewport. Use `status_occupied` for urgent system errors or `status_away` for pending administrative tasks. Text must be white or high-contrast against the banner color.

### Lists & Data Tables
Dense layouts with 1px horizontal dividers. Every row should include a leading status indicator (a small 8px circle of the semantic color) to allow staff to scan for issues without reading text.