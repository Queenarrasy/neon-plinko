const { Engine, Render, Runner, Bodies, Composite, Events, Body } = Matter;
const tg = window.Telegram.WebApp;
tg.expand();

// --- SISTEM DATABASE & AUTH ---
let userData = null;
let activeCurrency = 'USDT';
let currentBet = 1.00;

function initAuth() {
    const tgId = tg.initDataUnsafe?.user?.id || "DEBUG_USER";
    const savedData = localStorage.getItem(`plinko_user_${tgId}`);

    document.getElementById('loading-spinner').style.display = 'none';
    if (savedData) {
        userData = JSON.parse(savedData);
        document.getElementById('login-form').style.display = 'block';
    } else {
        document.getElementById('auth-form').style.display = 'block';
    }
}

window.handleAuth = (type) => {
    const tgId = tg.initDataUnsafe?.user?.id || "DEBUG_USER";
    if (type === 'register') {
        const user = document.getElementById('reg-username').value;
        const pass = document.getElementById('reg-password').value;
        if (!user || !pass) return alert("Isi data lengkap!");
        
        userData = { username: user, password: pass, usdt: 100, idr: 1000000 };
        localStorage.setItem(`plinko_user_${tgId}`, JSON.stringify(userData));
        alert("Pendaftaran Berhasil!");
    } else {
        const pass = document.getElementById('login-password').value;
        if (pass !== userData.password) return alert("Password Salah!");
    }
    startGame();
};

function startGame() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('gui').style.display = 'flex';
    updateUI();
    // Jalankan Matter.js Engine disini...
}

// --- LOGIKA SALDO GANDA ---
window.switchCurrency = (type) => {
    activeCurrency = type;
    currentBet = type === 'USDT' ? 1.00 : 10000;
    document.querySelectorAll('.currency-selector button').forEach(b => b.classList.remove('active'));
    document.getElementById(`use-${type.toLowerCase()}`).classList.add('active');
    updateUI();
};

function updateUI() {
    document.getElementById('bal-usdt').innerText = userData.usdt.toFixed(2);
    document.getElementById('bal-idr').innerText = userData.idr.toLocaleString('id-ID');
    document.getElementById('bet-amount').innerText = currentBet.toLocaleString('id-ID');
}

// Tambahkan sisa logika Matter.js (Paku, Drop Bola, Multiplier) dari script sebelumnya di bawah startGame()
initAuth();
