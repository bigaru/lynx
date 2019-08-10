import { Request, Response } from 'express'
import sharp from 'sharp'

export default class CaptchaService{

    getNext = (req: Request, res: Response) => {

        sharp(__dirname + '/assets/bg.png')
        .extend({
            top: 0,
            bottom: 0,
            left: 200,
            right: 0,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .toBuffer()
        .then(buf => {
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': buf.length,
                'X-Captcha-MAC': 200+'Hash'
             })
             
             res.end(buf);
        })
        .catch(err => {
            console.log(err)
            res.sendStatus(500);
        })
    }

}
