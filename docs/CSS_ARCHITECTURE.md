# DiceTales CSS Architecture Guide

This document details the CSS styling architecture, design system, and responsive patterns used in DiceTales.

## 🎨 CSS File Overview

### File Structure and Responsibilities
```
css/
├── main.css          # Core application styles and design system
├── character.css     # Character creation and sheet styling
├── dice.css          # Dice system animations and feedback
├── evaluation.css    # DM evaluation interface styling
└── responsive.css    # Mobile and tablet responsive design
```

## 🏠 main.css - Core Application Styles

### Design System Foundation
```css
/* Color Palette */
:root {
    /* Primary Colors */
    --bg-primary: #1a1a2e;           /* Deep navy background */
    --bg-secondary: #16213e;         /* Darker navy for panels */
    --bg-tertiary: #0f1419;          /* Darkest for containers */
    
    /* Accent Colors */
    --accent-primary: #9d4edd;       /* Purple primary */
    --accent-secondary: #c77dff;     /* Light purple */
    --accent-tertiary: #7209b7;      /* Dark purple */
    
    /* Text Colors */
    --text-primary: #ffffff;         /* Primary text */
    --text-secondary: #b8c5d6;       /* Secondary text */
    --text-muted: #8892b0;           /* Muted text */
    
    /* State Colors */
    --success: #64ffda;              /* Success/positive */
    --warning: #ffb74d;              /* Warning/caution */
    --error: #ff6b6b;                /* Error/danger */
    --info: #4fc3f7;                 /* Information */
    
    /* UI Elements */
    --border-color: #2d3748;         /* Border color */
    --shadow-color: rgba(0, 0, 0, 0.3); /* Drop shadow */
    --overlay-bg: rgba(0, 0, 0, 0.8); /* Modal overlay */
    
    /* Typography */
    --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-mono: 'Fira Code', 'Consolas', monospace;
    
    /* Spacing Scale */
    --space-xs: 0.25rem;    /* 4px */
    --space-sm: 0.5rem;     /* 8px */
    --space-md: 1rem;       /* 16px */
    --space-lg: 1.5rem;     /* 24px */
    --space-xl: 2rem;       /* 32px */
    --space-xxl: 3rem;      /* 48px */
    
    /* Border Radius */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;
    
    /* Transitions */
    --transition-fast: 0.15s ease;
    --transition-normal: 0.3s ease;
    --transition-slow: 0.5s ease;
}
```

### Layout System
```css
/* Main Application Grid */
.app {
    display: grid;
    grid-template-rows: auto 1fr;
    min-height: 100vh;
    background: var(--bg-primary);
    font-family: var(--font-primary);
}

/* Game Screen Layout */
.game-screen {
    display: grid;
    grid-template-columns: 1fr 300px;
    grid-template-rows: 1fr auto;
    gap: var(--space-lg);
    height: calc(100vh - 60px);
}

/* Responsive Grid Areas */
.game-content { grid-area: content; }
.character-panel { grid-area: sidebar; }
.action-panel { grid-area: actions; }
```

### Component Styles
```css
/* Button System */
.btn {
    padding: var(--space-sm) var(--space-md);
    border: none;
    border-radius: var(--radius-md);
    font-family: inherit;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
}

.btn-primary {
    background: var(--accent-primary);
    color: var(--text-primary);
}

.btn-primary:hover {
    background: var(--accent-secondary);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--shadow-color);
}

/* Modal System */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--overlay-bg);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: var(--bg-secondary);
    border-radius: var(--radius-lg);
    padding: var(--space-xl);
    max-width: 90vw;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 40px var(--shadow-color);
}
```

### Animation System
```css
/* Loading Screen Animations */
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Smooth Transitions */
.fade-in {
    animation: slideIn var(--transition-normal) ease-out;
}

.loading-dice {
    animation: spin 2s linear infinite;
    font-size: 2rem;
}
```

## 👤 character.css - Character Interface Styles

### Character Creation Wizard
```css
/* Multi-Step Creation Flow */
.character-creation-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-xl);
    min-height: 100vh;
    background: linear-gradient(
        135deg,
        var(--bg-primary) 0%,
        var(--bg-secondary) 100%
    );
}

/* Step Indicator */
.step-indicator {
    display: flex;
    gap: var(--space-md);
    margin-bottom: var(--space-xl);
}

.step {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-lg);
    background: var(--bg-tertiary);
    color: var(--text-muted);
    transition: all var(--transition-normal);
}

.step.active {
    background: var(--accent-primary);
    color: var(--text-primary);
    transform: scale(1.05);
}

.step.completed {
    background: var(--success);
    color: var(--bg-primary);
}
```

### Campaign Setting Cards
```css
/* Setting Selection Grid */
.setting-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--space-lg);
    width: 100%;
    max-width: 1200px;
}

.setting-card {
    background: var(--bg-secondary);
    border: 2px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    cursor: pointer;
    transition: all var(--transition-normal);
    position: relative;
    overflow: hidden;
}

.setting-card:hover {
    border-color: var(--accent-primary);
    transform: translateY(-4px);
    box-shadow: 0 8px 25px var(--shadow-color);
}

.setting-card.selected {
    border-color: var(--accent-secondary);
    background: linear-gradient(
        135deg,
        var(--bg-secondary) 0%,
        var(--accent-primary) 100%
    );
}

/* Setting Icon */
.setting-icon {
    font-size: 3rem;
    margin-bottom: var(--space-md);
    display: block;
    text-align: center;
}
```

### Character Stats Interface
```css
/* Point-Buy Stat Allocation */
.stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-md);
    margin: var(--space-lg) 0;
}

.stat-item {
    background: var(--bg-tertiary);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    text-align: center;
}

.stat-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    margin-top: var(--space-sm);
}

.stat-button {
    width: 30px;
    height: 30px;
    border: none;
    border-radius: 50%;
    background: var(--accent-primary);
    color: var(--text-primary);
    cursor: pointer;
    transition: all var(--transition-fast);
}

.stat-button:hover {
    background: var(--accent-secondary);
    transform: scale(1.1);
}

.stat-button:disabled {
    background: var(--border-color);
    cursor: not-allowed;
    transform: none;
}

/* Stat Value Display */
.stat-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--accent-secondary);
    margin: 0 var(--space-sm);
    min-width: 40px;
}

.stat-modifier {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-top: var(--space-xs);
}
```

## dice.css - Dice System Styles

### Dice Display Interface
```css
/* Dice Container */
.dice-container {
    background: var(--bg-secondary);
    border: 2px solid var(--accent-primary);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    margin: var(--space-md) 0;
    text-align: center;
    position: relative;
}

/* Dice Animation */
.dice-roll {
    font-size: 4rem;
    animation: diceRoll 0.6s ease-in-out;
    display: inline-block;
}

@keyframes diceRoll {
    0% { transform: rotate(0deg) scale(1); }
    25% { transform: rotate(90deg) scale(1.2); }
    50% { transform: rotate(180deg) scale(1.4); }
    75% { transform: rotate(270deg) scale(1.2); }
    100% { transform: rotate(360deg) scale(1); }
}

/* Roll Result Display */
.roll-result {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-md);
    margin: var(--space-md) 0;
}

.roll-value {
    font-size: 2rem;
    font-weight: bold;
    color: var(--accent-secondary);
    padding: var(--space-sm) var(--space-md);
    background: var(--bg-tertiary);
    border-radius: var(--radius-md);
    min-width: 60px;
}

.roll-modifier {
    font-size: 1.2rem;
    color: var(--text-secondary);
}

.roll-total {
    font-size: 1.8rem;
    font-weight: bold;
    color: var(--success);
    padding: var(--space-sm) var(--space-md);
    background: var(--bg-primary);
    border-radius: var(--radius-md);
    border: 2px solid var(--success);
}
```

### Dice Type Selection
```css
/* Dice Type Grid */
.dice-types {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: var(--space-sm);
    margin: var(--space-md) 0;
}

.dice-type {
    background: var(--bg-tertiary);
    border: 2px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: var(--space-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
    text-align: center;
    min-height: 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.dice-type:hover {
    border-color: var(--accent-primary);
    background: var(--bg-secondary);
    transform: translateY(-2px);
}

.dice-type.selected {
    border-color: var(--accent-secondary);
    background: var(--accent-primary);
    color: var(--text-primary);
}

.dice-icon {
    font-size: 1.5rem;
    margin-bottom: var(--space-xs);
}

.dice-label {
    font-size: 0.8rem;
    font-weight: 500;
}
```

### Turn Feedback System
```css
/* Turn Status Indicator */
.turn-status {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    background: var(--bg-tertiary);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-md);
    font-size: 0.9rem;
}

.turn-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--warning);
    animation: pulse 2s infinite;
}

.turn-indicator.can-roll {
    background: var(--success);
    animation: none;
}

.turn-indicator.rolled {
    background: var(--text-muted);
    animation: none;
}
```

## 📊 evaluation.css - DM Evaluation Interface

### Evaluation Modal Styles
```css
/* Evaluation Dashboard */
.evaluation-dashboard {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--space-lg);
    margin: var(--space-lg) 0;
}

.metric-card {
    background: var(--bg-tertiary);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    text-align: center;
}

.metric-score {
    font-size: 2rem;
    font-weight: bold;
    color: var(--accent-secondary);
    margin: var(--space-sm) 0;
}

.metric-label {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-bottom: var(--space-xs);
}

/* Progress Bars */
.progress-bar {
    width: 100%;
    height: 8px;
    background: var(--border-color);
    border-radius: var(--radius-sm);
    overflow: hidden;
    margin: var(--space-sm) 0;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(
        90deg,
        var(--error) 0%,
        var(--warning) 50%,
        var(--success) 100%
    );
    border-radius: var(--radius-sm);
    transition: width var(--transition-slow);
}
```

### Evaluation History
```css
/* Recent Evaluations List */
.evaluation-history {
    max-height: 400px;
    overflow-y: auto;
    margin-top: var(--space-lg);
}

.evaluation-item {
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    margin-bottom: var(--space-sm);
    border-left: 4px solid var(--accent-primary);
}

.evaluation-score {
    font-weight: bold;
    color: var(--accent-secondary);
    float: right;
}

.evaluation-timestamp {
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-top: var(--space-xs);
}

/* Toggle Switches */
.toggle-switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
}

.toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--border-color);
    transition: var(--transition-fast);
    border-radius: 24px;
}

.toggle-slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background: var(--text-primary);
    transition: var(--transition-fast);
    border-radius: 50%;
}

input:checked + .toggle-slider {
    background: var(--accent-primary);
}

input:checked + .toggle-slider:before {
    transform: translateX(26px);
}
```

## 📱 responsive.css - Mobile & Tablet Styles

### Breakpoint System
```css
/* Mobile Breakpoints */
@media (max-width: 768px) {
    /* Mobile-first responsive design */
    .game-screen {
        grid-template-columns: 1fr;
        grid-template-rows: auto auto 1fr;
        gap: var(--space-md);
    }
    
    .character-panel {
        order: -1; /* Move to top on mobile */
    }
    
    /* Touch-friendly buttons */
    .btn {
        min-height: 44px; /* iOS touch target */
        padding: var(--space-md) var(--space-lg);
    }
    
    /* Modal adjustments */
    .modal-content {
        margin: var(--space-md);
        padding: var(--space-lg);
        border-radius: var(--radius-md);
    }
}

/* Tablet Breakpoints */
@media (min-width: 769px) and (max-width: 1024px) {
    .game-screen {
        grid-template-columns: 1fr 250px;
    }
    
    .setting-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .dice-types {
        grid-template-columns: repeat(4, 1fr);
    }
}

/* Large Screen Optimizations */
@media (min-width: 1200px) {
    .game-screen {
        grid-template-columns: 1fr 350px;
        gap: var(--space-xl);
    }
    
    .setting-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}
```

### Touch Device Adaptations
```css
/* Touch Device Specific Styles */
.touch-device .btn {
    padding: var(--space-md) var(--space-lg);
    font-size: 1rem;
}

.touch-device .dice-type {
    min-height: 80px;
    font-size: 1.1rem;
}

.touch-device .stat-button {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
}

/* Landscape Orientation */
@media (orientation: landscape) and (max-height: 500px) {
    .character-creation-screen {
        padding: var(--space-md);
    }
    
    .step-indicator {
        margin-bottom: var(--space-md);
    }
    
    .setting-card {
        padding: var(--space-md);
    }
}
```

### Dark Mode Support
```css
/* System Dark Mode Detection */
@media (prefers-color-scheme: dark) {
    /* Already dark by default */
}

@media (prefers-color-scheme: light) {
    /* Light mode overrides if user prefers light */
    :root {
        --bg-primary: #f8f9fa;
        --bg-secondary: #ffffff;
        --bg-tertiary: #e9ecef;
        --text-primary: #212529;
        --text-secondary: #495057;
        --text-muted: #6c757d;
        --border-color: #dee2e6;
    }
}

/* Accessibility Overrides */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

## 🎯 CSS Best Practices Used

### 1. CSS Custom Properties (Variables)
- Centralized design system
- Easy theme customization
- Consistent spacing and colors

### 2. Modern Layout Techniques
- CSS Grid for complex layouts
- Flexbox for component alignment
- Logical properties for better i18n support

### 3. Performance Optimizations
- Efficient selectors
- Minimal repaints and reflows
- Hardware-accelerated animations

### 4. Accessibility Features
- High contrast ratios
- Focus management
- Reduced motion support
- Touch target sizing

### 5. Maintainable Architecture
- Component-based organization
- Clear naming conventions
- Modular file structure
- Documented design tokens

This CSS architecture provides a scalable, maintainable foundation for the DiceTales user interface while ensuring excellent user experience across all devices and accessibility requirements.
