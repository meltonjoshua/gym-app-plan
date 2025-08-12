fx_version 'cerulean'
game 'gta5'

author 'FiveM Cops & Robbers Script'
description 'Complete cops and robbers chase game with character selection, car selection, and blip system'
version '1.0.0'

-- Server scripts
server_scripts {
    'config.lua',
    'server/server.lua'
}

-- Client scripts
client_scripts {
    'config.lua',
    'client/client.lua'
}

-- UI files
ui_page 'ui/index.html'

files {
    'ui/index.html',
    'ui/style.css',
    'ui/script.js'
}

-- Dependencies
dependencies {
    '/server:4752', -- Minimum server version
    '/onesync'       -- OneSync required for multiplayer sync
}