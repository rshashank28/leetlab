import {db} from "../libs/db.js";
import { pollBatchResults, submitBatch, getJudge0LanguageId } from "../libs/judge0.lib.js";
export const createProblem = async (req, res) => {
    //get all data from request.body
    //check the user is admin or not
    //loop through each refrences solution different language
    //validate all reference solutions pass their testcases    
    const {title,description,tags,difficulty,examples, constraints,testcases,codeSnippets , referenceSolutions} = req.body;
    if(req.user.role !== "ADMIN") return res.status(403).json({error:"Forbidden not allowed to create problem"});

    try {
        // Validate all reference solutions
        for(const[language,solutionCode] of Object.entries(referenceSolutions)){
            if(language.toUpperCase() === 'JAVA') continue;
            const languageId = getJudge0LanguageId(language)
            if(!languageId) {
                console.error(`createProblem 400: Invalid language: ${language}`);
                return res.status(400).json({error:`Invalid language: ${language}`}); 
            }
            const submission = testcases.map(({input,output})=>({
                source_code:solutionCode,
                language_id:languageId,
                stdin:input,
                expected_output:output
            }))

            const submissionResults = await submitBatch(submission);
            const tokens = submissionResults.map((res)=>res.token)
            const results = await pollBatchResults(tokens)
            for(let i=0;i<results.length;i++){
                const result = results[i];
                if(result.status.id !== 3) {
                    console.error(`createProblem 400: Testcase ${i+1} failed for language ${language}. Status ID: ${result.status.id}`);
                    return res.status(400).json({error:`Testcase ${i+1} failed for language ${language}`});
                }
            }
        }

        // Create problem only after all solutions pass
        const newProblem = await db.problem.create({
            data:{
                title,
                description,
                tags,
                difficulty,
                examples,
                constraints,
                testcases,
                codeSnippets,
                referenceSolutions,
                userId:req.user.id
            }
        })

        return res.status(200).json({message:"Problem created successfully",problem:newProblem});
    } catch (error) {
        console.error("Error creating problem:", error);
        return res.status(500).json({error:"Failed to create problem", details: error.message});
    }
}

export const getAllProblems = async (req, res) => {
    try {
	const problems = await db.problem.findMany({
    include:{
        solvedBy: true
    }
});
        if(!problems) return res.status(404).json({error:"No problems found"});
        return res.status(200).json({
            success:true,
            problems,
            message:"All problems fetched successfully"
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({error:"Failed to fetch problems", details: error.message});
    }
}

export const getProblemById = async (req, res) => {
    const {id} = req.params;
    try {
        const problem = await db.problem.findUnique({
            where:{id:id}
        })
        if(!problem) return res.status(404).json({error:"Problem not found"});
        return res.status(200).json({
            success:true,
            problem,
            message:"Problem fetched successfully"
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({error:"Failed to fetch problem by id", details: error.message});
    }
}

export const updateProblem = async (req, res) => {
    const {id} = req.params;
    const {title,description,tags,difficulty,examples, constraints,testcases,codeSnippets , referenceSolutions} = req.body;
    if(!id) return res.status(400).json({error:"Problem id is required"});
    if(req.user.role !== "ADMIN") return res.status(403).json({error:"Forbidden not allowed to update problem"});

    try {

        for(const[language,solutionCode] of Object.entries(referenceSolutions)){
            const languageId = getJudge0LanguageId(language)
            if(!languageId) return res.status(400).json({error:`Invalid language: ${language}`}); 
            const submission = testcases.map(({input,output})=>({
                source_code:solutionCode,
                language_id:languageId,
                stdin:input,
                expected_output:output
            }))

            const submissionResults = await submitBatch(submission);
            const tokens = submissionResults.map((res)=>res.token)
            const results = await pollBatchResults(tokens)
            for(let i=0;i<results.length;i++){
                const result = results[i];
                if(result.status.id !== 3) return res.status(400).json({error:`Testcase ${i+1} failed for language ${language}`});
            }
        }

        const problem = await db.problem.update({
            where:{id:id},
            data:{title,description,tags,difficulty,examples, constraints,testcases,codeSnippets , referenceSolutions}
        })
        if(!problem) return res.status(404).json({error:"Problem not found"});
        return res.status(200).json({
            success:true,
            problem,
            message:"Problem updated successfully"
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({error:"Failed to update problem", details: error.message});
    }
}

export const deleteProblem = async (req, res) => {
    const {id} = req.params;
    if(!id) return res.status(400).json({error:"Problem id is required"});
    if(req.user.role !== "ADMIN") return res.status(403).json({error:"Forbidden not allowed to delete problem"});
    try {
        const problem = await db.problem.delete({
            where:{id:id}
        })
        if(!problem) return res.status(404).json({error:"Problem not found"});
        return res.status(200).json({
            success:true,
            problem,
            message:"Problem deleted successfully"
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({error:"Failed to delete problem", details: error.message});
    }
}

export const getAllProblemsSolvedByUser = async (req, res) => {
   try {
    const problems = await db.problem.findMany({
        where:{
            solvedBy:{
                some:{
                    userId:req.user.id
                }
            }
        },
        include:{
            solvedBy:{
                where:{
                    userId:req.user.id
                }
            }
        }
    })
    res.status(200).json({success:true,problems,message:"Problems fetched successfully"});
   } catch (error) {
        console.log(error)
        return res.status(500).json({error:"Failed to fetch problems", details: error.message});
   }
}
