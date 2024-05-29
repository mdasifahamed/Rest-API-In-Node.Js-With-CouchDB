require('dotenv').config()
const dbuser = process.env.DBUSER
const dbpass= process.env.DBPASS
const express = require('express')
const bodyParser =  require('body-parser')
const fileUploader = require('express-fileupload')
const nano = require('nano')(`http://${dbuser}:${dbpass}@couchdb:5984`) // To run the app in the locally cahnge the `cocuhdb` to `localhost` 
const app = express()
const db = nano.use('resapi')
app.use(express.static('upload'))
app.use(fileUploader())
app.use(bodyParser.json())




// EndPoint  To Create Docs 

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


// Api Update Docs 

app.put('/api/doc/single/update/:id', async(req,res)=>{

    await db.get(req.params.id,async (err, data)=>{
        if(err){
            res.setHeader('Content-Type','application/json')
            res.send({data: "DB Error",status:"Invalid Id"})
            return;
        }
        else{
            // Note: We Need Pass Alll Associated Filed With The Doc Other Wise It Will
            // It Will Only Kep The Given Filed And Deletes The All The Fields
            if(!req.body.name || !req.body.description) {
                res.setHeader('Content-Type','application/json')
                res.send({data: "Submiison Error ",status:"Invalid Submission"})
            } else {
                
                await db.insert({
                    _id:req.params.id,
                    _rev:data._rev, 
                    name: req.body.name,
                    description:req.body.description,
                    image_url:data.image_url,
                    _attachments:data._attachments},(err)=>{
    
                        if(err){
                            
                            res.setHeader('Content-Type','application/json')
                            res.send({data: "DB Error",status:"Failed To Update"})
                        }
                        else{
    
                            res.setHeader('Content-Type','application/json')
                            res.send({data: "Updated",status:"Okay",live_url: `http://127.0.0.1:5000/api/doc/single/${req.params.id}`})
                        }
                });


            }
            
        }
    })
})

// Add Attachment To Existing Doc 

app.put('/api/media/update/existing/attachment/:id', async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        res.setHeader('Content-Type', 'application/json');
        res.send({ data: "Error", status: "Invalid Submission" });
        return;
    }

    try {
        const check = await db.get(req.params.id);

        // Get The First Attachment
        const attachmentName = Object.keys(check._attachments)[0];

        if (!attachmentName) {
            res.setHeader('Content-Type', 'application/json');
            res.send({ data: "DB Error", status: "Doc Does Not Have Any Attachments" });
            return;
        }

        // Delete The Existing Attachment
        await db.attachment.destroy(check._id, attachmentName, { rev: check._rev });

        // Get The Image From The Client - Assuming it's in req.files
        const image = req.files.image;
        const updatedDoc = await db.get(req.params.id)
        // Add The New Attachment To The Doc
        await db.attachment.insert(check._id, image.name, image.data, image.mimetype, { rev: updatedDoc._rev });
        // Create Media Url For The New Image

        res.setHeader('Content-Type', 'application/json');
        res.send({ data: "Done", status: "Successfully Updated The Attachment" });

    } catch (err) {
        console.error(err);
        res.setHeader('Content-Type', 'application/json');
        res.send({ data: "DB Error", status: "Failed To Update The Attachment" });
    }
});

// Add Attachments To The Exiting Doc 


app.put('/api/media/add/attachmnets/:id', async(req,res)=>{

    if(!req.files){
        res.setHeader('Content-Type', 'application/json');
        res.send({ data: "Error", status: "Invalid Submission" });
        return;
    }

    try {

        const doc = await db.get(req.params.id);
        const image  = req.files.image;

        await db.attachment.insert(doc._id, image.name, image.data, image.mimetype, {rev:doc._rev})

        res.setHeader('Content-Type', 'application/json')
        res.send({data:"done", status:"succesFully Added the Doc"})
        return;
    } catch(err) {
        res.setHeader('Content-Type', 'application/json')
        res.send({data:"Db Eroor", status:"Failed To Updated"})
        return;
    }

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

app.delete('/api/doc/remove/:id', async(req,res)=>{
    try {
        const doc = await db.get(req.params.id)

        await db.destroy(doc._id,doc._rev)
        res.setHeader('Content-Type','application/json')
        res.send({data: "Done",status:"Success Fully Deleted"})
    } catch (error) {
        console.log(error)
        res.setHeader('Content-Type','application/json')
        res.send({data: "DB Error",status:"failed"})
    }
})


// Get All The Attchments Url Of An Doc

app.get('/api/media/all/:id',async(req,res)=>{
    try {
        const doc = await db.get(req.params.id)
    if(doc._attachments === undefined){
        res.setHeader('Content-Type','application/json')
        res.send({data: "DB Error",status:"Does Not Contain Any Documnetations"})
        return;
    }else {
        const attchtments = Object.keys(doc._attachments)
        let urlList = []
        attchtments.map((el,index)=>{
            let url = `http://127.0.0.1:5000/api/media/view/${doc._id}/${index}`
                urlList.push(url)
            });
        res.setHeader('Content-Type','application/json')
        res.send({data: urlList,status:"All The Attachmnet Url Is Sent"})
    }
    } catch (error) {
        res.setHeader('Content-Type','application/json')
        res.send({data: 'Db Error', status:"Invalid ID"})
    }
    
    
});

// display invividual Attachemnts From Along With Attachment Names

app.get('/api/media/view/:id/:attachment', async(req,res)=>{
    try {
        const doc = await db.get(req.params.id)
        const attachmentName = Object.keys(doc._attachments)[req.params.attachment]
        const attachmentObject = doc._attachments[attachmentName]
        res.setHeader('Content-Type', attachmentObject.content_type)
        db.attachment.getAsStream(req.params.id,attachmentName).pipe(res)
    } catch (error) {
        console.log(error);
        res.setHeader('Content-Type','application/json')
        res.send({data:'Db Erro', status:"Failed Display"})

    }
})




app.listen(5000, ()=>{
    console.log("Server Started")
})

