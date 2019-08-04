#!/usr/bin/env node

import c from 'ansi-colors'
import table from 'text-table'
import { BackendService, Memo } from './BackendService'
import { Config, ConfigService } from './ConfigService'
import prompts, { PromptObject } from 'prompts'
import * as pgp from 'openpgp'
import fs from 'fs-extra'

enum CMD {
    INIT = 'init',
    HELP = 'help',
    FETCH = 'fetch',
    DECRYPT = 'decrypt',
    REMOVE = 'remove',
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
            ConfigService
             .get()
             .then(pickAndDecrypt)
            break

        case CMD.REMOVE: 
            ConfigService
             .get()
             .then(selectAndRemove)
            break;

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

const decryptMemo = (config: Config) => async (memo: Memo) => {
    const privKeyObj = await fs.readFile(config.key, 'utf8')
                               .then(privKey => pgp.key.readArmored(privKey))
                               .then(o => o.keys[0])

    await privKeyObj.decrypt(config.password);


    const decOpt: pgp.DecryptOptions = {
        message: await pgp.message.readArmored(memo.content),
        privateKeys: [privKeyObj],
        format: 'binary'
    }
    const plaintext = (await pgp.decrypt(decOpt)).data as Uint8Array;
    const notUsedName = findNewName(process.env.HOME + '/Downloads/', memo.name)
    fs.outputFile(notUsedName, plaintext)
    console.log('successfully decrypted & saved: ' + c.green(notUsedName))
}

function findNewName(dir: string, filename: string){
    let counter = 0
    const name = filename.substring(0, filename.lastIndexOf('.'))
    const extension = filename.substring(filename.lastIndexOf('.'), filename.length)

    while(fs.pathExistsSync(dir + filename)){
        filename = `${name}_${counter}${extension}`
        counter++;
    }

    return dir+filename;
}

async function pickAndDecrypt(config: Config){
    const memos = await BackendService.fetchAll(config)
    const decrypter = decryptMemo(config)

    if(memos.length < 0){
        showError('No memos for decryption')
        return;
    }

    const choices = memos.map(m => { return { title: `${m.name} (${m._id})`, value: m._id }})
    const question: PromptObject = {
        type: 'select',
        name: 'value',
        message: 'Pick a Memo',
        choices: choices
    }

    prompts(question)
     .then(res => memos.find(m => m._id === res.value)!)
     .then(decrypter)
}

async function selectAndRemove(config: Config){
    const memos = await BackendService.fetchAll(config)
    const removeMany = BackendService.removeMany(config)

    if(memos.length < 0){
        showError('No memos for removal')
        return;
    }

    const choices = memos.map(m => { return { title: `${m.name} (${m._id})`, value: m._id }})
    const question: PromptObject = {
        type: 'multiselect',
        name: 'value',
        message: 'Select memos for removal',
        choices: choices,
    }

    prompts(question)
     .then(a => a.value)
     .then(removeMany)
}
