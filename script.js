const { Engine, Render, Runner, Bodies, Composite, Events, Body } = Matter;
const tg = window.Telegram.WebApp;
tg.expand();

let userData = null;
let activeCurrency = 'USDT';
let currentBet = 1.00;

const engine = Engine.create();
const world = engine.world;
const width = window.innerWidth;
const height = window.innerHeight;

const render = Render.create({
    element: document.body,
    engine: engine,
    options: { width, height, wireframes: false, background: 'transparent' }
});

// AUTH SYSTEM
function initAuth() {
    const tgId = tg.initDataUnsafe?.user?.id || "USER_LOCAL";
    const saved = localStorage.getItem(`plinko_v4_${tgId}`);
    document.getElementById('loading-spinner').style.display = 'none';

    if (saved) {
        userData = JSON.parse(saved);
        document.getElementById('welcome-back').innerText = "Halo, " + userData.username;
        document.getElementById('login-form').style.display = 'block';
    } else {
        document.getElementById('auth-form').style.display = 'block';
    }
}

window.handleAuth = (type) => {
    const tgId = tg.initDataUnsafe?.user?.id || "USER_LOCAL";
    if (type === 'register') {
        const u = document.getElementById('reg-username').value;
        const p = document.getElementById('reg-password').value;
        if (!u || !p) return alert("Lengkapi data!");
        userData = { username: u, password: p, usdt: 100, idr: 1000000, method: "", account: "", locked: false };
        saveToLocal();
    } else {
        const p = document.getElementById('login-password').value;
        if (p !== userData.password) return alert("Password salah!");
    }
    startGame();
};

function startGame() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('gui').style.display = 'flex';
    initPhysics();
    updateUI();
}

function initPhysics() {
    const rows = 9;
    const spacing = 42;
    for (let i = 0; i < rows; i++) {
        const startX = (width - (i * spacing)) / 2;
        for (let j = 0; j <= i; j++) {
            const peg = Bodies.circle(startX + (j * spacing), 140 + (i * 45), 3, { isStatic: true, render: { fillStyle: '#fff' } });
            Composite.add(world, peg);
        }
    }

    const multipliers = [10, 5, 2, 0.5, 0.2, 0.5, 2, 5, 10];
    const slotWidth = width / multipliers.length;
    multipliers.forEach((val, i) => {
        const x = i * slotWidth + slotWidth / 2;
        const slot = Bodies.rectangle(x, height - 120, slotWidth - 6, 35, { isStatic: true, isSensor: true, label: `slot-${val}`, render: { fillStyle: val >= 1 ? '#00f7ff' : '#ff0077' } });
        Composite.add(world, slot);
        const label = document.createElement('div');
        label.className = 'multiplier-label'; label.innerText = val + 'x';
        label.style.left = (x - 10) + 'px'; label.style.top = (height - 135) + 'px';
        document.body.appendChild(label);
    });

    Render.run(render);
    Runner.run(Runner.create(), engine);
}

// GAME LOGIC
document.getElementById('drop-btn').addEventListener('click', () => {
    if (activeCurrency === 'USDT' && userData.usdt < currentBet) return alert("Saldo USDT Habis");
    if (activeCurrency === 'IDR' && userData.idr < currentBet) return alert("Saldo IDR Habis");

    if (activeCurrency === 'USDT') userData.usdt -= currentBet; else userData.idr -= currentBet;
    updateUI();

    const ball = Bodies.circle(width / 2 + (Math.random() * 2 - 1), 60, 6, { restitution: 0.5, render: { fillStyle: '#ff0077' } });
    Composite.add(world, ball);
});

Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach(pair => {
        if (pair.bodyA.label?.startsWith('slot-')) {
            const multi = parseFloat(pair.bodyA.label.split('-')[1]);
            if (activeCurrency === 'USDT') userData.usdt += (currentBet * multi);
            else userData.idr += (currentBet * multi);
            updateUI(); saveToLocal();
            Composite.remove(world, pair.bodyB);
        }
    });
});

// UI & PROFILE LOGIC
function updateUI() {
    document.getElementById('bal-usdt').innerText = userData.usdt.toFixed(2);
    document.getElementById('bal-idr').innerText = userData.idr.toLocaleString('id-ID');
    document.getElementById('bet-amount').innerText = activeCurrency === 'USDT' ? currentBet.toFixed(2) : currentBet.toLocaleString('id-ID');
}

window.switchCurrency = (type) => {
    activeCurrency = type; currentBet = type === 'USDT' ? 1.00 : 10000;
    document.querySelectorAll('.currency-selector button').forEach(b => b.classList.remove('active'));
    document.getElementById(`use-${type.toLowerCase()}`).classList.add('active');
    updateUI();
};

window.changeBet = (v) => {
    const step = activeCurrency === 'USDT' ? 0.5 : 5000;
    if (currentBet + (v * step) > 0) { currentBet += (v * step); updateUI(); }
};

window.toggleProfile = () => {
    const m = document.getElementById('profile-menu');
    if (m.style.display === 'none') {
        document.getElementById('display-username').innerText = userData.username;
        document.getElementById('user-method').value = userData.method || "";
        document.getElementById('user-account').value = userData.account || "";
        
        // Kunci jika sudah tersimpan
        if (userData.locked) {
            document.getElementById('user-method').disabled = true;
            document.getElementById('user-account').readOnly = true;
            document.getElementById('save-section').style.display = 'none';
        }
        m.style.display = 'flex';
    } else m.style.display = 'none';
};

window.saveProfile = () => {
    const method = document.getElementById('user-method').value;
    const account = document.getElementById('user-account').value;
    if (!method || !account) return alert("Isi data WD dengan lengkap!");

    if (confirm("Setelah disimpan, data metode pencairan tidak bisa diubah. Lanjutkan?")) {
        userData.method = method;
        userData.account = account;
        userData.locked = true;
        saveToLocal();
        alert("Data Berhasil Dikunci!");
        toggleProfile();
    }
};

function saveToLocal() {
    const tgId = tg.initDataUnsafe?.user?.id || "USER_LOCAL";
    localStorage.setItem(`plinko_v4_${tgId}`, JSON.stringify(userData));
}

initAuth();
