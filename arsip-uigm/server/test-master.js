const BASE_URL = 'http://localhost:5000/api';
const CREDENTIALS = { username: "putra", password: "bpt@uigm" }; // Sesuaikan!

async function testMasterData() {
    console.log("1. Mencoba Login...");
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(CREDENTIALS)
    });
    const loginData = await loginRes.json();

    if (!loginData.token) {
        console.error("❌ Login Gagal:", loginData);
        return;
    }
    const token = loginData.token;
    console.log("✅ Login Sukses! Token didapat.");

    // --- TEST GET USERS ---
    console.log("\n2. Mengambil Data Users...");
    const usersRes = await fetch(`${BASE_URL}/master/users`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const users = await usersRes.json();
    console.log(`   Status: ${usersRes.status}`);
    if(Array.isArray(users)) {
        console.log(`   Berhasil! Ditemukan ${users.length} users.`);
        console.log("   Contoh User:", users[0]);
    } else {
        console.error("   Gagal:", users);
    }

    // --- TEST GET BAGIAN ---
    console.log("\n3. Mengambil Data Bagian...");
    const bagianRes = await fetch(`${BASE_URL}/master/bagian`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const bagian = await bagianRes.json();
    console.log(`   Status: ${bagianRes.status}`);
    if(Array.isArray(bagian)) {
        console.log(`   Berhasil! Ditemukan ${bagian.length} unit kerja.`);
        console.log("   Contoh Bagian:", bagian[0]);
    } else {
        console.error("   Gagal:", bagian);
    }
}

testMasterData();