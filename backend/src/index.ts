import MongoService from './MongoService'
import AuthenticationChecker from './AuthenticationChecker'
import express from 'express'

const app = express()
const port = process.env.PORT || 3000
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017'
const dbName = 'encryptedData'

const authChecker = new AuthenticationChecker()
const mongoService = new MongoService(dbUrl, dbName)

process.on('SIGINT', () => {
    mongoService.close()
    process.exit()
})

app.use(express.json())
app.use(express.static(__dirname + '/public'))
app.use('/css/', express.static(__dirname + '/../node_modules/bootstrap/dist/css/'))
app.use('/js/', express.static(__dirname + '/../node_modules/openpgp/dist/'))

app.get('/', (req, res) => res.sendFile('index.html'))

app.post('/memos/', (req, res) => {
    const body = req.body
    
    if(!body || !body.name || !body.content) res.sendStatus(400)
    else{
        mongoService.addMemo(body)
                    .then(result => {
                        if(result.ok) res.status(201).send(body)
                        else res.sendStatus(500)
                    })
                    .catch(err => { res.sendStatus(500) })
    }
})

app.get('/memos/', (req, res) => {
    const authToken = req.header('Authorization') || ""

    authChecker.check(authToken).then(authValid => {
        if(!authValid) res.sendStatus(401)
        else {
            mongoService.getMemos()
                        .then(memos => { res.json(memos) })
                        .catch(err => { res.sendStatus(500) })
        }
    })
})

app.all("/*",(req, res) => res.sendStatus(404))

app.listen(port, () => console.log(`app listening on port ${port}!`))
