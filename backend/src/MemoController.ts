import MongoService from './MongoService';
import { Request, Response } from 'express'
import AuthenticationChecker from './AuthenticationChecker';


interface Memo{
    _id: string,
    content: string,
    name: string
}

export default class MemoController{
    private dbService: MongoService
    private authChecker = new AuthenticationChecker()

    constructor(mongoService: MongoService){
        this.dbService = mongoService
    }

    addOne = (req: Request, res: Response) => {
        const body = req.body
    
        if(!body || !body.name || !body.content) res.sendStatus(400)
        else{
            this.dbService.addMemo(body)
                        .then(result => {
                            if(result.ok) res.status(201).send(body)
                            else res.sendStatus(500)
                        })
                        .catch(err => { res.sendStatus(500) })
        }
    }

    getAll = (req: Request, res: Response) => {
        const authToken = req.header('Authorization') || ""

        this.authChecker.check(authToken).then(authValid => {
            if(!authValid) res.sendStatus(401)
            else {
                this.dbService.getMemos()
                              .then(memos => res.json(memos))
                              .catch(err => { res.sendStatus(500) })
            }
        })
    }

}
