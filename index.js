const mongoService = require('./mongoService.js')
const general = require('./general.js')
const express = require('express')

const app = express()
const port = process.env.PORT || 3000
general.insertPublicKeyinJS()

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

app.all("/*",(req, res) => res.sendStatus(404))

app.listen(port, () => console.log(`app listening on port ${port}!`))
