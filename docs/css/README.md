# CSS Documentation Overview

## CSS Architecture

DiceTales uses a modular CSS architecture with separate stylesheets for different components and features.

### CSS Files

#### `main.css` - Core Application Styles
- **Purpose**: Base styles, layout system, typography
- **Contains**: Global styles, CSS variables, layout containers
- **Size**: ~500 lines
- **Key Features**: CSS Grid/Flexbox layouts, responsive design, dark theme

#### `character.css` - Character Creation Styles  
- **Purpose**: Character creation interface styling
- **Contains**: Form controls, stat displays, class selection cards
- **Size**: ~300 lines
- **Key Features**: Interactive forms, progress indicators, tooltips

#### `dice.css` - Dice System Styles
- **Purpose**: 3D dice animations and rolling interface
- **Contains**: 3D transforms, animations, dice representations
- **Size**: ~200 lines  
- **Key Features**: CSS 3D transforms, keyframe animations, physics simulation

#### `responsive.css` - Mobile and Responsive Design
- **Purpose**: Mobile optimization and responsive breakpoints
- **Contains**: Media queries, mobile-specific layouts
- **Size**: ~150 lines
- **Key Features**: Mobile-first design, touch-friendly interfaces

## Design System

### Color Palette
```css
:root {
    --primary-color: #2c5530;      /* Forest green */
    --secondary-color: #8B4513;    /* Saddle brown */
    --accent-color: #DAA520;       /* Goldenrod */
    --background-color: #1a1a1a;   /* Dark background */
    --text-color: #e0e0e0;         /* Light text */
    --error-color: #dc3545;        /* Red */
    --success-color: #28a745;      /* Green */
    --warning-color: #ffc107;      /* Yellow */
}
```

### Typography
- **Primary Font**: 'Segoe UI', system fonts
- **Fantasy Font**: 'Papyrus', 'Herculanum' for headings  
- **Monospace Font**: 'Courier New' for dice/stats

### Breakpoints
```css
/* Mobile first approach */
@media (min-width: 768px)  { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1200px) { /* Large desktop */ }
```

## Layout System

### CSS Grid
- **Main Layout**: CSS Grid for screen layout
- **Component Layout**: Flexbox for component internals
- **Responsive**: Automatic grid adaptation

### Flexbox Usage
- **Navigation**: Flex layouts for menus
- **Forms**: Flex forms for character creation
- **Cards**: Flex cards for class/setting selection

## Animation Framework

### Keyframe Animations
```css
@keyframes rollDice {
    0% { transform: rotateX(0) rotateY(0) rotateZ(0); }
    50% { transform: rotateX(180deg) rotateY(180deg) rotateZ(180deg); }
    100% { transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg); }
}
```

### Transition System
- **Screen Transitions**: 0.3s ease-in-out
- **Button Interactions**: 0.2s ease
- **Modal Animations**: 0.25s cubic-bezier

### 3D Effects
- **Dice**: CSS 3D transforms for realistic rolling
- **Cards**: Perspective transforms for depth
- **UI Elements**: Subtle 3D effects for immersion

## Component Styles

### Buttons
```css
.btn {
    padding: 12px 24px;
    border-radius: 6px;
    transition: all 0.2s ease;
    cursor: pointer;
}

.btn-primary { background: var(--primary-color); }
.btn-secondary { background: var(--secondary-color); }
```

### Forms
- **Input Styling**: Consistent form elements
- **Validation States**: Error/success indicators  
- **Interactive Elements**: Hover/focus states

### Cards
- **Character Classes**: Class selection cards
- **Campaign Settings**: Setting selection cards
- **Stats Display**: Character statistics cards

## Responsive Design

### Mobile Optimization
- **Touch Targets**: Minimum 44px tap targets
- **Font Scaling**: Responsive typography
- **Layout Adaptation**: Mobile-specific layouts
- **Gesture Support**: Touch and swipe interactions

### Tablet Adaptations
- **Intermediate Layouts**: Between mobile and desktop
- **Orientation Support**: Portrait and landscape
- **Touch Optimization**: Larger interactive elements

### Desktop Features
- **Hover Effects**: Mouse interaction feedback
- **Keyboard Navigation**: Focus indicators
- **Large Screen Layouts**: Optimized for large displays

## Accessibility Features

### Visual Accessibility
- **High Contrast**: Accessible color combinations
- **Focus Indicators**: Clear focus outlines
- **Text Scaling**: Supports browser zoom
- **Color Independence**: Not solely relying on color

### Motion Accessibility
```css
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

## Performance Optimizations

### CSS Performance
- **Efficient Selectors**: Avoiding complex selectors
- **GPU Acceleration**: Using transform3d for animations
- **Critical CSS**: Inlining critical styles
- **CSS Compression**: Minified production styles

### Animation Performance
- **Hardware Acceleration**: Using CSS transforms
- **Animation Layering**: Promoting elements to composite layers
- **Frame Rate**: Maintaining 60fps animations
- **Animation Cleanup**: Removing completed animations

## Theming System

### Dark Theme (Default)
- **Background**: Dark colors for reduced eye strain
- **Text**: High contrast light text
- **Accents**: Warm accent colors for fantasy theme

### Light Theme Support
```css
[data-theme="light"] {
    --background-color: #ffffff;
    --text-color: #333333;
    /* Other light theme variables */
}
```

### Theme Switching
- **CSS Variables**: Dynamic theme switching
- **Smooth Transitions**: Animated theme changes
- **Persistence**: Remembers user theme preference

## Browser Compatibility

### Modern Browser Support
- **Chrome**: Full support for all features
- **Firefox**: Full support with vendor prefixing
- **Safari**: Support with webkit prefixes
- **Edge**: Modern Edge full support

### Fallbacks
- **CSS Grid**: Flexbox fallbacks for older browsers
- **3D Transforms**: 2D fallbacks where needed
- **Custom Properties**: Fallback values provided

## Development Workflow

### CSS Organization
```
css/
├── main.css        (Core styles)
├── character.css   (Character creation)
├── dice.css        (Dice system)
└── responsive.css  (Mobile/responsive)
```

### Build Process
- **Development**: Separate CSS files for debugging
- **Production**: Concatenated and minified CSS
- **Source Maps**: Available for debugging
- **Autoprefixer**: Automatic vendor prefixing

*The CSS system provides a cohesive, performant, and accessible visual experience that supports the fantasy gaming theme while maintaining modern web standards.*
