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
                result.live_url = `http://127.0.0.1:5000/api/doc/single/${id}`
                res.setHeader('Content-Type', 'application/json')
                res.send(result)
            }
        });
    }
})

// Get Doc Info By The Doc Id 

app.get('/api/doc/single/:id',async(req,res)=>{
   
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


// get image from the db using piping 

app.get('/api/media/view/:id',async(req,res)=>{
    await db.get(req.params.id,(err,data)=>{
        if(err){
            res.setHeader('Content-Type','application/json')
            res.send({status:"failed",info:"Invalid Id"})
        }else{
            // Data is Is The Whole Doc 
            // attachments is the array of files objects the f
            let attachmentName = Object.keys(data._attachments)[0] // dethc firts filrs file object name
            let attachmentObject = data._attachments[attachmentName] // get the file object to get the fill type info
            res.setHeader('Content-Type',attachmentObject.content_type) // set the header as per the file type
            db.attachment.getAsStream(req.params.id,attachmentName).pipe(res) // stream line the file to the user
        }
    })
})

app.get('/api/doc/list',async(req,res)=>{
    //{include_docs: true} to return the the docs otherwise 
    // only id,key, and _rev will be returned
    await db.list({include_docs: true}).then((body)=>{
        res.setHeader('Content-Type','application/json')
        // body returns the Whole db body
        // rows contains all the docs 
        res.send({data: body.rows, status:"okay"}) //
    }).catch((err)=>{
        res.setHeader('Content-Type','application/json')
        res.send({data: "DB Error",status:"failed"})
    })

    
})



app.listen(5000, ()=>{
    console.log("Server Started")
})

