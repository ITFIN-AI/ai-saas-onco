# Welcome Page - AI Oncology Assistant

## Overview

A guest-accessible welcome page inspired by the [National Cancer Institute (NIO)](https://nio.gov.pl/) design, featuring a clean, professional interface for oncology consultation access.

## Features

### 🎨 Design Elements
- **NIO chat interface layout**: Left sidebar with main content area
- **Official NIO logo**: Positioned in left sidebar header
- **Historia section**: FAQ and question history in left sidebar
- **NIO-inspired color scheme**: White, gray, and red (#d32f2f)
- **Professional typography**: Poppins font family
- **Responsive design**: Adaptive sidebar width and content scaling
- **Bottom separator**: Medical disclaimer with emergency contact info
- **Navigation links**: "Pomoc" and "O nas" in sidebar footer

### 🔐 Guest Access
- No authentication required
- Direct access via `/welcome` route
- Email and access code validation
- Form validation with error handling

### ✨ User Experience
- **Three-step process**:
  1. Email and access code entry
  2. Terms and conditions acceptance
  3. Question submission with smooth transitions
- **Smooth transitions**: CSS-based slide animations between all steps
- **Loading states**: Visual feedback during form submission
- **Accessibility**: Focus states and keyboard navigation

## Usage

### Accessing the Page
Navigate to `/welcome` in your browser to access the guest welcome page.

### Form Flow
1. **Initial Form**:
   - Enter email address
   - Enter access code (minimum 6 characters)
   - Click "Rozpocznij" (Start)

2. **Terms Acceptance**:
   - Read the terms and conditions from NIO Radiotherapy Department
   - Medical disclaimer and emergency contact information
   - Click "Potwierdzam" (I Confirm)

3. **Question Form**:
   - After accepting terms, the form smoothly transitions
   - Enter your oncology-related question
   - Click "Wyślij pytanie" (Send Question)

## Technical Implementation

### Components
- `Welcome.tsx` - Main React component
- `Welcome.scss` - Styled with SCSS using NIO color palette
- Ant Design components for form elements

### Key Features
- Three-step workflow with state management
- Form validation with Polish error messages
- Terms and conditions with medical disclaimer
- Responsive design breakpoints
- CSS animations for smooth transitions between steps
- TypeScript for type safety

### Color Palette
```scss
$primary-red: #d32f2f;
$primary-red-hover: #b71c1c;
$text-primary: #2c2c2c;
$text-secondary: #666666;
$background-white: #ffffff;
$background-light: #fafafa;
```

### Animation Classes
- `.slide-in` - Element fades in with subtle scale effect
- `.slide-out` - Element fades out with scale down effect
- `.fadeInScale` - Elements fade in with scaling animation
- `.fadeOutScale` - Elements fade out with scaling animation

## File Structure
```
apps/web-app/src/pages/Welcome/
├── Welcome.tsx       # Main component
├── Welcome.scss      # Styling
└── index.ts          # Export file

apps/web-app/src/assets/images/
└── nio-logo.svg      # Official NIO logo
```

## Integration
The Welcome page is integrated into the main app routing in `App.tsx`:
- Route: `/welcome`
- No authentication required
- Accessible to guest users

## Future Enhancements
- [ ] API integration for access code validation
- [ ] Question submission to backend
- [ ] Multi-language support
- [ ] Enhanced accessibility features
- [ ] Analytics tracking
