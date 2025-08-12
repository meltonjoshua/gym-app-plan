-- Client-side script for Cops & Robbers
local gameActive = false
local playerRole = nil
local gameTimer = 0
local gameEndTime = 0
local playerBlips = {}
local isArresting = false
local arrestTarget = nil
local arrestStartTime = 0
local uiVisible = false

-- Game state
local gameState = {
    cops = {},
    robbers = {},
    isPlayerArrested = false
}

-- UI Functions
function ShowUI()
    if not uiVisible then
        SetNuiFocus(true, true)
        SendNUIMessage({
            type = 'show'
        })
        uiVisible = true
    end
end

function HideUI()
    if uiVisible then
        SetNuiFocus(false, false)
        SendNUIMessage({
            type = 'hide'
        })
        uiVisible = false
    end
end

-- Character selection
function ShowCharacterSelection(role)
    local characters = {}
    if role == 'cop' then
        characters = Config.CharacterModels.cops
    else
        characters = Config.CharacterModels.robbers
    end
    
    SendNUIMessage({
        type = 'showCharacterSelection',
        characters = characters,
        role = role
    })
    ShowUI()
end

-- Vehicle selection
function ShowVehicleSelection(role)
    local vehicles = {}
    if role == 'cop' then
        vehicles = Config.PoliceVehicles
    else
        vehicles = Config.RobberVehicles
    end
    
    SendNUIMessage({
        type = 'showVehicleSelection',
        vehicles = vehicles,
        role = role
    })
    ShowUI()
end

-- Spawn player
function SpawnPlayer(role, characterModel, vehicleModel)
    local playerPed = PlayerPedId()
    local spawnLocations = Config.SpawnLocations[role]
    local spawnPoint = spawnLocations[math.random(#spawnLocations)]
    
    -- Set character model
    if characterModel then
        local modelHash = GetHashKey(characterModel)
        RequestModel(modelHash)
        while not HasModelLoaded(modelHash) do
            Wait(1)
        end
        SetPlayerModel(PlayerId(), modelHash)
        SetModelAsNoLongerNeeded(modelHash)
    end
    
    -- Teleport to spawn location
    SetEntityCoords(playerPed, spawnPoint.x, spawnPoint.y, spawnPoint.z)
    SetEntityHeading(playerPed, spawnPoint.heading)
    
    -- Spawn vehicle
    if vehicleModel then
        local vehicleHash = GetHashKey(vehicleModel)
        RequestModel(vehicleHash)
        while not HasModelLoaded(vehicleHash) do
            Wait(1)
        end
        
        local vehicle = CreateVehicle(vehicleHash, spawnPoint.x + 2.0, spawnPoint.y + 2.0, spawnPoint.z, spawnPoint.heading, true, false)
        TaskWarpPedIntoVehicle(playerPed, vehicle, -1)
        SetModelAsNoLongerNeeded(vehicleHash)
    end
    
    -- Give weapons based on role
    if role == 'cop' then
        GiveWeaponToPed(playerPed, GetHashKey('weapon_pistol'), 100, false, true)
        GiveWeaponToPed(playerPed, GetHashKey('weapon_stungun'), 100, false, false)
        GiveWeaponToPed(playerPed, GetHashKey('weapon_nightstick'), 1, false, false)
    else
        -- Robbers get basic weapons
        GiveWeaponToPed(playerPed, GetHashKey('weapon_pistol'), 50, false, true)
    end
end

-- Create player blips
function CreatePlayerBlips()
    ClearPlayerBlips()
    
    for _, playerId in ipairs(gameState.cops) do
        if playerId ~= PlayerId() then
            CreatePlayerBlip(playerId, 'cop')
        end
    end
    
    for _, playerId in ipairs(gameState.robbers) do
        if playerId ~= PlayerId() then
            CreatePlayerBlip(playerId, 'robber')
        end
    end
end

function CreatePlayerBlip(playerId, role)
    local player = GetPlayerFromServerId(playerId)
    if player ~= -1 then
        local ped = GetPlayerPed(player)
        local blip = AddBlipForEntity(ped)
        
        local blipConfig = Config.Blips[role]
        SetBlipSprite(blip, blipConfig.sprite)
        SetBlipColour(blip, blipConfig.color)
        SetBlipScale(blip, blipConfig.scale)
        SetBlipAsShortRange(blip, false)
        BeginTextCommandSetBlipName("STRING")
        AddTextComponentString(blipConfig.label .. " (" .. GetPlayerName(player) .. ")")
        EndTextCommandSetBlipName(blip)
        
        playerBlips[playerId] = blip
    end
end

function ClearPlayerBlips()
    for playerId, blip in pairs(playerBlips) do
        if DoesBlipExist(blip) then
            RemoveBlip(blip)
        end
    end
    playerBlips = {}
end

-- Arrest system
function StartArrest(targetId)
    if playerRole ~= 'cop' or isArresting then
        return
    end
    
    local targetPlayer = GetPlayerFromServerId(targetId)
    if targetPlayer == -1 then
        return
    end
    
    local targetPed = GetPlayerPed(targetPlayer)
    local playerPed = PlayerPedId()
    local distance = #(GetEntityCoords(playerPed) - GetEntityCoords(targetPed))
    
    if distance <= Config.ArrestDistance then
        isArresting = true
        arrestTarget = targetId
        arrestStartTime = GetGameTimer()
        
        -- Start arrest animation
        TaskStartScenarioInPlace(playerPed, "WORLD_HUMAN_SECURITY_SHINE_TORCH", 0, true)
        
        ShowNotification("Arresting suspect... Hold position for " .. Config.ArrestTime .. " seconds!")
    end
end

function UpdateArrest()
    if not isArresting or not arrestTarget then
        return
    end
    
    local currentTime = GetGameTimer()
    local elapsed = (currentTime - arrestStartTime) / 1000
    
    if elapsed >= Config.ArrestTime then
        -- Complete arrest
        TriggerServerEvent('cr:attemptArrest', arrestTarget)
        ClearPedTasksImmediately(PlayerPedId())
        isArresting = false
        arrestTarget = nil
        ShowNotification("Arrest completed!")
    else
        -- Check if still in range
        local targetPlayer = GetPlayerFromServerId(arrestTarget)
        if targetPlayer ~= -1 then
            local targetPed = GetPlayerPed(targetPlayer)
            local playerPed = PlayerPedId()
            local distance = #(GetEntityCoords(playerPed) - GetEntityCoords(targetPed))
            
            if distance > Config.ArrestDistance then
                -- Cancel arrest
                ClearPedTasksImmediately(PlayerPedId())
                isArresting = false
                arrestTarget = nil
                ShowNotification("Arrest cancelled - suspect moved away!")
            else
                -- Show progress
                local remaining = Config.ArrestTime - elapsed
                DrawText3D(GetEntityCoords(PlayerPedId()), "Arresting... " .. string.format("%.1f", remaining) .. "s")
            end
        else
            -- Target disconnected
            ClearPedTasksImmediately(PlayerPedId())
            isArresting = false
            arrestTarget = nil
        end
    end
end

-- Helper functions
function ShowNotification(message)
    SetNotificationTextEntry("STRING")
    AddTextComponentString(message)
    DrawNotification(false, false)
end

function DrawText3D(coords, text)
    local onScreen, _x, _y = World3dToScreen2d(coords.x, coords.y, coords.z + 1.0)
    if onScreen then
        SetTextScale(0.35, 0.35)
        SetTextFont(4)
        SetTextProportional(1)
        SetTextColour(255, 255, 255, 215)
        SetTextEntry("STRING")
        SetTextCentre(1)
        AddTextComponentString(text)
        DrawText(_x, _y)
    end
end

function GetNearbyPlayers(maxDistance)
    local players = {}
    local playerPed = PlayerPedId()
    local playerCoords = GetEntityCoords(playerPed)
    
    for _, player in ipairs(GetActivePlayers()) do
        if player ~= PlayerId() then
            local targetPed = GetPlayerPed(player)
            local targetCoords = GetEntityCoords(targetPed)
            local distance = #(playerCoords - targetCoords)
            
            if distance <= maxDistance then
                table.insert(players, {
                    id = GetPlayerServerId(player),
                    distance = distance,
                    ped = targetPed
                })
            end
        end
    end
    
    return players
end

-- Main game loop
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(0)
        
        if gameActive then
            -- Update arrest system
            UpdateArrest()
            
            -- Handle arrest key press (E key)
            if playerRole == 'cop' and not isArresting and IsControlJustPressed(0, 38) then
                local nearbyPlayers = GetNearbyPlayers(Config.ArrestDistance)
                for _, nearbyPlayer in ipairs(nearbyPlayers) do
                    -- Check if this is a robber
                    for _, robberId in ipairs(gameState.robbers) do
                        if robberId == nearbyPlayer.id then
                            StartArrest(nearbyPlayer.id)
                            break
                        end
                    end
                end
            end
            
            -- Display game timer
            if gameEndTime > 0 then
                local timeLeft = math.max(0, (gameEndTime - GetGameTimer()) / 1000)
                local minutes = math.floor(timeLeft / 60)
                local seconds = math.floor(timeLeft % 60)
                
                DrawRect(0.5, 0.05, 0.2, 0.08, 0, 0, 0, 150)
                SetTextFont(4)
                SetTextProportional(1)
                SetTextScale(0.6, 0.6)
                SetTextColour(255, 255, 255, 255)
                SetTextEntry("STRING")
                SetTextCentre(1)
                AddTextComponentString(string.format("Time Left: %02d:%02d", minutes, seconds))
                DrawText(0.5, 0.02)
            end
            
            -- Display role information
            local roleText = "Role: " .. (playerRole == 'cop' and 'Police Officer' or 'Robber')
            if gameState.isPlayerArrested then
                roleText = roleText .. " (ARRESTED)"
            end
            
            SetTextFont(4)
            SetTextProportional(1)
            SetTextScale(0.4, 0.4)
            SetTextColour(255, 255, 255, 255)
            SetTextEntry("STRING")
            AddTextComponentString(roleText)
            DrawText(0.02, 0.02)
            
            -- Show arrest instruction for cops
            if playerRole == 'cop' and not isArresting then
                local nearbyRobbers = false
                local nearbyPlayers = GetNearbyPlayers(Config.ArrestDistance)
                for _, nearbyPlayer in ipairs(nearbyPlayers) do
                    for _, robberId in ipairs(gameState.robbers) do
                        if robberId == nearbyPlayer.id then
                            nearbyRobbers = true
                            break
                        end
                    end
                end
                
                if nearbyRobbers then
                    SetTextFont(4)
                    SetTextProportional(1)
                    SetTextScale(0.4, 0.4)
                    SetTextColour(255, 255, 0, 255)
                    SetTextEntry("STRING")
                    AddTextComponentString("Press [E] to arrest")
                    DrawText(0.02, 0.95)
                end
            end
        else
            Citizen.Wait(500) -- Reduce frequency when game is not active
        end
    end
end)

-- Event handlers
RegisterNetEvent('cr:gameStarted')
AddEventHandler('cr:gameStarted', function(cops, robbers, chaseTime)
    gameActive = true
    gameState.cops = cops
    gameState.robbers = robbers
    gameEndTime = GetGameTimer() + (chaseTime * 1000)
    
    -- Determine player role
    local playerId = GetPlayerServerId(PlayerId())
    for _, copId in ipairs(cops) do
        if copId == playerId then
            playerRole = 'cop'
            break
        end
    end
    
    if not playerRole then
        for _, robberId in ipairs(robbers) do
            if robberId == playerId then
                playerRole = 'robber'
                break
            end
        end
    end
    
    ShowNotification("Game started! You are a " .. (playerRole == 'cop' and 'Police Officer' or 'Robber'))
    
    -- Show character selection
    ShowCharacterSelection(playerRole)
end)

RegisterNetEvent('cr:gameEnded')
AddEventHandler('cr:gameEnded', function(results)
    gameActive = false
    playerRole = nil
    gameEndTime = 0
    gameState.isPlayerArrested = false
    ClearPlayerBlips()
    
    local winMessage = ""
    if results.winners == 'cops' then
        winMessage = "Police Win! All robbers arrested."
    elseif results.winners == 'robbers' then
        winMessage = "Robbers Win! They survived the chase."
    else
        winMessage = "Game ended by admin."
    end
    
    ShowNotification(winMessage)
    
    -- Show detailed results
    SendNUIMessage({
        type = 'showResults',
        results = results,
        winMessage = winMessage
    })
    ShowUI()
end)

RegisterNetEvent('cr:characterSelected')
AddEventHandler('cr:characterSelected', function(characterModel)
    HideUI()
    -- Show vehicle selection after character selection
    ShowVehicleSelection(playerRole)
end)

RegisterNetEvent('cr:vehicleSelected')
AddEventHandler('cr:vehicleSelected', function(vehicleModel)
    HideUI()
    -- Spawn the player with selected character and vehicle
    local characterModel = nil -- This should be stored from character selection
    SpawnPlayer(playerRole, characterModel, vehicleModel)
    CreatePlayerBlips()
end)

RegisterNetEvent('cr:playerArrested')
AddEventHandler('cr:playerArrested', function(arrestedId, copId)
    local playerId = GetPlayerServerId(PlayerId())
    
    if arrestedId == playerId then
        gameState.isPlayerArrested = true
        ShowNotification("You have been arrested!")
        
        -- Freeze player
        local playerPed = PlayerPedId()
        FreezeEntityPosition(playerPed, true)
        SetEntityCanBeDamaged(playerPed, false)
    else
        local arrestedName = GetPlayerName(GetPlayerFromServerId(arrestedId))
        local copName = GetPlayerName(GetPlayerFromServerId(copId))
        ShowNotification(arrestedName .. " was arrested by " .. copName .. "!")
    end
    
    -- Remove arrested player's blip
    if playerBlips[arrestedId] then
        RemoveBlip(playerBlips[arrestedId])
        playerBlips[arrestedId] = nil
    end
end)

-- NUI Callbacks
RegisterNUICallback('selectCharacter', function(data, cb)
    TriggerServerEvent('cr:selectCharacter', data.model)
    cb('ok')
end)

RegisterNUICallback('selectVehicle', function(data, cb)
    TriggerServerEvent('cr:selectVehicle', data.model)
    cb('ok')
end)

RegisterNUICallback('closeUI', function(data, cb)
    HideUI()
    cb('ok')
end)

-- Commands
RegisterCommand('startgame', function()
    TriggerServerEvent('cr:startGame')
end, false)

RegisterCommand('joingame', function()
    TriggerServerEvent('cr:requestGameState')
end, false)

-- Initialize
AddEventHandler('onResourceStart', function(resourceName)
    if GetCurrentResourceName() ~= resourceName then
        return
    end
    
    print('[Cops & Robbers] Client script loaded successfully')
end)