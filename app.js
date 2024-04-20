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
        let name = req.body.name;
        let description = req.body.description;
        let file = req.files.image // extracting the tih the use "express-fileupload"

        // Doc for CouchDb Doccument
        let doc = {
            name:name,
            description:description
        }

        await db.multipart.insert(doc,[{name:file.name,data:file.data,content_type:file.mimetype}]
        ,id,(err)=>{

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
                result.live_url = `127.0.0.1:5000/api/get/${id}`
                res.setHeader('Content-Type', 'application/json')
                res.send(result)
            }
        });
    }
     
})



app.listen(5000, ()=>{
    console.log("Server Started")
})

