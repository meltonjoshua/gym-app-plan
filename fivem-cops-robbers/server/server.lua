-- Server-side script for Cops & Robbers
local gameState = {
    active = false,
    players = {},
    cops = {},
    robbers = {},
    gameStartTime = 0,
    gameEndTime = 0
}

-- Player data structure
local playerData = {}

-- Initialize player data
function InitPlayerData(source)
    playerData[source] = {
        role = nil,
        isArrested = false,
        vehicle = nil,
        character = nil,
        blip = nil
    }
end

-- Clean up player data
function CleanupPlayerData(source)
    if playerData[source] then
        playerData[source] = nil
    end
end

-- Start a new game
function StartGame()
    if gameState.active then
        return false, "Game already active"
    end
    
    local players = GetPlayers()
    if #players < (Config.MinCops + Config.MinRobbers) then
        return false, "Not enough players to start"
    end
    
    -- Reset game state
    gameState.active = true
    gameState.players = {}
    gameState.cops = {}
    gameState.robbers = {}
    gameState.gameStartTime = GetGameTimer()
    gameState.gameEndTime = gameState.gameStartTime + (Config.ChaseTime * 1000)
    
    -- Assign roles randomly
    local shuffledPlayers = {}
    for i = 1, #players do
        table.insert(shuffledPlayers, players[i])
    end
    
    -- Shuffle array
    for i = #shuffledPlayers, 2, -1 do
        local j = math.random(i)
        shuffledPlayers[i], shuffledPlayers[j] = shuffledPlayers[j], shuffledPlayers[i]
    end
    
    -- Assign cops (1/3 of players, minimum Config.MinCops)
    local numCops = math.max(Config.MinCops, math.floor(#players / 3))
    
    for i = 1, numCops do
        if shuffledPlayers[i] then
            local playerId = tonumber(shuffledPlayers[i])
            playerData[playerId].role = 'cop'
            table.insert(gameState.cops, playerId)
            table.insert(gameState.players, playerId)
        end
    end
    
    -- Assign remaining as robbers
    for i = numCops + 1, #shuffledPlayers do
        if shuffledPlayers[i] then
            local playerId = tonumber(shuffledPlayers[i])
            playerData[playerId].role = 'robber'
            table.insert(gameState.robbers, playerId)
            table.insert(gameState.players, playerId)
        end
    end
    
    -- Notify all players
    TriggerClientEvent('cr:gameStarted', -1, gameState.cops, gameState.robbers, Config.ChaseTime)
    
    -- Start game timer
    SetTimeout(Config.ChaseTime * 1000, function()
        EndGame('robbers')
    end)
    
    return true, "Game started successfully"
end

-- End the game
function EndGame(winners)
    if not gameState.active then
        return
    end
    
    gameState.active = false
    
    -- Calculate results
    local results = {
        winners = winners,
        gameTime = math.floor((GetGameTimer() - gameState.gameStartTime) / 1000),
        totalPlayers = #gameState.players,
        copsCount = #gameState.cops,
        robbersCount = #gameState.robbers,
        arrestedCount = 0
    }
    
    -- Count arrested robbers
    for _, robberId in ipairs(gameState.robbers) do
        if playerData[robberId] and playerData[robberId].isArrested then
            results.arrestedCount = results.arrestedCount + 1
        end
    end
    
    -- Notify all players of game end
    TriggerClientEvent('cr:gameEnded', -1, results)
    
    -- Reset all player data
    for playerId, _ in pairs(playerData) do
        if playerData[playerId] then
            playerData[playerId].role = nil
            playerData[playerId].isArrested = false
            playerData[playerId].vehicle = nil
            playerData[playerId].character = nil
        end
    end
    
    print('[Cops & Robbers] Game ended. Winners: ' .. winners)
end

-- Check win conditions
function CheckWinConditions()
    if not gameState.active then
        return
    end
    
    -- Check if all robbers are arrested
    local allArrested = true
    for _, robberId in ipairs(gameState.robbers) do
        if playerData[robberId] and not playerData[robberId].isArrested then
            allArrested = false
            break
        end
    end
    
    if allArrested then
        EndGame('cops')
    end
end

-- Handle player connecting
AddEventHandler('playerConnecting', function()
    local source = source
    InitPlayerData(source)
end)

-- Handle player dropping
AddEventHandler('playerDropped', function()
    local source = source
    CleanupPlayerData(source)
    
    -- Remove from game state if in game
    for i, playerId in ipairs(gameState.players) do
        if playerId == source then
            table.remove(gameState.players, i)
            break
        end
    end
    
    for i, copId in ipairs(gameState.cops) do
        if copId == source then
            table.remove(gameState.cops, i)
            break
        end
    end
    
    for i, robberId in ipairs(gameState.robbers) do
        if robberId == source then
            table.remove(gameState.robbers, i)
            break
        end
    end
    
    CheckWinConditions()
end)

-- Register server events
RegisterServerEvent('cr:startGame')
AddEventHandler('cr:startGame', function()
    local source = source
    local success, message = StartGame()
    TriggerClientEvent('cr:startGameResponse', source, success, message)
end)

RegisterServerEvent('cr:selectCharacter')
AddEventHandler('cr:selectCharacter', function(characterModel)
    local source = source
    if playerData[source] then
        playerData[source].character = characterModel
        TriggerClientEvent('cr:characterSelected', source, characterModel)
    end
end)

RegisterServerEvent('cr:selectVehicle')
AddEventHandler('cr:selectVehicle', function(vehicleModel)
    local source = source
    if playerData[source] then
        playerData[source].vehicle = vehicleModel
        TriggerClientEvent('cr:vehicleSelected', source, vehicleModel)
    end
end)

RegisterServerEvent('cr:attemptArrest')
AddEventHandler('cr:attemptArrest', function(targetId)
    local source = source
    
    if not gameState.active then
        return
    end
    
    -- Verify cop is trying to arrest robber
    if not playerData[source] or playerData[source].role ~= 'cop' then
        return
    end
    
    if not playerData[targetId] or playerData[targetId].role ~= 'robber' then
        return
    end
    
    if playerData[targetId].isArrested then
        return
    end
    
    -- Mark robber as arrested
    playerData[targetId].isArrested = true
    
    -- Notify players
    TriggerClientEvent('cr:playerArrested', -1, targetId, source)
    
    -- Check win conditions
    CheckWinConditions()
end)

RegisterServerEvent('cr:requestGameState')
AddEventHandler('cr:requestGameState', function()
    local source = source
    TriggerClientEvent('cr:gameState', source, gameState, playerData[source])
end)

-- Console commands
RegisterCommand('startcr', function(source, args, rawCommand)
    if source == 0 then -- Console command
        local success, message = StartGame()
        print('[Cops & Robbers] ' .. message)
    else
        TriggerClientEvent('chat:addMessage', source, {
            color = {255, 0, 0},
            multiline = true,
            args = {"[Cops & Robbers]", "Only console can start the game"}
        })
    end
end, false)

RegisterCommand('stopcr', function(source, args, rawCommand)
    if source == 0 then -- Console command
        if gameState.active then
            EndGame('admin')
            print('[Cops & Robbers] Game stopped by admin')
        else
            print('[Cops & Robbers] No active game to stop')
        end
    else
        TriggerClientEvent('chat:addMessage', source, {
            color = {255, 0, 0},
            multiline = true,
            args = {"[Cops & Robbers]", "Only console can stop the game"}
        })
    end
end, false)

-- Initialize all connected players on resource start
AddEventHandler('onResourceStart', function(resourceName)
    if GetCurrentResourceName() ~= resourceName then
        return
    end
    
    local players = GetPlayers()
    for _, playerId in ipairs(players) do
        InitPlayerData(tonumber(playerId))
    end
    
    print('[Cops & Robbers] Server script loaded successfully')
end)