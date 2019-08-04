import fs from 'fs-extra'
import speakeasy from 'speakeasy'
import * as pgp from 'openpgp'
import axios, { AxiosResponse } from 'axios'
import { Config } from './ConfigService';

export interface Memo {
    _id: string,
    content: string,
    name: string
}

export class BackendService {
    private static async getToken(config: Config){
        return speakeasy.totp({ secret: config.totp, encoding: 'hex'})
    }

    private static async signDetached(config: Config, plaintext: string){

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

    private static async getAuthorization(config: Config){
        const token = await this.getToken(config)
        const signature = await this.signDetached(config, token)
        
        return token + "." + signature
    }

    static fetchAll = (config: Config): Promise<Memo[]> => 
        BackendService
         .getAuthorization(config)
         .then(authToken => axios
                            .get<Memo[]>(config.host + '/memos/', { headers: { Authorization : authToken } })
                            .then(res => res.data)
        )
    
    static removeMany = (config: Config) => (ids: string[]): Promise<AxiosResponse<void>> =>
        BackendService
         .getAuthorization(config)
         .then(authToken => { 
            const axiosConfig = { 
                 headers: { Authorization : authToken },
                 data: ids 
            }

            return axios.delete<void>(config.host + '/memos/', axiosConfig)}
        )
    

}