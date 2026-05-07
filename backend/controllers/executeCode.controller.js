import { getLanguageName, pollBatchResults, submitBatch } from "../libs/judge0.lib.js";
import { db } from "../libs/db.js";

export const executeCode = async (req, res) => {
    try {
    const { source_code,language_id , stdin, expected_outputs,problemId } = req.body;
    const userId = req.user.id;
    //validate test cases
    if(!Array.isArray(stdin) ||stdin.length === 0 ||expected_outputs.length !== stdin.length|| !Array.isArray(expected_outputs)) return res.status(400).json({error:"Invalid test cases"});

    //2 prepare each test case for judge0 batch submission
    const submissions = stdin.map((input) => ({
        source_code,
        language_id,
        stdin: input,
    }));

    //3 send batch of submisions to judge0
    const submitResponse  = await submitBatch(submissions);
    const tokens = submitResponse.map((res) => res.token);

    //4 poll batch results
    const results = await pollBatchResults(tokens);

    //analyse test case results
    let allPassed = true;
    const detailedResults = results.map((result, index) => {
        const stdout = result.stdout?.trim();
        const expectedOutput = expected_outputs[index].trim();
        const passed = stdout === expectedOutput;
        if(!passed){
            allPassed = false
        }
        return{
            testCaseIndex:index+1,
            passed,
            stdout,
            expexted:expectedOutput,
            stderr:result.stderr||null,
            compile_output:result.compile_output||null,
            status:result.status.description,
            memory:result.memory? `${result.memory} kb`:undefined,
            time:result.time? `${result.time} ms`:undefined,
        }
    });
    console.log(detailedResults)

    const submission = await db.submission.create({
        data: {
            problemId,
            userId,
            sourceCode: source_code,
            language:getLanguageName(language_id),
            stdin: stdin.join("\n"),
            stdout: JSON.stringify(detailedResults.map((res) => res.stdout)),
            stderr: detailedResults.some((res) => res.stderr)? JSON.stringify(detailedResults.map((res) => res.stderr)):null,
            compileOutput: detailedResults.some((res) => res.compile_output)? JSON.stringify(detailedResults.map((res) => res.compile_output)):null,
            status:allPassed? "Accepted":"Wrong Answer",
            memory: detailedResults.some((res) => res.memory)? JSON.stringify(detailedResults.map((res) => res.memory)):null,
            time: detailedResults.some((res) => res.time)? JSON.stringify(detailedResults.map((res) => res.time)):null,
        },
    });

    //if all passed = true mark problem as solved for the current user 
    if(allPassed){
        await db.problemSolved.upsert({
            where:{
                userId_problemId:{userId,problemId}
            },
            update:{},
            create:{
                userId,
                problemId
            }
        })
    }
    // save individual test case results
    const testCaseResults = detailedResults.map((result) => ({
        submissionId: submission.id,
        testCase: result.testCaseIndex,
        passed: result.passed,
        stdout: result.stdout,
        stderr: result.stderr,
        compileOutput: result.compile_output,
        expexted: result.expexted,
        status: result.status,
        memory: result.memory,
        time: result.time
    }))

    await db.testCaseResult.createMany({
        data: testCaseResults
    })

    const submissionWithTestCase = await db.submission.findUnique({
        where:{id:submission.id},
        include:{testCases:true}
    })
    res.status(200).json({submission:submissionWithTestCase,
        message:"Code executed successfully",
        success:true
    });
        

    } catch (error) {
        console.log("error while executing code ",error.message);
        res.status(500).json({ error: error.message });
    }
};