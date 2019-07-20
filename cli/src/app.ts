#!/usr/bin/env node

import minimist from 'minimist'
import fs from 'fs-extra'

enum CMD {
    INIT = 'init',
    HELP = 'help',
    FETCH = 'fetch',
    DECRYPT = 'decrypt',
}

const configPath = process.env.HOME + '/.config/in.abaddon/lynx/config.json'


if(process.argv.length > 2){
    const command = process.argv[2]

    switch (command) {
        case CMD.INIT: 
            const opts: minimist.Opts = {
                alias: { h: 'host', t: 'totp' },
                default: { h: 'http://localhost:3000' }
            }
            const args = minimist(process.argv.slice(3), opts)
            const { host, totp } = args;
            
            if(host && totp){
                fs.outputJSONSync(configPath, { host, totp })
            }else{
                console.log("Usage: lynx init --host <URL> --totp <secret key>")
            }
        case CMD.FETCH: 
        
        case CMD.DECRYPT: 
        case CMD.HELP: 

            break;
    }
    
}else{
    console.log("show help");
}