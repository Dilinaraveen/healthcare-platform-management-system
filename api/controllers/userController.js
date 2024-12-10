import validator from 'validator';
import bcrypt from 'bcrypt';
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';

//API to register a user
const registerUser = async (req,res) => {

    try {

        const { name, email, password } = req.body;

        if(!name || !email || !password){
            return res.status(400).send({
                success: false,
                message: "Please fill all the fields"
            })
        }

        if(!validator.isEmail(email)){
            return res.status(400).send({
                success: false,
                message: "Please enter a valid email"
            })
        }

        if(password.length < 8){
            return res.status(400).send({
                success: false,
                message: "Enter a strong password"
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
            name,
            email,
            password: hashedPassword
        }

        const newUser = await userModel.create(userData);
        const user = await newUser.save();

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: "1d"});

        res.json({success:true,message:"Account created",token});
        
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

//API for login a user
const loginUser = async (req,res) => {

    try {

        const {email, password } = req.body;
        const user = await userModel.findOne({email});

        if(!user){
            return res.status(400).send({
                success: false,
                message: "User not found"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(isMatch){
            const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: "1d"});
            res.json({success:true, message:"Login successful",token});
        } else {
            res.json({success:false, message: "Invalid credentials"});
        }
        
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

export {registerUser,loginUser};