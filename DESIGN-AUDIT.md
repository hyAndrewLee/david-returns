# Design Audit: Schedule Flow & Dashboard vs. Landing Page

## Overview

This audit compares the design patterns of the **landing page** (`app/page.tsx`) and **marketing pages** against the **dashboard** (`app/(customer)/dashboard/page.tsx`) and **schedule/submit return flow** (`app/(customer)/schedule/page.tsx`) to identify inconsistencies and bring them into alignment.

---

## Screenshots: Reference Pages (Design System Source)

| Page | Screenshot | Key Patterns |
|------|-----------|-------------|
| Landing Page | `design-audit-screenshots/landing-page.png` | `font-display` serif headings, uppercase eyebrow labels, `rounded-2xl` cards, `max-w-6xl` container, warm backgrounds |
| For Buildings | `design-audit-screenshots/for-buildings.png` | Numbered steps with serif font, card hover effects (`hover:-translate-y-0.5`), consistent border/shadow patterns |
| Sign In | `design-audit-screenshots/signin-page.png` | Split layout, serif display heading, clean form inputs with rounded borders |
| Profile | `design-audit-screenshots/profile-page.png` | `max-w-7xl` container, gradient background, card-based sections, sidebar layout |
| Orders | `design-audit-screenshots/orders-page.png` | `max-w-3xl`, clean header with back arrow, card-based order list |

## Screenshots: Pages to Redesign (Before)

| Page | Screenshot | Issues Identified |
|------|-----------|------------------|
| Dashboard | `design-audit-screenshots/dashboard-current.png` | Missing `font-display` on heading, no eyebrow label, header narrower than landing |
| Schedule Step 1 | `design-audit-screenshots/schedule-step1-selected.png` | No serif heading, step icons use generic circles |
| Schedule Step 2 | `design-audit-screenshots/schedule-step2-current.png` | Consistent but address card could use better typography |
| Schedule Step 3 | `design-audit-screenshots/schedule-step3-current.png` | Pickup method cards OK but missing subtle hover animations |
| Schedule Step 4 | `design-audit-screenshots/schedule-step4-current.png` | Plan cards good, but heading style differs from landing |
| Schedule Step 5 | `design-audit-screenshots/schedule-step5-with-item.png` | Add item area looks sparse, could be more engaging |
| Schedule Step 6 | `design-audit-screenshots/schedule-step6-checkout.png` | Checkout looks good but edit buttons navigate AWAY (bug) |
| Edit Bug | `design-audit-screenshots/schedule-edit-bug.png` | Clicking Edit takes user back to step 1 completely — major UX bug |

---

## Design System Patterns (from Landing Page)

### Typography
- **Display headings**: `font-display text-3xl+ font-normal tracking-tight` (DM Serif Display)
- **Body text**: Geist Sans, `text-muted-foreground`, relaxed line-height
- **Eyebrow labels**: `text-xs font-semibold uppercase tracking-widest text-accent-warm`
- **Section headings**: Use serif `font-display` for emotional weight

### Colors
- **Background**: `bg-background` (warm off-white, oklch 0.98)
- **Alt background**: `bg-background-alt` (slightly darker cream)
- **Accent warm**: `text-accent-warm` (burnt orange)
- **Foreground buttons**: `bg-foreground text-background` (dark with light text)
- **Orange accent**: Used for CTAs, badges, highlights (`orange-500`)

### Components
- **Cards**: `rounded-2xl border border-border bg-card p-8 shadow-sm`
- **Hover effects**: `hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200`
- **Buttons**: `rounded-full bg-foreground px-8 py-3.5 text-sm font-medium text-background`
- **Secondary buttons**: `rounded-full border-2 border-border px-8 py-3.5`

### Layout
- **Max width**: `max-w-6xl` (landing), `max-w-3xl` (content pages)
- **Section padding**: `py-20 sm:py-28`
- **Container padding**: `px-4 sm:px-6`

---

## Changes Made

### 1. Typography Alignment
**Why**: The schedule and dashboard headings use plain sans-serif (`text-2xl font-semibold`), while the landing page uses the distinctive `font-display` serif for all section headings. This creates a jarring disconnect when transitioning from marketing to the app.

**Change**: Added `font-display` class to main headings in schedule steps and dashboard welcome section. Changed from `font-semibold` to `font-normal tracking-tight` to match the serif font styling.

### 2. Edit Bug Fix (Checkout Step)
**Why**: Clicking "Edit" on the checkout page calls `setCurrentStep(1)` which navigates the user completely away from checkout. They lose their review context and have to click through all steps again. This is a major UX bug.

**Change**: Added a `returnToStep` state to `ScheduleContext`. When user clicks Edit from checkout, we set `returnToStep = 6`. The Continue button now checks for `returnToStep` and jumps directly back to checkout instead of going to the next sequential step. This lets users make quick edits without losing their place.

### 3. Validation
**Why**: Users can proceed through steps without proper validation. No inline error messages appear — the `canProceed()` function only disables the Continue button but doesn't explain why.

**Change**: Added inline validation feedback with error messages that appear below fields when validation fails on Continue. Added `validateCurrentStep()` to show contextual errors before advancing.

### 4. Step Heading Eyebrow Labels
**Why**: The landing page uses uppercase eyebrow labels above headings (e.g., "HOW IT WORKS" above "Three steps. Zero hassle."). The schedule flow has no such visual hierarchy.

**Change**: Added subtle eyebrow labels to each schedule step (e.g., "STEP 1 OF 6" or the step name) using the `text-xs font-semibold uppercase tracking-widest text-accent-warm` pattern from the landing page.

### 5. Card Hover Effects
**Why**: Landing page cards have subtle `hover:-translate-y-0.5 hover:shadow-lg` animations. Schedule step cards (date picker, pickup method, plan) lack these micro-interactions.

**Change**: Added consistent hover transforms to interactive cards in the schedule flow.

### 6. Dashboard CTA Enhancement
**Why**: The "Submit Return" CTA on the dashboard uses a dashed border card, which feels like a placeholder/empty state rather than an intentional CTA. The landing page uses bold, high-contrast CTAs.

**Change**: Upgraded the CTA card to use a gradient background and stronger visual treatment, matching the warmth and authority of landing page CTAs.

---

---

## After Screenshots

| Page | Before | After | What Changed |
|------|--------|-------|-------------|
| Dashboard | `dashboard-current.png` | `dashboard-after.png` | Added `font-display` serif heading, "DASHBOARD" eyebrow label, upgraded CTA from dashed-border card to gradient card with dark rounded-full button matching landing page |
| Schedule Step 1 | `schedule-step1-current.png` | `schedule-step1-after.png` | Added "SCHEDULE" eyebrow label, serif heading, completed step icons now show checkmarks, accent-warm color system |
| Schedule Step 2 | `schedule-step2-current.png` | `schedule-step2-after.png` | Added "ADDRESS" eyebrow label, serif heading |
| Schedule Step 3 | `schedule-step3-current.png` | `schedule-step3-after.png` | Added "PICKUP METHOD" eyebrow label, serif heading, card hover `-translate-y-0.5` lift effect |
| Schedule Step 4 | `schedule-step4-current.png` | `schedule-step4-after.png` | Added "PLAN" eyebrow label, serif heading, card hover lift effects |
| Schedule Step 5 | `schedule-step5-current.png` | `schedule-step5-after.png` | Added "ITEMS" eyebrow label, serif heading |
| Checkout | `schedule-step6-checkout.png` | `schedule-step6-after.png` | Added "REVIEW & CONFIRM" eyebrow label, serif heading, hover shadows on detail cards, Edit buttons use `accent-warm` color |
| Edit Bug | `schedule-edit-bug.png` | `schedule-edit-fix-after.png` | **Fixed**: Clicking Edit now shows "Save & return" button. Clicking it returns to checkout instead of losing context |
| Return to Checkout | N/A | `schedule-returned-to-checkout.png` | **New**: After editing, user is returned to checkout with all data preserved |

---

## Bug Fixes

### 1. Edit at Checkout Navigating Away (FIXED)
**Before**: Clicking "Edit" on the checkout review page called `setCurrentStep(1)`, sending the user back to step 1. They had to click through ALL steps again to get back to checkout.

**After**: Added `returnToStep` state + `editFromCheckout()` handler. When editing from checkout:
- The button text changes to "Save & return" (instead of "Continue")
- The back button changes to "Cancel" 
- Clicking "Save & return" jumps directly back to checkout (step 6)
- Clicking "Cancel" also returns to checkout without changes

### 2. Validation (FIXED)
**Before**: The `canProceed()` function only disabled the Continue button — no error messages appeared.

**After**: Added explicit validation checks in `handleNextStep()` for every step:
- Step 1: Validates date and time window selected
- Step 2: Validates name, phone, address, and ZIP
- Step 3: Validates pickup method selected
- Step 4: Validates plan selected
- Step 5: Validates at least one item added
- Errors are cleared when advancing successfully

---

## Design Tokens Used (from `globals.css`)

| Token | Value | Usage |
|-------|-------|-------|
| `--accent-warm` | `oklch(0.62 0.17 45)` | Eyebrow labels, CTA accents, step indicators |
| `--accent-warm-light` | `oklch(0.93 0.04 55)` | Background blobs, subtle highlights |
| `--accent-green-light` | `oklch(0.94 0.03 155)` | Secondary background blobs |
| `--font-display` | DM Serif Display | Section headings, hero text |
| `--font-sans` | Geist | Body text, labels, buttons |

## Files Modified

| File | Changes |
|------|---------|
| `app/(customer)/schedule/ScheduleContext.tsx` | Added `returnToStep` state, `editFromCheckout()`, validation in `handleNextStep()`, updated `handlePreviousStep()` |
| `app/(customer)/schedule/page.tsx` | Updated step stepper (checkmarks, accent-warm colors), "Save & return" button text, button hover effects |
| `app/(customer)/schedule/steps/ScheduleStep.tsx` | Added eyebrow label, `font-display` heading |
| `app/(customer)/schedule/steps/AddressStep.tsx` | Added eyebrow label, `font-display` heading |
| `app/(customer)/schedule/steps/PickupMethodStep.tsx` | Added eyebrow label, `font-display` heading, hover lift effects |
| `app/(customer)/schedule/steps/PlanStep.tsx` | Added eyebrow label, `font-display` heading, hover lift effects |
| `app/(customer)/schedule/steps/ItemsStep.tsx` | Added eyebrow label, `font-display` heading |
| `app/(customer)/schedule/steps/CheckoutStep.tsx` | Added eyebrow label, `font-display` heading, switched from `setCurrentStep` to `editFromCheckout`, hover shadows, accent-warm Edit buttons |
| `components/customer/UserDashboard.tsx` | Added eyebrow label, `font-display` heading, upgraded CTA card with gradient background and dark button, accent-warm colors, hover lift effects on order cards |
