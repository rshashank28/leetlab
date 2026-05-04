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
    const maxAttempts = 30;
    while(attempts < maxAttempts){
        attempts++;
        await sleep(3000);
        try {
            const {data} = await axios.get(`${process.env.JUDGE0_API_URL}/submissions/batch`,{
                params:{
                    tokens:tokens.join(","),
                    base64_encoded:false,
                },
                timeout: 15000
            });
            const results = data.submissions;
            const isAllDone = results.every(
                (r) => r.status.id !== 1 && r.status.id !== 2
            );
            if(isAllDone){
                return results;
            }
        } catch(err) {
            console.log('Polling error, retrying...', err.code);
            await sleep(2000);
        }
    }
    throw new Error("Polling timeout");
}      

       
           export const submitBatch = async (submissions) => {
    let attempts = 0;
    while(attempts < 3) {
        try {
            const {data} = await axios.post(`${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`, {
                submissions
            }, { timeout: 30000 });
            console.log(data);
            return data;
        } catch(err) {
            attempts++;
            if(attempts >= 3) throw err;
            await sleep(2000);
        }
    }
}

    export const getLanguageName = (languageId) => {
        const LANGUAGE_NAMES={
            71: "Python",
            62: "Java",
            63: "JavaScript"    
        }
        return LANGUAGE_NAMES[languageId] || "Unknown"
    }
