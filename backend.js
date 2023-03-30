const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRECT = "abcshjfvbchdhfb123456gu6fdfdcxcxcsdfddkccxkck?";
mongoose.set('strictQuery',false);
const PORT = 8050;
app.use(express.json())

// Mongo DB connection establishment and model initializations
const connectDB = async () => {
    mongoose.connect(
    "mongodb+srv://rusira:rusira123@cluster0.2ouhrwy.mongodb.net/Jokes?retryWrites=true&w=majority"
    ).then((responde) => {
        console.log(responde)
    });
    const jokesSchema = new mongoose.Schema({
        description: String,
        type: String
    });
    Jokes_model = mongoose.model("jokes",jokesSchema);
    const userSchema = new mongoose.Schema({
        email: String,
        password: String
    });
    userAuth = mongoose.model("userauths",userSchema)
}

// admin login authentication functionality
app.post("/login-admin", async (req,res) => {
    const {email, password} = req.body;
    const admin_auth = await userAuth.findOne({ email});
    console.warn(admin_auth);
    // if the email not exsists in the database
    if(!admin_auth){
        return res.json({error: "Admin Not Found"});
    }
    console.warn(admin_auth.type);
    // extracting the password which corrospondance to the email
    const adminPass = admin_auth.password;
    console.warn(adminPass);
    // decrypt the password and comparing them for the similarity
    if(await bcrypt.compare(password, adminPass)){
        // jwt token for user authentication - security popurces
        const token = jwt.sign({},JWT_SECRECT);
        if(res.status(201)){
            return res.json({status: "ok", data: token});
        }else{
            return res.json({error: "error"});
        }
    }
    // if the enterd password is mismatch with the one in the database.
    return res.json({status: "error", error: "Invalid Password"});
});

// taking a joke randomely and edit it accordingly
app.get('/random-joke', async (req,res) => {
    const data = await Jokes_model.find();
    // obtaining a random joke
    const randomIndex = Math.floor(Math.random() * data.length);
    const random_joke = data[randomIndex];
    // --------------------------------
    console.warn(random_joke);
    if(!random_joke){
        return res.json({status: "error", error: `A random joke couldn't be extracted`});
    }
    // displaying the random joke
    return res.json({status: "ok", data: random_joke});
});

// updating the extracted random joke accordingly
app.put('/update-joke', async (req,res) => {
    const {id, description,type} = req.body;
    //------------------------------------------
    // update the document by the _id
    let result = await Jokes_model.updateOne({_id: id}, {description:description,type:type})
    // when the update is successfull
    return res.json({status: "Ok",result: result})
});

connectDB();

app.listen(
    PORT,
    () => console.log(`It's alive on http://localhost:${PORT}`)
)