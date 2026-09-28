import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from './dataSchema/userSchema.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use(cors());

//Mongoose connected to the Database..
mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        // Port 3001 — App-Backend already owns port 3000.
        // Both must run AT THE SAME TIME for the flow to work:
        //   auth (login/signup) on 3001  +  resume analysis on 3000.
        app.listen(3001, () => {
        console.log("Server: http://localhost:3001");
        });
    }
    ).catch((err) => { console.log(`oops.. something went wrong ${err}`)}
);

//Verification to check the Authentication..
export const verifyToken = (req, res, next) => {
    const authHeaders = req.headers.authorization

    if(!authHeaders || !authHeaders.startsWith('Bearer ')){
        return res.status(401).json({
            message: 'Token missing'
        })
    }
    const tokens = authHeaders.split(' ')[1];
    try{
        const decoded = jwt.verify(tokens, process.env.JWT_SECRET);
        req.User = decoded;
        next();
    }
    catch(err){
        res.status(401).json({
            message: "Invalid or expired token",
            error: err
        });
    }
}

app.get('/', (_, res) => {
    res.end("This Server is UP..");
});

app.post('/login', async(req, res) => {
    const { username, email, password } = req.body;

    if(!username || !email || !password){
        return res.status(400).json({
            message: "username, email and password are required"
        });
    }

    try{
        const hashedPassword = await bcrypt.hash(password, 10);

        const ResData = new User({ username, email, password: hashedPassword });
        await ResData.save();

        console.log(ResData);
        console.log(ResData.username);

        const createdUser = ResData.toObject();
        delete createdUser.password;

        // Signup now issues the SAME JWT that /sign-in does.
        // WHY: med_app's /App route guard only lets requests through when a
        // token exists in sessionStorage. Previously /login returned no token,
        // so a brand-new account would be redirected to /App and immediately
        // bounced back to the sign-in page — locking out every new user.
        const token = jwt.sign(
            {
                userId: createdUser._id,
                username: createdUser.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        );

        res.json({
            message: "Login SuccesFull",
            token: token,
            data: createdUser
        });
    }
    catch(err){
        console.log(err);

        if(err.code === 11000){
            return res.status(409).json({
                message: "Username or email already exists"
            });
        }

        if(err.name === 'ValidationError'){
            return res.status(400).json({
                message: err.message
            });
        }

        res.status(500).json({
            message: "Failed to sign up",
            error: err.message
        });
    }
});

app.get('/user-data', async (_, res) => {
    try {
        const users = await User.find().select('-password');

        res.json({
            message: "Users fetched successfully",
            data: users
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Failed to fetch users"
        });
    }
});

app.post('/sign-in', async(req, res) => {
    const { username, password } = req.body;

    if(!username || !password){
        return res.status(400).json({
            message: "username and password are required"
        });
    }

    try{
        const user = await User.findOne({ username });

        if(!user){
            return res.status(401).json({
                message: `${username} Not found..`
            })
        }

        const isMatched = await bcrypt.compare(password, user.password);
        if(!isMatched){
            return res.status(401).json({
                message: `Nope Password is wrong`
            });
        }
        const token = jwt.sign(
            {
                userId: user._id,
                username: user.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        );

        res.json({
            message: "Sign-in SuccessFull",
            token: token,
            data: {
                _id: user._id,
                username: user.username,
                email: user.email
            }
        });
    }catch(err){
        console.log(err);
        res.status(500).json({
            message: 'oops.. something went wrong',
            error: err.message
        });
    }
})