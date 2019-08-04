import { MongoClient, Collection, ObjectId } from 'mongodb'

interface Memo{
    _id: string,
    content: string,
    name: string
}

export default class MongoService{
    private client: MongoClient
    private readonly dbName: string
    private readonly dbUrl: string

    constructor(dbUrl: string, dbName: string){
        this.dbName = dbName
        this.dbUrl = dbUrl
        
        this.connect()
            .catch(_err => console.error("MongoDb driver can not connect"))
    }

    private connect = () => {
        this.client = new MongoClient(this.dbUrl, { useNewUrlParser: true, poolSize: 5, autoReconnect: false })
        this.client.on('close', () => console.error('MongoDb driver lost connection'));
        return this.client.connect()
    }
    
    private getCollection = (name: string): Promise<Collection> => {
        if (this.client.isConnected()) {
            return new Promise((resolve, _reject) => 
                resolve(
                    this.client.db(this.dbName).collection(name)
                )
            ) 
        }
        else {
            return this.connect().then(newClient => 
                newClient.db(this.dbName).collection(name)
            )
        }
    }

    addMemo = (document: object): Promise<{ ok: number, n: number }> => {
        return this.getCollection("memos")
                    .then(col => col.insertOne(document))
                    .then(writeResult => writeResult.result)
    }

    getMemos = (): Promise<Memo[]> => {
        return this.getCollection("memos")
                    .then(col => col.find({}).toArray())
    }

    removeMemos = (documentIds: string[]): Promise<{ ok?: number, n?: number }> => {
        const objectIds = documentIds.map(i => ObjectId.createFromHexString(i))
        return this.getCollection("memos")
            .then(col => col.deleteMany({ _id: { $in:objectIds }}))
            .then(res => res.result);
    }

    close = () => {
        this.client.close()
    }
}
