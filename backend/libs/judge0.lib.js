import axios from "axios";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const getJudge0LanguageId = (language) => {
    const languageMap={
        "PYTHON": 71,
        "JAVA": null,
        "JAVASCRIPT": 63    
    }
    return languageMap[language.toUpperCase()]
    }

      export const pollBatchResults = async (tokens) => {
    let attempts = 0;
    const maxAttempts = 20;
    while(attempts < maxAttempts){
        attempts++;
        await sleep(2000);
        const {data} = await axios.get(`${process.env.JUDGE0_API_URL}/submissions/batch`,{
            params:{
                tokens:tokens.join(","),
                base64_encoded:false,
            },
            timeout: 10000
        });
        const results = data.submissions;
        const isAllDone = results.every(
            (r) => r.status.id !== 1 && r.status.id !== 2
        );
        if(isAllDone){
            return results;
        }
    }
    throw new Error("Polling timeout - Judge0 took too long");
}
       export const submitBatch = async (submissions) => {
        const {data} = await axios.post(`${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`,{
            submissions
        });
        console.log(data);
        return data
    }

    export const getLanguageName = (languageId) => {
        const LANGUAGE_NAMES={
            71: "Python",
            62: "Java",
            63: "JavaScript"    
        }
        return LANGUAGE_NAMES[languageId] || "Unknown"
    }
