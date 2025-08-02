# 📂 Import/Export Campaign Guide

The DiceTales import/export feature allows you to save your campaign progress to a file and share it with others or continue playing on different devices.

## 🎁 Exporting Your Campaign

### How to Export
1. Click the **📂** (Import/Export) button in the top navigation bar
2. Review your campaign information in the Export section
3. Click **📤 Export Campaign** to download your save file
4. The file will be saved as `DiceTales_[CharacterName]_[Date].json`

### What Gets Exported
- **Character Information**: Name, class, level, stats, health, inventory, equipment
- **Campaign Progress**: Current story state, location, NPCs encountered, choices made
- **Game History**: Campaign log, completed quests, world state
- **Settings**: Your personal preferences and configurations
- **Metadata**: Creation date, playtime, and version information

## 📥 Importing a Campaign

### How to Import
1. Click the **📂** (Import/Export) button in the top navigation bar
2. In the Import section, click **📁 Select Campaign File**
3. Choose a `.json` or `.dicetales` file from your device
4. Review the campaign preview information
5. Click **📥 Import Campaign** to load the save

### ⚠️ Important Notes
- **Importing will replace your current campaign progress**
- Always export your current campaign before importing if you want to keep it
- The page will automatically refresh after importing to update all displays
- Only import files that were exported from DiceTales

## 🔄 Use Cases

### Backup Your Progress
- Export your campaign regularly to prevent data loss
- Keep multiple save points at different story moments
- Create backups before making important story decisions

### Share Adventures
- Share your campaign with friends to let them experience your story
- Create "save states" at interesting story points for others to explore
- Exchange campaigns with other players for different perspectives

### Multi-Device Play
- Export from your desktop and continue on mobile
- Switch between different computers seamlessly
- Keep your adventures synchronized across devices

### Campaign Management
- Maintain multiple character campaigns
- Create different save files for experimental choices
- Keep archives of completed adventures

## 📋 File Format

Campaign files are saved in JSON format and contain:

```json
{
  "version": "1.0.0",
  "exported_at": "2025-08-01T12:00:00.000Z",
  "character": { /* character data */ },
  "campaign": { /* campaign progress */ },
  "settings": { /* user preferences */ },
  "ui": { /* interface state */ },
  "meta": { /* metadata */ }
}
```

## 🛡️ Security & Privacy

- All data is processed locally in your browser
- No information is sent to external servers during import/export
- Files contain only game data, no personal information
- You have complete control over your save files

## 🚨 Troubleshooting

### Import Fails
- Ensure the file is a valid DiceTales export
- Check that the file isn't corrupted
- Make sure you have sufficient browser storage space

### Export Doesn't Work
- Check your browser's download settings
- Ensure pop-ups aren't being blocked
- Try using a different browser if issues persist

### File Size Concerns
- Campaign files are typically small (10-50 KB)
- Large inventories or long campaign logs may increase file size
- Consider cleaning up old history entries if files become too large

## 🔮 Future Features

Planned improvements for the import/export system:
- Compressed file format support
- Selective import (character only, campaign only, etc.)
- Campaign file validation and repair tools
- Automatic cloud backup integration
- Campaign file format versioning and migration

---

*Happy adventuring! 🎲✨*
