const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRECT = "abcshjfvbchdhfb123456gu6fdfdcxcxcsdfddkccxkck?";
var cors = require('cors');
mongoose.set('strictQuery',false);
const PORT = 8050;
app.use(express.json())
app.use(cors())

var corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

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
app.post("/login-admin", cors(corsOptions), async (req,res) => {
    const {email, password} = req.body;
    const admin_auth = await userAuth.findOne({ email});
    console.warn(admin_auth);
    // if the email not exsists in the database
    if(!admin_auth){
        return res.json({error: "Incorrect email address"});
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
app.post('/random-joke', cors(corsOptions), async (req,res) => {
    const {joke_type} = req.body;
    const data = await Jokes_model.find({"type":joke_type});
    // maipulation to get a random joke
    const randomIndex = Math.floor(Math.random() * data.length);
    const random_joke = data[randomIndex];
    // --------------------------------
    console.warn(random_joke);
    if(!random_joke){
        return res.json({status: "error", error: `Couldn't find a joke for the type - ${joke_type}`});
    }
    return res.json({status: "ok", data: random_joke});
});

// retrewing joke types
app.get('/joke-types', cors(corsOptions), async (req,res) => {
    const joke_types = await Jokes_model.find();
    var typesArray = new Array();
    typesArray.push('');
    joke_types.forEach(element => {
        console.warn(element.type)
        if(!typesArray.includes(element.type)){
            typesArray.push(element.type)
        }
    });
    console.warn(joke_types)
    if(!joke_types){
        return res.json({status: "error", error: "Couldn't find joke types"});
    }
    return res.json({status: "ok", data: typesArray});
});

// updating the extracted random joke accordingly
app.put('/update-joke', cors(corsOptions), async (req,res) => {
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