# Player Aliases Configuration Guide

## Overview
The player aliases system allows you to merge players who appear in the data with different name variations into a single canonical player.

## Configuration File
Edit the file: `src/config/playerAliases.js`

## How to Use

### 1. Find Duplicate Players
Look at your rankings and identify players who appear multiple times with different name variations. For example:
- "John" and "John Doe"
- "Mike Smith" and "M. Smith"
- "Alex" and "Alexander Johnson"

### 2. Add Mappings
In `src/config/playerAliases.js`, add mappings in the `playerAliases` object:

```javascript
export const playerAliases = {
  // Short name variations map to full name
  'John': 'John Doe',
  'J. Doe': 'John Doe',
  
  // Abbreviated names map to full name
  'M. Smith': 'Mike Smith',
  'Mike': 'Mike Smith',
  
  // Nickname to full name
  'Alex': 'Alexander Johnson',
}
```

### 3. Format Rules
- **Key (left side)**: The name variation as it appears in the tournament data
- **Value (right side)**: The canonical name you want to use (preferably full first and last name)
- Use exact spelling and capitalization as they appear in the data
- Multiple variations can map to the same canonical name

### 4. Example Configuration

```javascript
export const playerAliases = {
  // Example: Consolidating "Max" variations
  'Max': 'Max Müller',
  'M. Müller': 'Max Müller',
  'Müller': 'Max Müller',
  
  // Example: Consolidating "Sarah" variations
  'Sarah': 'Sarah Weber',
  'S. Weber': 'Sarah Weber',
  
  // Example: Consolidating "Tom" variations
  'Tom': 'Thomas Schmidt',
  'Tommy': 'Thomas Schmidt',
  'T. Schmidt': 'Thomas Schmidt',
}
```

## What Gets Merged
When you configure aliases, the system will:
- ✅ Combine all tournament results and statistics
- ✅ Merge TrueSkill ratings (all matches will count towards the same rating)
- ✅ Aggregate win/loss records
- ✅ Consolidate match history
- ✅ Show partner statistics across all name variations

## After Configuration
1. Save the `playerAliases.js` file
2. The app will automatically reload (if dev server is running)
3. Check the rankings to verify players are properly merged
4. The canonical name (full name) will be displayed in the UI

## Tips
- Always use the **full first and last name** as the canonical name when possible
- Check your tournament data files to see exact name spellings
- The system is case-sensitive, so "john" and "John" are different
- You can add new mappings at any time without affecting existing data

## Troubleshooting
- **Player still shows twice**: Check spelling and capitalization in your mapping
- **Wrong name displayed**: The value (right side) of the mapping becomes the displayed name
- **TrueSkill seems off**: All historical matches will be recalculated with merged names

