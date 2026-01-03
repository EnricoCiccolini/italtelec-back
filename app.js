const express = require('express')
const app = express()
const port = 3004
const Router = require('./router/italtelecRouter')
const notFound = require('./middleware/notFound')
const errorHandler = require('./middleware/errorhandler')
const cors = require('cors')

app.use(cors({
    origin: process.env.FE_APP
}))

app.use(express.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.send('benvenuto nel database')
})

app.use('/italtelec', Router)

app.use(notFound)
app.use(errorHandler)

app.listen(port, () => {
    console.log(`sono in ascolto sulla porta ${port}`)
})