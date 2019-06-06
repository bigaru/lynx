const MongoClient = require('mongodb').MongoClient

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017'
const dbName = 'encryptedData'
const client = new MongoClient(dbUrl)

exports.addIncomings = function (document, callback) {
    client.connect(err => {
        const coll = client.db(dbName).collection("incomings")
    
        coll.insertOne(document, (err, result) => {
            callback(result)
            client.close()
        })
      
    })
}