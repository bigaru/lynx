import MongoService from './MongoService'
import express from 'express'
import MemoController from './MemoController'
import CaptchaService from './CaptchaService'
import AuthenticationChecker from './AuthenticationChecker'
import SecurityHeaders from './SecurityHeaders'
import cookieParser from 'cookie-parser'

const app = express()
const port = process.env.PORT || 3000
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017'
const dbName = 'encryptedData'
const payLoadSize = process.env.PAYLOAD_SIZE || '100mb'

const mongoService = new MongoService(dbUrl, dbName)
const authenticationChecker = new AuthenticationChecker()
const memoController = new MemoController(mongoService)
const captchaService = new CaptchaService(400,0.0075)

process.on('SIGINT', () => {
    mongoService.close()
    process.exit()
})

app.use(SecurityHeaders)
app.use(cookieParser())
app.use(express.json({ limit: payLoadSize }))
app.use(express.static(__dirname + '/public'))
app.use('/css/', express.static(__dirname + '/../node_modules/bootstrap/dist/css/'))
app.use('/js/', express.static(__dirname + '/../node_modules/openpgp/dist/'))
app.use('/js/', express.static(__dirname + '/../node_modules/pako/dist/'))

app.get('/', (req, res) => res.sendFile('index.html'))
app.get('/captcha.png', captchaService.getNext)

app.post('/memos/', captchaService.isCaptchaCorrect, memoController.addOne)
app.delete('/memos/', authenticationChecker.isTokenCorrect, memoController.removeMany)
app.get('/memos/', authenticationChecker.isTokenCorrect, memoController.getAll)

app.all("/*",(req, res) => res.sendStatus(404))

app.listen(port, () => console.log(`app listening on port ${port}!`))
