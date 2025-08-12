# FiveM Cops & Robbers Installation Guide

## Quick Setup

1. **Copy the script**
   ```bash
   # Copy the entire fivem-cops-robbers folder to your FiveM server resources directory
   cp -r fivem-cops-robbers /path/to/your/fivem-server/resources/
   ```

2. **Add to server.cfg**
   ```
   # Add this line to your server.cfg file
   ensure fivem-cops-robbers
   ```

3. **Restart server**
   ```bash
   # Restart your FiveM server or use:
   refresh
   ensure fivem-cops-robbers
   ```

## Testing the Script

1. **Start a game** (Server console):
   ```
   startcr
   ```

2. **Join as player**:
   - Connect to the server
   - Use `/joingame` command if needed

3. **Gameplay flow**:
   - Character selection screen appears
   - Vehicle selection screen appears
   - Players spawn with equipment
   - 10-minute chase begins
   - Game ends when timer expires or all robbers arrested

## Default Controls

- **E** - Arrest (for cops when near robbers)
- **ESC** - Close UI menus

## Quick Configuration

Edit `config.lua` for basic customization:

```lua
-- Change chase duration (in seconds)
Config.ChaseTime = 10 * 60  -- 10 minutes

-- Minimum players needed
Config.MinCops = 2
Config.MinRobbers = 1

-- Arrest settings
Config.ArrestDistance = 3.0  -- Distance needed
Config.ArrestTime = 5.0      -- Time to arrest (seconds)
```

## Verification Checklist

- [ ] Script files copied to resources folder
- [ ] `ensure fivem-cops-robbers` added to server.cfg
- [ ] Server restarted successfully
- [ ] No errors in server console
- [ ] Players can see character selection UI
- [ ] Blips appear on map during game
- [ ] Arrest system works for cops
- [ ] Timer displays correctly

## Common Issues

**Q: UI doesn't show**
A: Check that NUI is enabled and no conflicting resources

**Q: Game won't start**
A: Ensure minimum players are connected (2 cops + 1 robber by default)

**Q: Arrests don't work**
A: Verify cop is close enough to robber (3.0 units default) and holding E

**Q: No blips on map**
A: Check that OneSync is enabled in server.cfg

For detailed documentation, see README.md