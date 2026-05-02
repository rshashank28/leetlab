import jwt from "jsonwebtoken";
import { db } from "../libs/db.js";
export const authMiddleware= async(req,res,next)=>{
    try {
        const token = req.cookies.jwt || req.headers.authorization?.split(" ")[1];
        if(!token){
            return res.status(401).json({message:"Unauthorized kll"});
        }
        if(!process.env.JWT_SECRET){
            console.error("JWT_SECRET is not set in environment variables");
            return res.status(500).json({message:"Server configuration error"});
        }
        const decodedToken = jwt.verify(token,process.env.JWT_SECRET);
        const user = await db.user.findUnique({
            where:{id:decodedToken.id},
            select:{id:true,name:true,email:true,role:true,image:true}
        });
        console.log(user);
        if(user){
            req.user = user;
            next();
        }else{
            return res.status(401).json({message:"Unauthorized hii"});
        }
    } catch (error) {
        console.log(error);
        return res.status(401).json({message:"Unauthorized fah"});
    }
}

export const checkAdmin = async(req,res,next)=>{
  try {
      const userId = req.user.id;
    const user = await db.user.findUnique({
        where:{id:userId},
        select:{role:true}
    });
    if(user.role === "ADMIN"){
        next();
    }else{
        return res.status(403).json({message:"Forbidden"});
    }
  } catch (error) {
     console.log(error);
     return res.status(403).json({message:"Forbidden"});
  }
}