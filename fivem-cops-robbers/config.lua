Config = {}

-- Game Settings
Config.ChaseTime = 10 * 60 -- 10 minutes in seconds
Config.MaxPlayers = 16     -- Maximum players in a game
Config.MinCops = 2         -- Minimum cops required to start
Config.MinRobbers = 1      -- Minimum robbers required to start

-- Spawn Locations
Config.SpawnLocations = {
    cops = {
        {x = 425.1, y = -979.5, z = 30.7, heading = 96.0}, -- Mission Row PD
        {x = 441.8, y = -982.3, z = 30.7, heading = 180.0},
        {x = 459.5, y = -990.4, z = 24.9, heading = 90.0}
    },
    robbers = {
        {x = -1037.8, y = -2738.0, z = 20.2, heading = 240.0}, -- Airport
        {x = -1042.5, y = -2745.8, z = 21.4, heading = 150.0},
        {x = -1048.2, y = -2752.1, z = 20.9, heading = 60.0}
    }
}

-- Police Vehicles
Config.PoliceVehicles = {
    {model = 'police', label = 'Police Cruiser'},
    {model = 'police2', label = 'Police Buffalo'},
    {model = 'police3', label = 'Police Interceptor'},
    {model = 'sheriff', label = 'Sheriff Cruiser'},
    {model = 'fbi', label = 'FBI SUV'},
    {model = 'policeb', label = 'Police Bike'}
}

-- Robber Vehicles
Config.RobberVehicles = {
    {model = 'adder', label = 'Adder'},
    {model = 'zentorno', label = 'Zentorno'},
    {model = 'turismor', label = 'Turismo R'},
    {model = 'osiris', label = 'Osiris'},
    {model = 'entityxf', label = 'Entity XF'},
    {model = 'infernus', label = 'Infernus'},
    {model = 'vacca', label = 'Vacca'},
    {model = 'monroe', label = 'Monroe'}
}

-- Character Models
Config.CharacterModels = {
    cops = {
        {model = 's_m_y_cop_01', label = 'Police Officer'},
        {model = 's_m_m_snowcop_01', label = 'Highway Patrol'},
        {model = 's_m_y_sheriff_01', label = 'Sheriff Deputy'},
        {model = 's_m_m_fibsec_01', label = 'FBI Agent'},
        {model = 's_f_y_cop_01', label = 'Female Officer'}
    },
    robbers = {
        {model = 'a_m_y_mexthug_01', label = 'Street Criminal'},
        {model = 'a_m_y_stbla_02', label = 'Gang Member'},
        {model = 'a_m_m_business_01', label = 'Businessman'},
        {model = 'a_m_y_hipster_01', label = 'Hipster'},
        {model = 'a_f_y_business_04', label = 'Business Woman'},
        {model = 'a_m_o_beach_01', label = 'Beach Bum'}
    }
}

-- Blip Settings
Config.Blips = {
    cops = {
        sprite = 1,
        color = 3, -- Blue
        scale = 0.8,
        label = 'Police Officer'
    },
    robbers = {
        sprite = 2,
        color = 1, -- Red
        scale = 0.8,
        label = 'Robber'
    }
}

-- Arrest Settings
Config.ArrestDistance = 3.0  -- Distance for arrest
Config.ArrestTime = 5.0      -- Time to arrest (seconds)

-- Win Conditions
Config.WinConditions = {
    copsWin = "All robbers arrested",
    robbersWin = "Survived the chase"
}