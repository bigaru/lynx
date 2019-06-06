const MongoClient = require('mongodb').MongoClient

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017'
const dbName = 'encryptedData'
const client = new MongoClient(dbUrl, { useNewUrlParser: true, poolSize: 10 })

let incomings

client.connect()
    .then(client => {
        const db = client.db(dbName);
        incomings = db.collection("incomings")
    })
    .catch(err => console.log(err))

exports.addIncomings = function(document, callback) {

    incomings.insertOne(document)
        .then(result => callback(result))
        .catch(err => console.log(err))
}

process.on('SIGINT', () => {
    client.close()
    process.exit()
})
