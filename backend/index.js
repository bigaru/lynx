const mongoService = require('./mongoService.js')
const { insertPublicKeyInJS, checkAuthToken } = require('./authBundle.js')
const express = require('express')

const app = express()
const port = process.env.PORT || 3000

insertPublicKeyInJS()

app.use(express.json())
app.use(express.static('public'))
app.get('/', (req, res) => res.sendFile('index.html'))

app.post('/posts/', (req, res) => {
    const body = req.body
    
    if(!body || !body.name || !body.content) res.sendStatus(400)
    else{

        mongoService.addIncomings(body, result => {
            if(result.result.ok) res.status(201).send(body)
            else res.sendStatus(500)            
        })

    }
})

app.get('/posts/', (req, res) => {
    checkAuthToken(req.header('Authorization')).then(authValid => {
        if (!authValid) res.sendStatus(401)
        else {
            mongoService.getIncomings(result => {
                res.json(result)
            })
        }
    })
})

app.all("/*",(req, res) => res.sendStatus(404))

app.listen(port, () => console.log(`app listening on port ${port}!`))
