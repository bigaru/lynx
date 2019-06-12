import MongoService from './MongoService'
import express from 'express'
import MemoController from './MemoController'
import AuthenticationChecker from './AuthenticationChecker'

const app = express()
const port = process.env.PORT || 3000
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017'
const dbName = 'encryptedData'

const mongoService = new MongoService(dbUrl, dbName)
const authenticationChecker = new AuthenticationChecker()
const memoController = new MemoController(mongoService)

process.on('SIGINT', () => {
    mongoService.close()
    process.exit()
})

app.use(express.json())
app.use(express.static(__dirname + '/public'))
app.use('/css/', express.static(__dirname + '/../node_modules/bootstrap/dist/css/'))
app.use('/js/', express.static(__dirname + '/../node_modules/openpgp/dist/'))

app.get('/', (req, res) => res.sendFile('index.html'))

app.post('/memos/', memoController.addOne)
app.get('/memos/', authenticationChecker.isTokenCorrect, memoController.getAll)

app.all("/*",(req, res) => res.sendStatus(404))

app.listen(port, () => console.log(`app listening on port ${port}!`))
