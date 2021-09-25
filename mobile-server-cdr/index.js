const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const { default: axios } = require('axios');

const port = 3002
app.use(express.json())
app.use(bodyParser.urlencoded({extended:true}))

const db = mysql.createPool({
  host:'ls-ccfa65c87a47c1cc5fa9759a804aa838c7c336ae.cvoao2mpm2uh.eu-west-3.rds.amazonaws.com',
  user:'YounisAbdalla',
  password:'Foxhound-94',
  database:'CDRdb',
  port : '3306'
  
});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })

app.post('',(req,res) =>{
  const username = req.body.username;
  const password = req.body.password;
  const sqllogin = "SELECT * FROM users WHERE username = ? AND password = ?;"
  db.query(sqllogin, [username,password] , (err,result) =>{
      
      if(result.length > 0){
          res.send(result);
      }
      if(result.length == 0){
          res.send('no result');
      }

})});

app.get("/getUsers" , (req,res)=>{
  const sqlgetUsers = "SELECT name,rank,id,phone,position FROM users "
  db.query(sqlgetUsers , (err,result) =>{
  res.send(result);
 
      
     
  })})

  app.post('/recalls',(req,res) =>{
    const title = req.body.title;
    const body = req.body.body;
    const time = req.body.time;
    const date = req.body.date;
    const database = req.body.db;
    const timer = req.body.timer * 60000;
    const sqlPost = "INSERT INTO recalls (title,body,time,date,status,database_name) VALUES(?,?,?,?,?,?)"
    const sqlCreatTable = `CREATE TABLE ${database} LIKE users;`
    
    const sqlCopyFromTable = `INSERT INTO ${database} SELECT * FROM users;`
    const sqlInsertNewCol = `ALTER TABLE ${database}
    DROP COLUMN username,
    DROP COLUMN password,
    DROP COLUMN notification_token,
    DROP COLUMN auth,
    ADD COLUMN status VARCHAR(40) NOT NULL,
    ADD COLUMN time TIME NULL,
    ADD COLUMN date DATE NULL;`


    db.query(sqlPost, [title,body,time,date,'opened',database] , (err,result) =>{
       
       if(!err){
         res.send('done');
         db.query(sqlCreatTable , (err,result) =>{
           if(!err){
            db.query(sqlCopyFromTable,(err,result)=>{
              if(!err){
                db.query(sqlInsertNewCol)
              }
            })

           }


         })
      
      
      }else{res.send("err")}
      setTimeout(function(){ 
        db.query(`UPDATE recalls SET status = ? WHERE database_name = ?`,["closed",database])
        db.query(`UPDATE ${database} SET status = 'notArrived' WHERE status="";`)

      }, timer);
  })});

  app.get('/api/openedRecalls/:status',(req,res)=>{
    var status = req.params.status; 
    const sqlReadRecalls = `SELECT * FROM recalls WHERE status = ?` 
    db.query(sqlReadRecalls ,[status], (err,result) =>{
      console.log(status)
      res.send(result)

  })})

  
app.post('/api/storeNotifToken' , (req,res)=>{
 const name = req.body.name;
 const NotifToken = req.body.NotifToken;
 const device = req.body.device;
 const sqlStoreNotific = `INSERT IGNORE INTO notification (notification_token, name,device)
 VALUES (?,?,?);` 
 db.query(sqlStoreNotific ,[NotifToken,name,device], (err,result) =>{
  console.log(err)
  res.send(result)

})
})
app.post('/api/arrivalStatus' , (req,res)=>{
  const database_name = req.body.database_name;
  const id = req.body.id;
  const time = req.body.time;
  const date = req.body.date;
  console.log(time)
  const sqlUpdateStatus = `UPDATE ${database_name} SET time = ?, status = ?,date=? WHERE id=${id};`

  const sqlCheckStatus = `SELECT * FROM ${database_name} WHERE status = '' AND id = ?;`
  db.query(sqlCheckStatus,[id],(er,ress)=>{
    console.log(ress)

    if(ress.length > 0){
      
      db.query(sqlUpdateStatus, [time,"arrived",date], (err,result) =>{
       res.send("updatedStatus");
       console.log(err)


      })
    }else{
      res.send("Already Updated");
      console.log('Already')

    }
  })
  
 })
app.post('/api/getUserData',(req,res)=>{
  const name = req.body.name;
  console.log(req.body)
  const sqllogin = "SELECT * FROM users WHERE name = ?;"
  db.query(sqllogin, [name] , (err,result) =>{
      
          res.send(result);
          console.log(result)
      
      
})})

app.post('/api/arrivalList',(req,res)=>{
  const sqlArrivals = `SELECT * FROM ${req.body.database_name};`
  db.query(sqlArrivals,(err,ress)=>{
    res.json(ress)
  })
})





app.get('/api/getNotficationTokens',(req,res)=>{
  
  const sqlnotList = "SELECT * FROM notification"
  db.query(sqlnotList , (err,result) =>{
      
          res.send(result);
          console.log(result)
          
      
      
})})