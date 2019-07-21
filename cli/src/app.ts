#!/usr/bin/env node

import minimist from 'minimist'
import table from 'text-table'
import { BackendService } from './BackendService'
import { Config, ConfigService } from './ConfigService';

enum CMD {
    INIT = 'init',
    HELP = 'help',
    FETCH = 'fetch',
    DECRYPT = 'decrypt',
}

if(process.argv.length > 2){
    const command = process.argv[2]

    switch (command) {
        case CMD.INIT: 
            init()
            break

        case CMD.FETCH: 
            ConfigService
             .get()
             .then(showMemos)
             .catch((e: Error) => console.error(e.message))
            break

        case CMD.DECRYPT: 
            break
        case CMD.HELP: 
            break;
    }
    
}else{
    console.log("show help");
}

function init(){
    const opts: minimist.Opts = {
        alias: { h: 'host', t: 'totp', k: 'key', p:'password' },
        default: { h: 'http://localhost:3000' }
    }
    
    const args = minimist(process.argv.slice(3), opts)
    const { host, totp, key, password } = args;
    
    const config: Config = { host, totp, key, password }
    const isSaveSuccessful = ConfigService.save(config);
    
    if (!isSaveSuccessful) {
        console.log("Usage: lynx init --host <URL> --totp <secret key> --key <priv key path> --password <pw>")
    }
}

function showMemos(config: Config) {
    BackendService.fetchAll(config)
    .then(memos => memos.map(m => [m._id, m.name]))
    .then(m => {
        m.unshift(['ID', 'Filename'])
        return m;
    })
    .then(table)
    .then(console.log)
}

