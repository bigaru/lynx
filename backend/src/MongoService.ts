import { MongoClient, Db, Collection } from 'mongodb'

interface Memo{
    _id: string,
    content: string,
    name: string
}

export default class MongoService{
    private client: MongoClient
    private db: Db
    private memos: Collection

    constructor(dbUrl: string, dbName: string){
        this.client = new MongoClient(dbUrl, { useNewUrlParser: true, poolSize: 10 })

        this.client.connect().then(client => {
            this.db = client.db(dbName)
            this.memos = this.db.collection("memos")
        })
    }

    addMemo = (document: object): Promise<{ ok: number, n: number }> => {
        return this.memos.insertOne(document)
                         .then(writeResult => writeResult.result)
    }

    getMemos = (): Promise<Memo[]> => {
        return this.memos.find({})
                         .toArray()
    }

    close = () => {
        this.client.close()
    }
}
