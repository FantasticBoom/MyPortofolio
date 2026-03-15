const BASE_URL = 'http://localhost:5000/api';
// Ganti token ini dengan token login yang valid!
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGUiOiJzdXBlcl9hZG1pbiIsIm5hbWEiOiJNdWhhbW1hZGkgRGlhbnN5YWggUHV0cmEiLCJpYXQiOjE3Njc5ODIxMDUsImV4cCI6MTc2ODA2ODUwNX0.7aSUqCLhPoCUU9vvUdmhC95uufH0ufk-uJgnuo_CZbc"; 

async function testDashboard() {
    console.log("Mengambil Data Dashboard...");
    const res = await fetch(`${BASE_URL}/dashboard`, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}

testDashboard();