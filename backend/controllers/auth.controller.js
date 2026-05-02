import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {db}from "../libs/db.js";
import { UserRole } from "../generated/prisma/client/enums.ts";


export const register = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const existingUser = await db.user.findUnique({
                where: {
                    email
                }
            });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role === "ADMIN" ? UserRole.ADMIN : UserRole.USER
            }
        });

        const token= jwt.sign({id:newUser.id},process.env.JWT_SECRET,{expiresIn:"7d"});
        res.cookie("jwt",token,{
            httpOnly:true,
            secure:process.env.NODE_ENV!=="development",
            sameSite:"strict",
            maxAge:7*24*60*60*1000
        });
        res.status(200).json({
            success:true,
            message:"User registered successfully",
            token:token,
            user:{
                    id:newUser.id,
                    name:newUser.name,
                    email:newUser.email,
                    role:newUser.role,
                    image:newUser.image
                }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "error while registering" });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await db.user.findUnique({
            where: {
                email
            }
        });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token= jwt.sign({id:user.id},process.env.JWT_SECRET,{expiresIn:"7d"});
        res.cookie("jwt",token,{
            httpOnly:true,
            secure:process.env.NODE_ENV!=="development",
            sameSite:"strict",
            maxAge:7*24*60*60*1000
        });
        res.status(200).json({
           
            success: true,
            message:"User logged in successfully",
            token:token,
            user:{
                    id:user.id,
                    name:user.name,
                    email:user.email,
                    role:user.role,
                    image:user.image
                }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "error while logging in" });
    }
    
}

export const logout = async (req, res) => {
    try {
        res.clearCookie("jwt",{
            httpOnly:true,
            secure:process.env.NODE_ENV!=="development",
            sameSite:"strict",
        });
        res.status(200).json({
            success: true,
            message: "User logged out successfully" 
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "error while logging out" });
    }
    
}

export const check = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "User authenticated successfully" ,
            user:req.user
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "error while checking authentication" });
    }
    
}