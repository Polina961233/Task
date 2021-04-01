require('dotenv').config()

const express = require('express')
const app = express()
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')


app.use(express.json())

const users = []

app.get('/user/:user',authenticateToken, (req, res) => {
res.json(users.filter(user=> user.user === req.user.body))
if (!user) res.status(404).send('The user does not exist')

})

app.post('/register',async (req, res) => {
  try {
    const hashedPassword = await bcryptjs.hash(req.body.password, 10)
    const user = { user: req.body.name, password: hashedPassword, firstName: req.body.firstName, lastName: req.body.lastName, adress:req.body.adress, 
        country: req.body.country, email:req.body.email, phone:req.body.phone }
    users.push(user)
    res.status(201).send()
  } catch {
    res.status(500).send()
  }
})

app.post('/login', async(req, res) => {
    const user = users.find(user => user.name === req.body.name)
    if (user == null) {
      return res.status(400).send('Cannot find user')
    }
    try {
    if(await bcryptjs.compare(req.body.password, user.password)) {
        const accessToken =jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)  
        res.json({accessToken: accessToken})
    } else {
      res.send('Wrong password')
    }
  } catch {
    res.status(500).send()
  }
})

app.put('/update/:user',authenticateToken,async (req, res,next) => {
    const user = users.find(user => user.name === req.body.name)
    if (!user) res.status(404).send('The user does not exist');


        user.firstName=req.body.firstName
        user.lastName=req.body.lastName
        user.phone= req.body.phone
        user.country=req.body.country
        user.email=req.body.email
        res.send(user)
    
})

app.delete('/unregister',authenticateToken,(req,res) => {
    const user = users.find(user => user.name === req.body.name)
    if (!user) res.status(404).send('The user does not exist');

    try {
            if(compare(req.body.password, user.password)) {
            users= users.filter(user => user.name !== req.body.name)
            res.status(204).send("The user has been deleted")
            } else {
            res.send('Wrong password')
            }
        } catch {
            res.status(500).send()
        }
})

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        console.log(err)
        if (err) return res.sendStatus(403)
        req.user = user
        next()
})
}

app.listen(4000)