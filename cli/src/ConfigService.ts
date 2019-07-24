import fs from 'fs-extra'
import keytar from 'keytar'

const configPath = process.env.HOME + '/.config/in.abaddon.lynx/config.json'

export interface Config {
    host: string,
    totp: string,
    key: string,
    password: string
}

export class ConfigService{
    static save(config: Config): void {
        const { host, totp, key, password } = config;

        fs.outputJSONSync(configPath, { host, key })
        
        keytar.setPassword('lynx', 'totp', totp);
        keytar.setPassword('lynx', 'password', password);
    }

    static async get(): Promise<Config> {
        const creds = await keytar.findCredentials('lynx');
        const config = await fs.readJSON(configPath)
    
        const existsTotp = creds.find(c => c.account === 'totp')
        const existsPW = creds.find(c => c.account === 'password')
        
        if (existsTotp && existsPW && config.host && config.key) {
            config.totp = existsTotp.password
            config.password = existsPW.password
            return config;
        }
    
        throw new Error('Lynx is not initialized')
    }

}
