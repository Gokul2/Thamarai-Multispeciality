---
name: Compassionate Clinical Excellence
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3d4947'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#006a3c'
  on-tertiary: '#ffffff'
  tertiary-container: '#08864e'
  on-tertiary-container: '#f6fff5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#8ff8b4'
  tertiary-fixed-dim: '#73db9a'
  on-tertiary-fixed: '#00210f'
  on-tertiary-fixed-variant: '#00522d'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style
The design system is built on the pillars of **Trust, Precision, and Accessibility**. Designed for a multispeciality environment, it balances high-end clinical professionalism with the warmth required for patient-centric care. 

The aesthetic follows a **Modern Corporate** style with leanings toward **Minimalism**. It prioritizes clarity and calm through heavy whitespace, high-quality healthcare imagery, and a UI that feels light and breathable. The goal is to reduce cognitive load for patients and provide a high-efficiency interface for medical staff.

## Colors
The palette uses **Teal (#0D9488)** as the primary brand anchor, symbolizing healing and stability. **Secondary Blue (#2563EB)** is utilized for critical actions and navigational cues, providing a sense of technical competence. **Soft Green (#86EFAC)** acts as an accent for success states and health-positive indicators. 

The background strategy relies on a "Super-White" philosophy—using `#FFFFFF` for primary cards and `#F8FAFC` for page backgrounds to maintain a sterile yet welcoming clinical atmosphere. Neutral greys should be cool-toned to remain cohesive with the Teal and Blue.

## Typography
This design system utilizes **Inter** exclusively to ensure a systematic, utilitarian, and highly legible experience across all touchpoints. 

The hierarchy is strictly enforced:
- **Headlines:** Use Bold and Semi-Bold weights with tight letter-spacing to create an authoritative presence.
- **Body Text:** Standardizes on a 16px base for optimal readability for elderly patients. 
- **Labels:** Used for metadata like doctor specialties or department names, employing Medium weight and slight tracking for clarity at small sizes.

## Layout & Spacing
The system employs a **Fluid Grid** model based on an 8px square baseline. 

- **Desktop:** 12-column grid with 64px outer margins and 24px gutters. Content should be centered with a max-width of 1280px to prevent excessive line lengths.
- **Tablet:** 8-column grid with 32px margins.
- **Mobile:** 4-column grid with 20px margins.

Generous vertical padding (minimum 80px between sections on desktop) is mandatory to reflect the "Quality Healthcare with Compassion" brand promise, ensuring the UI never feels cramped or urgent.

## Elevation & Depth
Depth is created through **Ambient Shadows** and **Tonal Layers** rather than harsh borders. 

- **Surface Level 0:** The primary page background (`#F8FAFC`).
- **Surface Level 1 (Cards/Modals):** Pure white (`#FFFFFF`) with a very soft, diffused shadow. 
- **Shadow Profile:** Use a "Clinical Blur"—an Y-offset of 4px, a blur of 20px, and a 5% opacity of the Primary Teal color (`#0D9488`). This subtle tinting of the shadow makes the interface feel more cohesive and modern than standard black shadows.
- **Interaction:** On hover, cards should lift slightly (Y-offset 8px, blur 30px) to provide tactile feedback.

## Shapes
The shape language is defined by **Softness and Safety**. All interactive elements and containers utilize a **Rounded (Level 2)** configuration.

- **Primary Buttons & Inputs:** 0.5rem (8px) corner radius.
- **Large Cards & Featured Containers:** 1rem (16px) corner radius.
- **Specialty Chips/Badges:** Fully rounded (pill-shaped) to distinguish them from actionable buttons.
- **Imagery:** Medical photography should always feature rounded corners to maintain the friendly, compassionate visual narrative.

## Components

### Buttons
- **Primary:** Solid Primary Teal with white text. High-contrast, 8px radius.
- **Secondary:** Outlined Blue (#2563EB) for secondary actions like "View Records."
- **Ghost:** Minimal Teal text for less critical navigation.

### Input Fields
Inputs use a light grey stroke (#E2E8F0) that transitions to Primary Teal on focus. Labels sit clearly above the field. Error states use a soft red (#EF4444) but maintain the same 8px radius.

### Cards
Cards are the primary organizational unit. They feature 16px padding and the "Clinical Blur" shadow. For doctor profiles, use a top-aligned circular or soft-square image mask.

### Chips & Badges
Used for hospital departments (e.g., Cardiology, Pediatrics). These should have a background of 10% opacity of the Primary Teal or Secondary Blue with centered text in the solid parent color.

### Additional Components
- **Appointment Scheduler:** A clean, calendar-based interface using the Accent Green to highlight available slots.
- **Progress Steppers:** For patient onboarding or lab report stages, using thin lines and Primary Teal nodes.
- **Emergency CTA:** A fixed floating action button (FAB) or high-visibility header item using a distinct contrast to ensure immediate accessibility.