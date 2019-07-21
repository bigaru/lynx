#!/usr/bin/env node

import minimist from 'minimist'
import fs from 'fs-extra'
import speakeasy from 'speakeasy'
import * as pgp from 'openpgp'
import axios from 'axios'
import table from 'text-table'
import { Config, ConfigService } from './ConfigService';

enum CMD {
    INIT = 'init',
    HELP = 'help',
    FETCH = 'fetch',
    DECRYPT = 'decrypt',
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
            ConfigService.get().then(config => { 
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
