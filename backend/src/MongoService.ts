import { MongoClient, Db, Collection } from 'mongodb'

interface Post{
    _id: string,
    content: string,
    name: string
}

export default class MongoService{
    private client: MongoClient
    private db: Db
    private incomings: Collection

    constructor(dbUrl: string, dbName: string){
        this.client = new MongoClient(dbUrl, { useNewUrlParser: true, poolSize: 10 })

        this.client.connect().then(client => {
            this.db = client.db(dbName)
            this.incomings = this.db.collection("incomings")
        })
    }

    addIncomings(document: object): Promise<{ ok: number, n: number }> {
        return this.incomings.insertOne(document)
                             .then(writeResult => writeResult.result)
    }

    getIncomings(): Promise<Post[]>{
        return this.incomings.find({})
                             .toArray()
    }

    close(){
        this.client.close()
    }
}
