import axios from 'axios';

const code = `function isPalindrome(s) {
    s = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    let left = 0;
    let right = s.length - 1;
    while (left < right) {
        if (s[left] !== s[right]) return false;
        left++;
        right--;
    }
    return true;
}

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on('line', (line) => {
    console.log(isPalindrome(line) ? 'true' : 'false');
    rl.close();
});`;

axios.post('http://localhost:2358/submissions/?base64_encoded=false&wait=true', {
    source_code: code,
    language_id: 63,
    stdin: 'A man, a plan, a canal: Panama',
    expected_output: 'true'
}).then(res => console.log(res.data)).catch(console.error);
