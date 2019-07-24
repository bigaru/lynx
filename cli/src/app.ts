#!/usr/bin/env node

import c from 'ansi-colors'
import table from 'text-table'
import { BackendService } from './BackendService'
import { Config, ConfigService } from './ConfigService'
import prompts, { PromptObject } from 'prompts'

enum CMD {
    INIT = 'init',
    HELP = 'help',
    FETCH = 'fetch',
    DECRYPT = 'decrypt',
}

const initQuestion: PromptObject[] = [
    {
        type: 'text',
        name: 'host',
        message: 'Enter the Hostname',
        initial: 'http://localhost:3000'
    },
    {
        type: 'password',
        name: 'totp',
        message: 'Enter the Secret TOTP (in HEX format)',
    },
    {
        type: 'password',
        name: 'confirmTotp',
        message: 'Confirm the Secret TOTP',
    },
    {
        type: 'text',
        name: 'key',
        message: 'Enter the path of Private Key',
    },
    {
        type: 'password',
        name: 'password',
        message: 'Enter the Private Key Password',
    },
    {
        type: 'password',
        name: 'confirmPassword',
        message: 'Confirm the Private Key Password',
    },
]

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

function showError(text: string): void{
    console.log(c.red(text))
}

function init(){
    prompts(initQuestion).then(result => {
        let valid = true;
        const { totp, confirmTotp, password, confirmPassword } = result
        
        if(totp !== confirmTotp){
             showError('TOTP does not match Confirm TOTP')
             valid = false;
        }

        if(password !== confirmPassword){
             showError('Private Key Password does not match Confirm Password')
             valid = false;
        }

        if(valid){
            const { host, key } = result
            const config: Config = { host, totp, key, password }
            ConfigService.save(config);
        }

    })
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

