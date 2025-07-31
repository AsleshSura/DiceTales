# ui.js - User Interface Management Documentation

## Overview
The `ui.js` file contains the `UIManager` class, which handles all user interface interactions, animations, and component management in DiceTales. It provides smooth transitions, responsive design, and accessibility features.

## File Dependencies
- **Dependencies**: utils.js, gameState.js
- **Used by**: main.js, character.js, dice.js

## Global Variables
- `uiManager` - Global instance of UIManager

---

## 🎨 UIManager Class

### Constructor Properties
- `currentScreen` - Active screen identifier
- `screenTransitionDuration` - Screen transition timing (300ms)
- `animations` - Active animation registry
- `modals` - Open modal dialog registry
- `components` - UI component instances
- `eventHandlers` - Registered event handlers

### Key Features
- **Screen Management**: Smooth transitions between game screens
- **Modal System**: Layered dialog management
- **Animation Framework**: CSS and JavaScript animations
- **Responsive Design**: Mobile and desktop optimization
- **Accessibility**: ARIA labels and keyboard navigation
- **Component System**: Reusable UI components

---

## 🖥️ Screen Management

### `showScreen(screenId, options = {})`
Transitions to a specific screen with optional animation.

**Parameters:**
- `screenId` (string): Target screen identifier
- `options` (object): Transition options

**Available Screens:**
- `'loading'` - Initial loading screen
- `'character-creation'` - Character creation flow
- `'game'` - Main gameplay interface
- `'inventory'` - Character inventory
- `'settings'` - Game settings
- `'help'` - Help and tutorial

**Options:**
```javascript
{
    animation: 'fade', // 'fade', 'slide', 'scale'
    duration: 300,     // Animation duration in ms
    direction: 'left', // For slide animations
    onComplete: fn     // Callback after transition
}
```

### `hideScreen(screenId, options = {})`
Hides a specific screen with animation.

### `getCurrentScreen()`
Returns the currently active screen identifier.

### `isScreenVisible(screenId)`
Checks if a screen is currently visible.

---

## 🎭 Animation System

### `animate(element, animationType, options = {})`
Applies animation to any DOM element.

**Animation Types:**
- `'fadeIn'` / `'fadeOut'` - Opacity transitions
- `'slideIn'` / `'slideOut'` - Position transitions
- `'scaleIn'` / `'scaleOut'` - Size transitions
- `'bounce'` - Bounce effect
- `'shake'` - Shake effect
- `'pulse'` - Pulsing effect
- `'rotate'` - Rotation animation

**Example:**
```javascript
uiManager.animate(element, 'fadeIn', {
    duration: 500,
    easing: 'ease-in-out',
    onComplete: () => console.log('Animation complete')
});
```

### `stopAnimation(element)`
Stops any running animations on an element.

### `registerAnimation(name, keyframes)`
Registers custom CSS animations.

---

## 🔲 Modal System

### `showModal(modalId, content, options = {})`
Displays a modal dialog with specified content.

**Parameters:**
- `modalId` (string): Unique modal identifier
- `content` (string|HTMLElement): Modal content
- `options` (object): Modal configuration

**Modal Options:**
```javascript
{
    closable: true,        // Show close button
    backdrop: true,        // Show backdrop overlay
    keyboard: true,        // Close on Escape key
    size: 'medium',        // 'small', 'medium', 'large', 'fullscreen'
    animation: 'fade',     // Entry animation
    onShow: fn,           // Show callback
    onHide: fn,           // Hide callback
    onClose: fn           // Close callback
}
```

### `hideModal(modalId)`
Hides a specific modal dialog.

### `hideAllModals()`
Closes all open modal dialogs.

### `isModalOpen(modalId)`
Checks if a specific modal is currently open.

---

## 🧩 Component System

### Built-in Components

#### `createButton(text, options = {})`
Creates a styled button component.

**Options:**
```javascript
{
    type: 'primary',      // 'primary', 'secondary', 'danger', 'success'
    size: 'medium',       // 'small', 'medium', 'large'
    disabled: false,      // Disabled state
    icon: '🎲',          // Optional icon
    onClick: fn           // Click handler
}
```

#### `createCard(content, options = {})`
Creates a card container component.

#### `createProgressBar(value, max, options = {})`
Creates an animated progress bar.

#### `createTooltip(element, text, options = {})`
Adds tooltip functionality to elements.

#### `createDropdown(options, callback)`
Creates a dropdown selection component.

### Component Management

#### `registerComponent(name, factory)`
Registers a custom component factory.

#### `createComponent(name, options)`
Creates an instance of a registered component.

#### `destroyComponent(component)`
Properly cleans up a component instance.

---

## 📱 Responsive Design

### `updateLayout()`
Recalculates and updates responsive layout.

### `isMobile()`
Detects mobile device viewport.

### `isTablet()`
Detects tablet device viewport.

### `isDesktop()`
Detects desktop viewport.

### Breakpoint Management
```javascript
const breakpoints = {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1200px'
};
```

### `onBreakpointChange(callback)`
Registers callback for viewport size changes.

---

## ♿ Accessibility Features

### `enableKeyboardNavigation()`
Enables keyboard navigation for all interactive elements.

**Keyboard Support:**
- `Tab` / `Shift+Tab` - Navigate between elements
- `Enter` / `Space` - Activate buttons
- `Escape` - Close modals/menus
- `Arrow Keys` - Navigate lists/menus

### `setARIALabel(element, label)`
Sets ARIA accessibility labels.

### `announceToScreenReader(message)`
Announces messages to screen readers.

### `setFocusable(element, focusable = true)`
Manages element focus states.

---

## 🎮 Game-Specific UI

### Character Creation UI

#### `renderCharacterStats(character)`
Displays character statistics with modifiers.

#### `createStatEditor(statName, currentValue, callback)`
Creates interactive stat adjustment controls.

#### `showCharacterPreview(character)`
Shows character summary preview.

### Dice Rolling UI

#### `showDiceAnimation(diceType, result)`
Displays 3D dice rolling animation.

#### `createDiceSelector(availableDice, selectedDice, callback)`
Creates dice selection interface.

#### `showRollHistory(rolls)`
Displays recent dice roll history.

### Campaign UI

#### `displayStoryText(text, options = {})`
Shows story text with typing animation.

**Options:**
```javascript
{
    speed: 50,           // Typing speed (chars/second)
    sound: true,         // Enable typing sounds
    skipAnimation: false, // Skip straight to result
    onComplete: fn       // Completion callback
}
```

#### `createActionButtons(actions)`
Creates player action buttons.

#### `showCampaignProgress(progress)`
Displays campaign progression indicators.

---

## 🔔 Event Handling

### UI Event Types
- `ui:screenChanged` - Screen transition completed
- `ui:modalShown` - Modal dialog opened
- `ui:modalHidden` - Modal dialog closed
- `ui:componentCreated` - Component instantiated
- `ui:animationComplete` - Animation finished
- `ui:breakpointChanged` - Viewport size changed

### Event Binding

#### `bindEvent(element, eventType, handler)`
Binds event with automatic cleanup tracking.

#### `unbindEvent(element, eventType, handler)`
Removes specific event binding.

#### `unbindAllEvents(element)`
Removes all events from an element.

---

## 🎨 Theming and Styling

### `setTheme(themeName)`
Applies a visual theme to the interface.

**Available Themes:**
- `'dark'` - Dark mode theme
- `'light'` - Light mode theme
- `'high-contrast'` - High contrast accessibility theme
- `'retro'` - Retro/vintage theme

### `createStyleSheet(styles)`
Dynamically creates CSS stylesheets.

### `addCSSRule(selector, styles)`
Adds CSS rules programmatically.

---

## 📊 Performance Optimization

### Virtual Scrolling
For large lists (dice history, inventory):
```javascript
uiManager.createVirtualList(container, items, {
    itemHeight: 50,
    visibleItems: 20,
    renderItem: (item) => `<div>${item.name}</div>`
});
```

### Animation Performance
- **GPU Acceleration**: Uses CSS transforms
- **Animation Pooling**: Reuses animation instances
- **Frame Rate Control**: Maintains 60fps
- **Batch Updates**: Groups DOM modifications

### Memory Management
- **Event Cleanup**: Removes unused listeners
- **Component Disposal**: Properly destroys components
- **Animation Cleanup**: Stops unused animations
- **DOM Pruning**: Removes unused elements

---

## 🛠️ Developer Tools

### Debug Mode Features
```javascript
if (window.DEBUG_MODE) {
    // Visual debug overlays
    uiManager.showDebugOverlay();
    
    // Performance monitoring
    uiManager.enablePerformanceMonitoring();
    
    // Component inspector
    uiManager.inspectComponents();
}
```

### UI Testing Utilities
```javascript
// Test all screen transitions
uiManager.testAllScreens();

// Test modal system
uiManager.testModals();

// Test animations
uiManager.testAnimations();
```

---

## 💡 Usage Examples

### Screen Transitions
```javascript
// Basic screen change
uiManager.showScreen('character-creation');

// Animated transition
uiManager.showScreen('game', {
    animation: 'slide',
    direction: 'left',
    duration: 500
});
```

### Modal Dialogs
```javascript
// Simple confirmation modal
uiManager.showModal('confirm', `
    <h3>Delete Character?</h3>
    <p>This action cannot be undone.</p>
    <button onclick="confirmDelete()">Delete</button>
    <button onclick="uiManager.hideModal('confirm')">Cancel</button>
`, { size: 'small' });
```

### Component Creation
```javascript
// Create interactive button
const rollButton = uiManager.createButton('🎲 Roll Dice', {
    type: 'primary',
    size: 'large',
    onClick: () => diceSystem.rollDice()
});

// Create progress bar
const healthBar = uiManager.createProgressBar(
    character.health.current, 
    character.health.maximum,
    { color: 'red', animated: true }
);
```

### Animations
```javascript
// Animate element entrance
uiManager.animate(newElement, 'fadeIn', {
    duration: 300,
    onComplete: () => {
        // Animation finished
    }
});

// Chain animations
uiManager.animate(element, 'slideIn')
    .then(() => uiManager.animate(element, 'pulse'))
    .then(() => console.log('All animations complete'));
```

---

## 🎯 Integration Examples

### Character Creation Integration
```javascript
// Update UI when character stats change
eventBus.on('character:statsChanged', (stats) => {
    uiManager.renderCharacterStats(stats);
});

// Show character creation step
uiManager.showCharacterCreationStep(2, {
    title: 'Choose Your Class',
    content: characterManager.renderClassSelection()
});
```

### Dice Integration
```javascript
// Show dice animation
eventBus.on('dice:rolled', (rollData) => {
    rollData.results.forEach(result => {
        uiManager.showDiceAnimation(result.dice, result.value);
    });
});
```

### Story Display
```javascript
// Display AI-generated story with typing effect
uiManager.displayStoryText(aiResponse, {
    speed: 75,
    sound: true,
    onComplete: () => {
        uiManager.createActionButtons(availableActions);
    }
});
```

---

*The ui.js system provides a comprehensive, accessible, and performant user interface framework that enhances the DiceTales gaming experience across all devices and interaction methods.*
