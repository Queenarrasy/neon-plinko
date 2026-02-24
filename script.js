const tg = window.Telegram.WebApp;
tg.expand();

function initApp() {
    const tgId = tg.initDataUnsafe?.user?.id || "GUEST";
    const data = localStorage.getItem(`neon_v5_${tgId}`);

    // SEMBUNYIKAN SEMUA TERLEBIH DAHULU
    document.getElementById('reg-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'none';

    if (data) {
        window.user = JSON.parse(data);
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('display-greet').innerText = window.user.username;
        document.getElementById('user-avatar').src = `https://api.dicebear.com/7.x/bottts/svg?seed=${window.user.username}`;
    } else {
        document.getElementById('reg-container').style.display = 'block';
    }
}

window.handleAuth = (mode) => {
    const tgId = tg.initDataUnsafe?.user?.id || "GUEST";
    if (mode === 'register') {
        const u = document.getElementById('reg-username').value;
        const p = document.getElementById('reg-password').value;
        const w = document.getElementById('reg-wallet').value;
        if (!u || !p || !w) return alert("Lengkapi data!");
        window.user = { username: u, password: p, wallet: w };
        localStorage.setItem(`neon_v5_${tgId}`, JSON.stringify(window.user));
    } else {
        if (document.getElementById('login-password').value !== window.user.password) return alert("Salah!");
    }
    document.getElementById('auth-layer').style.display = 'none';
    document.getElementById('game-layer').style.display = 'block';
    
    document.getElementById('profile-id').innerText = window.user.username;
    document.getElementById('profile-wallet').innerText = window.user.wallet;
};

window.toggleProfile = () => {
    const p = document.getElementById('profile-layer');
    p.style.display = p.style.display === 'none' ? 'flex' : 'none';
};

// JALANKAN SAAT LOAD
document.addEventListener('DOMContentLoaded', initApp);
