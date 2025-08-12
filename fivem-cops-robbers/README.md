# FiveM Cops & Robbers Script

A complete cops and robbers chase game for FiveM featuring character selection, vehicle selection, blip tracking system, and arrest mechanics with a 10-minute timer.

## Features

- **10-Minute Chase Timer**: Intense chase gameplay with countdown timer
- **Role Assignment**: Automatic random assignment of cops and robbers
- **Character Selection**: Choose from multiple character models based on role
- **Vehicle Selection**: Select from police vehicles (cops) or sports cars (robbers)
- **Blip System**: Real-time tracking of all players on the map
- **Arrest System**: Realistic arrest mechanics requiring proximity and time
- **Win Conditions**: Cops win by arresting all robbers, robbers win by surviving
- **Modern UI**: Beautiful, responsive web interface for selections and results

## Installation

1. Download or clone this script to your FiveM server resources folder
2. Add `ensure fivem-cops-robbers` to your server.cfg
3. Restart your server

## File Structure

```
fivem-cops-robbers/
├── fxmanifest.lua      # Resource manifest
├── config.lua          # Configuration settings
├── server/
│   └── server.lua      # Server-side logic
├── client/
│   └── client.lua      # Client-side logic
└── ui/
    ├── index.html      # User interface
    ├── style.css       # UI styling
    └── script.js       # UI functionality
```

## Configuration

Edit `config.lua` to customize the script:

### Game Settings
- `Config.ChaseTime`: Duration of chase in seconds (default: 600 = 10 minutes)
- `Config.MaxPlayers`: Maximum players in a game
- `Config.MinCops`: Minimum cops required to start
- `Config.MinRobbers`: Minimum robbers required to start

### Spawn Locations
- `Config.SpawnLocations.cops`: Police spawn points
- `Config.SpawnLocations.robbers`: Robber spawn points

### Vehicles
- `Config.PoliceVehicles`: Available police vehicles
- `Config.RobberVehicles`: Available robber vehicles

### Characters
- `Config.CharacterModels.cops`: Police character models
- `Config.CharacterModels.robbers`: Robber character models

### Arrest Settings
- `Config.ArrestDistance`: Distance required for arrest (default: 3.0)
- `Config.ArrestTime`: Time needed to complete arrest (default: 5.0 seconds)

## Commands

### Console Commands (Server)
- `startcr` - Start a new cops and robbers game
- `stopcr` - Stop the current game

### Player Commands
- `/startgame` - Request to start a game (triggers server event)
- `/joingame` - Request current game state

## Gameplay

### Starting a Game
1. Use console command `startcr` or player command `/startgame`
2. Players are automatically assigned to cops or robbers teams
3. Each player selects their character model
4. Each player selects their vehicle
5. Players spawn at designated locations with weapons
6. 10-minute chase timer begins

### Cops Gameplay
- **Objective**: Arrest all robbers before time runs out
- **Weapons**: Pistol, stun gun, nightstick
- **Vehicles**: Police cruisers, interceptors, bikes
- **Arrest**: Get close to robber and hold E for 5 seconds
- **Blips**: Can see all robber locations on map

### Robbers Gameplay
- **Objective**: Survive the 10-minute chase
- **Weapons**: Pistol (limited ammo)
- **Vehicles**: High-performance sports cars
- **Strategy**: Use speed and terrain to evade police
- **Blips**: Can see all cop locations on map

### Win Conditions
- **Cops Win**: All robbers are arrested
- **Robbers Win**: At least one robber survives the full 10 minutes
- **Game End**: Automatic end when timer expires or all robbers arrested

## Technical Details

### Server Events
- `cr:startGame` - Start new game
- `cr:selectCharacter` - Player character selection
- `cr:selectVehicle` - Player vehicle selection
- `cr:attemptArrest` - Cop attempts to arrest robber
- `cr:requestGameState` - Get current game state

### Client Events
- `cr:gameStarted` - Game has started
- `cr:gameEnded` - Game has ended
- `cr:characterSelected` - Character selection confirmed
- `cr:vehicleSelected` - Vehicle selection confirmed
- `cr:playerArrested` - Player has been arrested

### NUI Callbacks
- `selectCharacter` - Character selection from UI
- `selectVehicle` - Vehicle selection from UI
- `closeUI` - Close the interface

## Requirements

- FiveM Server Build 4752 or higher
- OneSync enabled (for multiplayer synchronization)

## Customization

### Adding New Vehicles
Edit `config.lua` and add to the appropriate vehicle array:

```lua
Config.PoliceVehicles = {
    {model = 'your_vehicle_model', label = 'Your Vehicle Name'},
    -- ... existing vehicles
}
```

### Adding New Characters
Edit `config.lua` and add to the appropriate character array:

```lua
Config.CharacterModels.cops = {
    {model = 'your_ped_model', label = 'Your Character Name'},
    -- ... existing characters
}
```

### Changing Spawn Points
Edit the spawn locations in `config.lua`:

```lua
Config.SpawnLocations = {
    cops = {
        {x = 123.45, y = -678.90, z = 12.34, heading = 90.0},
        -- ... more spawn points
    }
}
```

## Troubleshooting

### Game Won't Start
- Check minimum player requirements in config
- Ensure OneSync is enabled
- Verify all players are connected

### UI Not Showing
- Check browser console for errors
- Ensure NUI focus is properly set
- Verify resource files are properly loaded

### Arrests Not Working
- Check arrest distance configuration
- Ensure target is a robber (not another cop)
- Verify player roles are properly assigned

## Support

For issues, suggestions, or modifications, please refer to the script documentation or contact the development team.

## License

This script is provided as-is for FiveM server use. Modify and distribute according to your server's needs.

## Version History

- **v1.0.0**: Initial release with all core features
  - 10-minute chase timer
  - Character and vehicle selection
  - Blip tracking system
  - Arrest mechanics
  - Modern UI interface
  - Win/loss conditions