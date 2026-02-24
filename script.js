const tg = window.Telegram.WebApp;
tg.expand();

// FUNGSI UTAMA: CEK STATUS USER
function checkUser() {
    const tgId = tg.initDataUnsafe?.user?.id || "USER_TEST";
    const data = localStorage.getItem(`neon_v5_${tgId}`);

    if (data) {
        // Jika sudah ada data, tampilkan LOGIN
        window.activeAccount = JSON.parse(data);
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('display-greet').innerText = "Halo, " + window.activeAccount.username;
        document.getElementById('user-avatar').src = `https://api.dicebear.com/7.x/bottts/svg?seed=${window.activeAccount.username}`;
    } else {
        // Jika user baru, tampilkan PENDAFTARAN
        document.getElementById('reg-container').style.display = 'block';
    }
}

// LOGIKA DAFTAR & MASUK
window.handleAuth = (mode) => {
    const tgId = tg.initDataUnsafe?.user?.id || "USER_TEST";

    if (mode === 'register') {
        const u = document.getElementById('reg-username').value;
        const p = document.getElementById('reg-password').value;
        const w = document.getElementById('reg-wallet').value;

        if (!u || !p || !w) return alert("Isi semua data!");

        window.activeAccount = { username: u, password: p, wallet: w };
        localStorage.setItem(`neon_v5_${tgId}`, JSON.stringify(window.activeAccount));
        alert("ID Aktif! Selamat Bermain.");
    } else {
        const pass = document.getElementById('login-password').value;
        if (pass !== window.activeAccount.password) return alert("Password Salah!");
    }

    // MASUK KE GAME & KUNCI DATA PROFIL
    document.getElementById('auth-layer').style.display = 'none';
    document.getElementById('game-layer').style.display = 'block';
    
    // Kunci data di Profil (Read Only)
    document.getElementById('profile-id-display').innerText = window.activeAccount.username;
    document.getElementById('profile-wallet-display').innerText = window.activeAccount.wallet;
};

// Jalankan pengecekan
checkUser();

