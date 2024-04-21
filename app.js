require('dotenv').config()
const dbuser = process.env.DBUSER
const dbpass= process.env.DBPASS
const express = require('express')
const bodyParser =  require('body-parser')
const fileUploader = require('express-fileupload')
const nano = require('nano')(`http://${dbuser}:${dbpass}@localhost:5984`)
const app = express()
const db = nano.use('resapi')
app.use(express.static('upload'))
app.use(fileUploader())
app.use(bodyParser.json())

// Method To Create Docs 

app.post("/api/create/", async(req,res)=>{

    var result = {
        status:false,
        info:"",
        live_url:"",
    }
    // Server Side Input validation
    if(req.body.id === undefined || !req.files
       || req.body.name === undefined || req.body.description === undefined){

        result.info = "Invalid Submissions"
        res.setHeader('Content-Type', 'application/json')
        res.send(result)
    
    } else {

        let id = req.body.id; // Id For Counch DB  Unique Id
        let file = req.files.image // extracting the tih the use "express-fileupload"

        await db.multipart.insert({name:req.body.name,description:req.body.description,image_url:`http://127.0.0.1:5000/api/media/view/${id}`},
            [{name:file.name,data:file.data,content_type:file.mimetype}],
            id,(err)=>{

            if(err){
                // If Any Error From DB Side
                result.info = "Failed To Save Data"
                res.setHeader('Content-Type', 'application/json')
                res.send(result)
                console.log(err)

            }
            else{

                result.status = true
                result.info = "Successfully Uploaded"
                result.live_url = `http://127.0.0.1:5000/api/doc/${id}`
                res.setHeader('Content-Type', 'application/json')
                res.send(result)
            }
        });
    }
})

// Get Doc Info By The Doc Id 

app.get('/api/doc/:id',async(req,res)=>{
   
    await db.get(req.params.id,(err,data)=>{
        if(err){
            res.setHeader('Content-Type','application/json')
            res.send({status:"failed",info:"Invalid Id"})
        }
        else{
            res.setHeader('Content-Type','application/json')
            res.send(data)
        }
    })

})



app.listen(5000, ()=>{
    console.log("Server Started")
})

