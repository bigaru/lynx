#!/usr/bin/env node

import minimist from 'minimist'
import fs from 'fs-extra'
import speakeasy from 'speakeasy'
import * as pgp from 'openpgp'
import axios from 'axios'
import table from 'text-table'

enum CMD {
    INIT = 'init',
    HELP = 'help',
    FETCH = 'fetch',
    DECRYPT = 'decrypt',
}

const configPath = process.env.HOME + '/.config/in.abaddon/lynx/config.json'
interface Config {
    host: string,
    totp: string,
    key: string,
    password: string
}

interface Memo {
    _id: string,
    content: string,
    name: string
}

if(process.argv.length > 2){
    const command = process.argv[2]

    switch (command) {
        case CMD.INIT: 
            init()
            break

        case CMD.FETCH: 
            getConfig().then(config => { 
                getAuthorization(config)
                 .then(authToken => makeRequest(config, authToken))
                 .then(memos => memos.map(m => [m._id, m.name]))
                 .then(m => {
                     m.unshift(['ID', 'Filename'])
                     return m;
                 })
                 .then(table)
                 .then(console.log)
            })

            break

        case CMD.DECRYPT: 
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
    
    if(host && totp && key && password){
        fs.outputJSONSync(configPath, { host, totp, key, password })
    }else{
        console.log("Usage: lynx init --host <URL> --totp <secret key> --key <priv key path> --password <pw>")
    }
}

async function getConfig(): Promise<Config>{
    return fs.readJSON(configPath).then((c: Config) => {
        if(!c.host || !c.totp || !c.key || !c.password) {
            throw new Error("not initialized")
        }

        return c;
    })
}

async function getToken(config: Config){
    return speakeasy.totp({ secret: config.totp, encoding: 'hex'})
}

async function getAuthorization(config: Config){
    const token = await getToken(config)
    const signature = await signDetached(config, token)
    
    return token + "." + signature
}

async function signDetached(config: Config, plaintext: string){

    const privKeyObj = await fs.readFile(config.key, 'utf8')
                     .then(privKey => pgp.key.readArmored(privKey))
                     .then(o => o.keys[0])

    await privKeyObj.decrypt(config.password);

    const options = {
        message: pgp.message.fromText(plaintext),
        privateKeys: [privKeyObj],
        armor: true,
        detached: true,
    };
    
    const sig = (await pgp.sign(options)).signature as string
    const sigWithoutSpace = sig.replace(/[\r\n\t\f\v]/g,'')
    const match = sigWithoutSpace.match(/org([^-]*)/)!

    return match[1];
}

async function makeRequest(config: Config, authToken: string){
     return axios
      .get<Memo[]>(config.host + '/memos', { headers: { Authorization : authToken } })
      .then(res => res.data)
}
