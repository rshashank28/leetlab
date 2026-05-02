export const getAllSubmission=async(req,res)=>{
    try {
        const userId = req.user.id;
        const submissions = await db.submission.findMany({where:{userId:userId}});
        res.status(200).json({success:true,submissions,message:"Submissions fetched successfully"});

    } catch (error) {
        console.log(error);
        res.status(500).json({error:"Failed to fetch submissions", details: error.message});
    }
}

export const getSubmissionsForProblem=async(req,res)=>{
    try {
        const userId = req.user.id;
        const problemId = req.params.problemId;
        const submissions = await db.submission.findMany({where:{userId:userId,problemId:problemId}});
        res.status(200).json({success:true,submissions,message:"Submissions fetched successfully"});
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"Failed to fetch submissions", details: error.message});
    }
}

export const getAllTheSubmissionsForProblem=async(req,res)=>{
    try {
        const problemId = req.params.problemId;
        const submissions = await db.submission.count({where:{problemId:problemId}});
        res.status(200).json({success:true,count:submissions,message:"Submissions fetched successfully"});
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"Failed to fetch submissions", details: error.message});
    }
}