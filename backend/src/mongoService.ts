import { MongoClient, Collection, InsertOneWriteOpResult } from 'mongodb'

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017'
const dbName = 'encryptedData'
const client = new MongoClient(dbUrl, { useNewUrlParser: true, poolSize: 10 })

let incomings: Collection

client
    .connect()
    .then(client => {
        const db = client.db(dbName);
        incomings = db.collection("incomings")
    })
    .catch(err => console.log(err))

export function addIncomings(document: object, callback: ( result: InsertOneWriteOpResult ) => void) {
    incomings.insertOne(document)
        .then(result => callback(result))
        .catch(err => console.log(err))
}

export function getIncomings(callback: (arr: any[]) => void){
    incomings.find({}).toArray()
        .then(res => callback(res))
        .catch(err => console.log(err))
}

process.on('SIGINT', () => {
    client.close()
    process.exit()
})