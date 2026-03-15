// test-login.js
const LOGIN_URL = 'http://localhost:5000/api/auth/login';

// Ganti dengan username & password asli dari DB Anda
const credentials = {
    username: "putra", 
    password: "bpt@uigm" 
};

fetch(LOGIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
})
.then(res => res.json())
.then(data => {
    console.log("--- HASIL LOGIN ---");
    console.log(data);
})
.catch(err => console.error(err));