import { Request, Response, NextFunction } from 'express'
import sharp from 'sharp'
import crypto from 'crypto'
const { random } = require('make-random')

export default class CaptchaService{
    readonly MAX: number
    readonly TOLERANCE: number
    secret: string

    constructor(max: number, tolerance: number){
        this.MAX = max
        this.TOLERANCE = tolerance
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

        const toleranceRange = this.MAX * this.TOLERANCE
        const candidates: number[] = []
        for(let i = -toleranceRange; i <= toleranceRange; i++){
            candidates.push(i)
        }

        const rightCandidate = candidates
                                 .map(c => solution-c)
                                 .map(p => this.getHash(''+p))
                                 .filter(h => h === MAC)

        if(rightCandidate.length > 0) next()
        else res.sendStatus(400);
    }

}
