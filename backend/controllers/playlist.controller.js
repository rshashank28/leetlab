import { db } from "../libs/db.js";
export const createPlaylist=async(req,res)=>{
    try {
        const {name,description}=req.body;
        const userId=req.user.id;
        const playlist=await db.playlist.create({data:{name,description,userId}});
        res.status(200).json({success:true,playlist,message:"Playlist created successfully"});
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"Failed to create playlist", details: error.message});
    }
}

export const getAllListDetails=async(req,res)=>{
    try {
        const playlists=await db.playlist.findMany({
            where:{
                userId:req.user.id
            },include:{
                problems:true
            }
        });

        res.status(200).json({success:true,playlists,message:"Playlists fetched successfully"});

    } catch (error) {
        console.log(error);
        res.status(500).json({error:"Failed to fetch playlists", details: error.message});
    }
}

export const getPlayListDetails=async(req,res)=>{
    try {
    const {playlistId}=req.params;
    const playlist=await db.playlist.findUnique({
        where:{
            id:playlistId,
            userId:req.user.id
        },
        include:{
            problems:{
                include:{
                    problem:true
                }
            }
        }
    })
    if(!playlist) return res.status(404).json({error:"Playlist not found"});
    res.status(200).json({success:true,playlist,message:"Playlist fetched successfully"});

    } catch (error) {
        console.log(error);
        res.status(500).json({error:"Failed to fetch playlist", details: error.message});
    }
}

export const addProblemToPlaylist=async(req,res)=>{
    const {playlistId}=req.params;
    const {problemIds: problemId}=req.body;
    try {
        if(!Array.isArray(problemId)||problemId.length===0) return res.status(400).json({error:"Problem id is required"});
        const problemsInPlayList = await db.problemInPlaylist.createMany({data:problemId.map((problemId)=>({playListId: playlistId, problemId}))});
        res.status(200).json({success:true,problemsInPlayList,message:"Problem added to playlist successfully"});
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"Failed to add problem to playlist", details: error.message});
    }
}


export const deletePlaylist=async(req,res)=>{
    const {playlistId}=req.params;
    try {
        const playlist=await db.playlist.delete({where:{id:playlistId}});
        res.status(200).json({success:true,playlist,message:"Playlist deleted successfully"});
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"Failed to delete playlist", details: error.message});
    }
}


export const removeProblemFromPlaylist=async(req,res)=>{
    const {playlistId}=req.params;
    const {problemIds: problemId}=req.body;
    try {
        if(!Array.isArray(problemId)||problemId.length===0) return res.status(400).json({error:"Problem id is required"});
        const problemsInPlayList = await db.problemInPlaylist.deleteMany({where:{playlistId,problemId:{in:problemId}}});
        res.status(200).json({success:true,problemsInPlayList,message:"Problem removed from playlist successfully"});
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"Failed to remove problem from playlist", details: error.message});
    }
} 
