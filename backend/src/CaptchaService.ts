import { Request, Response, NextFunction } from 'express'
import sharp from 'sharp'
import crypto from 'crypto'
const { random } = require('make-random')

export default class CaptchaService{
    MAX: number
    secret: string

    constructor(max: number){
        this.MAX = max;
        crypto.randomBytes(64, (err, buf) => this.secret = buf.toString('hex'))
    }

    private getHash = (solution: string) => {
        return crypto.createHmac('SHA256', this.secret)
        .update(solution)
        .digest('base64')
    }

    private makeImageLarger = (leftPadding: number): Promise<[Buffer, number]> => {
        const complement = this.MAX - leftPadding;

        return sharp(__dirname + '/assets/bg.png')
        .extend({
            top: 0,
            bottom: 0,
            left: leftPadding,
            right: complement,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .toBuffer()
        .then(buf => [buf, leftPadding])
    }

    private completeResponse = (res: Response) => (tuple: [Buffer, number]) => {
        const [buf, randVal] = tuple
        res.cookie('Captcha-MAC', this.getHash(''+randVal))
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': buf.length,
        })
        
        res.end(buf);
    }

    getNext = (req: Request, res: Response) => {
        const responseFinalizer = this.completeResponse(res)

        random(this.MAX)
            .then(this.makeImageLarger)
            .then(responseFinalizer)
            .catch((err: any) => {
                console.log(err)
                res.sendStatus(500);
            })
    }

    isCaptchaCorrect = (req: Request, res: Response, next: NextFunction) => {
        const solution = req.cookies['Captcha-Response']
        const MAC = req.cookies['Captcha-MAC']

        const possibles = [-5,-4,-3,-2,-1,0,1,2,3,4,5]
                            .map(r => solution-r)
                            .map(p => this.getHash(''+p))

        if(possibles.filter(h => h === MAC).length > 0) next()
        else res.sendStatus(400);
    }

}
