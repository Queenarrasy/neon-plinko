const tg = window.Telegram.WebApp;
tg.expand();

// 1. CEK STATUS PENGGUNA SAAT GAME DIBUKA
function initAuthGateway() {
    const tgId = tg.initDataUnsafe?.user?.id || "DEV_USER";
    const savedData = localStorage.getItem(`neon_plinko_v5_${tgId}`);

    if (savedData) {
        // JIKA SUDAH ADA DATA: Tampilkan Login
        window.userAccount = JSON.parse(savedData);
        showLoginScreen();
    } else {
        // JIKA USER BARU: Tampilkan Pendaftaran
        showRegisterScreen();
    }
}

function showRegisterScreen() {
    document.getElementById('reg-container').style.display = 'block';
    document.getElementById('login-container').style.display = 'none';
}

function showLoginScreen() {
    document.getElementById('display-greet').innerText = "Halo, " + window.userAccount.username;
    document.getElementById('user-avatar').src = `https://api.dicebear.com/7.x/bottts/svg?seed=${window.userAccount.username}`;
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('reg-container').style.display = 'none';
}

// 2. LOGIKA PENDAFTARAN & LOGIN
window.handleAuth = (type) => {
    const tgId = tg.initDataUnsafe?.user?.id || "DEV_USER";
    
    if (type === 'register') {
        const u = document.getElementById('reg-username').value;
        const p = document.getElementById('reg-password').value;
        const w = document.getElementById('reg-wallet').value;

        if (!u || !p || !w) return alert("Harap isi semua kolom pendaftaran!");

        // Simpan data pendaftaran secara PERMANEN
        window.userAccount = {
            username: u,
            password: p,
            wallet: w,
            usdt: 100.00, // Bonus saldo awal (opsional)
            idr: 1000000,
            locked: true
        };

        localStorage.setItem(`neon_plinko_v5_${tgId}`, JSON.stringify(window.userAccount));
        alert("Pendaftaran Berhasil! ID Anda telah diaktivasi.");
    } else {
        const pInput = document.getElementById('login-password').value;
        if (pInput !== window.userAccount.password) return alert("Password Salah!");
    }

    // MASUK KE GAME (Sembunyikan Lembar 1, Munculkan Lembar 2)
    document.getElementById('auth-layer').style.display = 'none';
    document.getElementById('game-layer').style.display = 'block';
    
    // Sinkronisasi data ke Profil
    syncToProfile();
};

// 3. SINKRONISASI DATA KE PROFIL (READ-ONLY)
function syncToProfile() {
    // Memasukkan data ke dalam profil (Lembar 3) agar tidak bisa diganti
    document.getElementById('profile-id-display').innerText = window.userAccount.username;
    document.getElementById('profile-wallet-display').innerText = window.userAccount.wallet;
    
    // Update Avatar di Menu Utama
    document.getElementById('main-avatar').src = `https://api.dicebear.com/7.x/bottts/svg?seed=${window.userAccount.username}`;
    
    // Update Saldo Tampilan
    document.getElementById('bal-usdt').innerText = window.userAccount.usdt.toFixed(2);
    document.getElementById('bal-idr').innerText = window.userAccount.idr.toLocaleString('id-ID');
}

// 4. FUNGSI UI (BUKA/TUTUP PROFIL)
window.toggleProfile = () => {
    const pLayer = document.getElementById('profile-layer');
    pLayer.style.display = pLayer.style.display === 'none' ? 'flex' : 'none';
};

// Jalankan sistem saat file dimuat
initAuthGateway();
