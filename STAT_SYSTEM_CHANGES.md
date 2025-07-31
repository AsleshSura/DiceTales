# DiceTales Stat System Enhancement

## Problem
The original system allowed players to modify their base class stats using point-buy points, which could lead to unbalanced characters and undermine the class system design.

## Solution
Implemented a dual-stat system that separates base class stats from point-buy allocations:

### Key Changes

#### 1. Data Structure Changes
- **Base Class Stats**: Stored in `character.baseClassStats` - these are the stats that come with your class selection and cannot be modified with points
- **Point-Buy Stats**: Stored in `character.pointBuyStats` - these represent the player's point allocation (starting at 8 for all stats)  
- **Final Stats**: Stored in `character.stats` - calculated by combining base class stats with point-buy allocations

#### 2. Calculation Formula
```
Final Stat = Base Class Stat + (Point-Buy Stat - 8)
```

For example:
- Fighter has base STR of 15
- Player allocates 2 points to STR (point-buy stat becomes 10)
- Final STR = 15 + (10 - 8) = 17

#### 3. Visual Improvements
The stat allocation interface now shows:
- **Base Class Stat** (in dark blue): What your class provides
- **Point Allocation** (in accent color): How many points you've spent
- **Final Stat** (in primary color): The combined result

Example display: `15 + 2 = 17`

#### 4. Point Management
- Players start with 27 points to allocate
- Point costs follow the standard D&D 5e point-buy system:
  - 8: 0 points, 9: 1 point, 10: 2 points, 11: 3 points
  - 12: 4 points, 13: 5 points, 14: 7 points, 15: 9 points
- Points are only calculated based on point-buy allocations, not final stats

#### 5. Backward Compatibility
- Added `initializePointBuyStats()` method to handle existing characters
- When loading old save data, the system automatically converts to the new format

### Files Modified

#### JavaScript Changes
1. **character.js**:
   - Added `basePointBuyStats` property
   - Modified class selection to store base stats separately
   - Updated `calculateRemainingPoints()` to use point-buy stats only
   - Added `updateFinalStats()` method to combine base and point-buy stats
   - Modified `adjustStat()` to work with point-buy allocations
   - Enhanced `renderStatRows()` to show the stat breakdown
   - Added backward compatibility with `initializePointBuyStats()`

#### CSS Changes
2. **character.css**:
   - Added `.stat-breakdown` styles for the new display
   - Added `.base-stat`, `.point-allocation`, `.final-stat` styling
   - Added `.stat-plus`, `.stat-equals` for the formula display
   - Enhanced `.point-buy-info` with explanatory text

### Benefits

1. **Game Balance**: Base class stats cannot be modified, preserving class identity
2. **Clarity**: Players can clearly see what comes from their class vs. their point allocation
3. **Fairness**: All characters use the same 27-point budget for customization
4. **Visual Feedback**: The breakdown display makes it clear how final stats are calculated
5. **Flexibility**: Players can still customize their characters within the intended bounds

### User Experience

Players now see their stat allocation as:
```
Strength    [Base: 15] + [Points: 2] = [Final: 17]
            Physical power and muscle
            [−] [10] [+]  (+3)
```

This makes it immediately clear:
- Their class gives them 15 base Strength
- They've allocated 2 points from their budget (stat 10 = 2 points)
- Their final Strength is 17 with a +3 modifier
- They can only modify the point allocation, not the base class stat

The system now properly prevents stat manipulation while maintaining the flexibility of point-buy character creation.
