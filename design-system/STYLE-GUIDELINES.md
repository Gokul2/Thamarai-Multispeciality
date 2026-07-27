# Compassionate Clinical Excellence

## Brand & Style
The design system is built on the pillars of **Trust, Precision, and Accessibility**. Designed for a multispeciality environment, it balances high-end clinical professionalism with the warmth required for patient-centric care. 

The aesthetic follows a **Modern Corporate** style with leanings toward **Minimalism**. It prioritizes clarity and calm through heavy whitespace, high-quality healthcare imagery, and a UI that feels light and breathable. The goal is to reduce cognitive load for patients and provide a high-efficiency interface for medical staff.

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