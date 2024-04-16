require('dotenv').config()

const express = require('express')
const bodyParser =  require('body-parser')
const app = express()
const dbuser = process.env.DBUSER
const dbpass= process.env.DBPASS
const nano = require('nano')(`http://${dbuser}:${dbpass}@localhost:5984`)

app.use(bodyParser.json())

nano.db.list((err,data)=>{
    if (err){
        console.log(err);
    }
    console.log(data)

})

app.get('/',(req,res)=>{
    res.send("okay")
})

app.listen(5000, ()=>{
    console.log("Server Started")
})

