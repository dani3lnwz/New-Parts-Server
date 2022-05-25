const express=require('express');
const bodyparser=require('body-parser');
const app=express()
var jwt = require('jsonwebtoken');
require('dotenv').config();

const cors= require('cors');
app.use(cors());

app.use(bodyparser.urlencoded({extended:false}))
app.use(bodyparser.json());
///
app.get('/',(req,res)=>{
    res.send("hi mr");
})

const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.Db_USER}:${process.env.Db_PASS}@cluster0.9dnsi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
  try{
     await client.connect();
     const collection = client.db("services").collection("service");
     const Usercollection = client.db("users").collection("user");
     const UserOrders = client.db("Orders").collection("order");
     const UserRevew= client.db("UserRevew").collection("revew");
     // get api
     app.get('/products',async(req,res)=>{
         const query={};
         const cursor= collection.find(query)
         const product=await cursor.toArray();
         res.send(product);

     });
     app.get('/ordersItem',async(req,res)=>{
         const query={};
         const cursor= UserOrders.find(query)
         const product=await cursor.toArray();
         res.send(product);

     });
     app.delete('/OrdersItem/:id',async(req,res)=>{
      const id=req.params.id;
      const filter={_id:ObjectId(id)};
      const result = await UserOrders.deleteOne(filter);
      res.send(result);

  })

        // post api
        app.post('/products',async(req,res)=>{
          const data=req.body;
          console.log(data);
          const result=await UserOrders.insertOne(data)
          res.send(result);})

         // admin Product
        app.post('/product',async(req,res)=>{
          const data=req.body;
          const result=await collection.insertOne(data)
          res.send(result);});
          // revew
          app.post('/revew',async(req,res)=>{
               const data=req.body;
               const result= await UserRevew.insertOne(data);
               res.send(result);
          })

            //order
          app.put('/products/increase/:id',async(req,res)=>{
            const id=req.params.id;
            const data=req.body;
            console.log("data",data);
            const filter =  {_id:ObjectId(id) } ;
            console.log("filter",filter);
            const options = { upsert: false };
            const updateDoc = {
              $inc: { quantity: Number(data.amount || 0)}
                       }
            try{
                const result = await collection.updateOne(filter, updateDoc, options);
                res.send(result);
            }catch(e){
                res.send("failed to update");
            }
              
        })
        // for user
        app.put('/user/:email',async(req,res)=>{
          const email=req.params.email;
          const user=req.body;
          const filter={email:email}
          const options = { upsert: true };
           const updateDoc = {
            $set:user };
            const result = await Usercollection.updateOne(filter, updateDoc, options);
            const token=jwt.sign({email:email},process.env.JWT_TOKEN)
            res.send({result,token});
            // console.log({result,token})

        })
        app.put('/admin/:email',async(req,res)=>{
          const email=req.params.email;
          const filter={email:email}
           const updateDoc = {
            $set:{role :'admin'}};
            const result = await Usercollection.updateOne(filter, updateDoc);
            res.send(result);
            // console.log({result,token})

        })
        app.delete('/admin/:id',async(req,res)=>{
          const id=req.params.id;
          const filter={_id:ObjectId(id)};
          const result = await Usercollection.deleteOne(filter);
          res.send(result);

      })
        app.get('/admin/:email',async(req,res)=>{
          const email=req.params.email;
          const user=await Usercollection.findOne({email:email})
          console.log(user);
          const isAdmin= user.role ==='admin';
          res.send(isAdmin);

      })
         app.get('/users',async(req,res)=>{
          const query={};
          const cursor= Usercollection.find(query)
          const product=await cursor.toArray();
          res.send(product);

         })
          /// put api
          app.put('/products/reduce/:id',async(req,res)=>{
            const id=req.params.id;
            const data=req.body;
            console.log(data);
            const filter =  {_id:ObjectId(id)} ;
            console.log("filter",filter);
            const options = { upsert: false };
            const updateDoc = {
               $inc: { quantity:-Number(data.amout ||0) } }
              const result = await collection.updateOne(filter, updateDoc, options);
              res.send(result);
        });

        // user ubdate
        // app.put('user/:id',async(req,res)=>{
        //   const collection = client.db("adim").collection("makeAdmin");
        //   const id=req.params.id;
        //   const data=req.body;
        //   const filter =  {_id:ObjectId(id)} ;
        //   const options = { upsert: true };
        //   // const updateDoc = {
        //   //   $inc: { quantity:-Number(data.amout ||0) } }
        //   const result = await Usercollection.updateOne(filter, updateDoc, options);
          // res.send(result);

        // })
        // delete user
        app.delete('/products/:id',async(req,res)=>{
          const collection = client.db("adim").collection("makeAdmin");
          const id=req.params.id;
          const filter={_id:ObjectId(id)};
          const result = await collection.deleteOne(filter);
          res.send(result);

      })
     
        // delete
        app.delete('/serviceDelete/:id',async(req,res)=>{
          const id=req.params.id;
          const filter={_id:ObjectId(id)};
          const result = await collection.deleteOne(filter);
          res.send(result);

      })
    }
    finally{}
  }
  run().catch(console.dir);


const PORT=process.env.PORT ||5000;
app.listen(PORT,()=>{
    console.log('App is listiong 5000');
})
