import MongoService from './MongoService'
import { Request, Response } from 'express'

interface Memo{
    _id: string,
    content: string,
    name: string
}

export default class MemoController{
    private dbService: MongoService

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
        this.dbService.getMemos()
                        .then(memos => res.json(memos))
                        .catch(err => { res.sendStatus(500) })
    }

}
