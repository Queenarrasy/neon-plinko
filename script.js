const { Engine, Render, Runner, Bodies, Composite, Events, Body } = Matter;

const tg = window.Telegram.WebApp;
tg.expand();

// --- STATE GAME ---
let userData = null;
let activeCurrency = 'USDT';
let currentBet = 1.00;
let cheatMode = 'normal';

// --- ENGINE MATTER.JS ---
const engine = Engine.create({ positionIterations: 10 });
const world = engine.world;
const width = window.innerWidth;
const height = window.innerHeight;

const render = Render.create({
    element: document.body,
    engine: engine,
    options: { width, height, wireframes: false, background: 'transparent' }
});

// --- SISTEM AUTH ---
function initAuth() {
    const tgId = tg.initDataUnsafe?.user?.id || "USER_LOCAL";
    const saved = localStorage.getItem(`plinko_v3_${tgId}`);

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
        userData = { username: u, password: p, usdt: 100, idr: 1000000, phone: "", email: "", bank: "" };
        localStorage.setItem(`plinko_v3_${tgId}`, JSON.stringify(userData));
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

// --- FISIKA & VISUAL ---
function initPhysics() {
    // Paku (Pegs)
    const rows = 9;
    const spacing = 42;
    for (let i = 0; i < rows; i++) {
        const startX = (width - (i * spacing)) / 2;
        for (let j = 0; j <= i; j++) {
            const peg = Bodies.circle(startX + (j * spacing), 150 + (i * 45), 3.5, {
                isStatic: true, restitution: 0.8,
                render: { fillStyle: '#ffffff' }
            });
            Composite.add(world, peg);
        }
    }

    // Slot Multiplier
    const multipliers = [10, 5, 2, 0.5, 0.2, 0.5, 2, 5, 10];
    const slotWidth = width / multipliers.length;
    multipliers.forEach((val, i) => {
        const x = i * slotWidth + slotWidth / 2;
        const color = val >= 1 ? '#00f7ff' : '#ff0077';
        const slot = Bodies.rectangle(x, height - 120, slotWidth - 6, 40, {
            isStatic: true, isSensor: true, label: `slot-${val}`,
            render: { fillStyle: color }
        });
        Composite.add(world, slot);

        const label = document.createElement('div');
        label.innerText = val + 'x';
        label.className = 'multiplier-label';
        label.style.left = (x - 12) + 'px';
        label.style.top = (height - 135) + 'px';
        document.body.appendChild(label);
    });

    Render.run(render);
    Runner.run(Runner.create(), engine);
}

// --- LOGIKA GAME ---
document.getElementById('drop-btn').addEventListener('click', () => {
    const cost = currentBet;
    if (activeCurrency === 'USDT' && userData.usdt < cost) return alert("Saldo USDT Kurang");
    if (activeCurrency === 'IDR' && userData.idr < cost) return alert("Saldo IDR Kurang");

    if (activeCurrency === 'USDT') userData.usdt -= cost; else userData.idr -= cost;
    updateUI();

    const ball = Bodies.circle(width / 2 + (Math.random() * 2 - 1), 60, 6, {
        restitution: 0.5, frictionAir: 0.02,
        render: { fillStyle: '#ff0077' }
    });
    Composite.add(world, ball);

    // Smooth Anti-Cheat
    Events.on(engine, 'beforeUpdate', () => {
        if (cheatMode === 'lose' && ball.position.y > height * 0.4) {
            Body.applyForce(ball, ball.position, { x: (width/2 - ball.position.x) * 0.00008, y: 0 });
        }
    });
});

Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach(pair => {
        if (pair.bodyA.label?.startsWith('slot-')) {
            const multi = parseFloat(pair.bodyA.label.split('-')[1]);
            if (activeCurrency === 'USDT') userData.usdt += (currentBet * multi);
            else userData.idr += (currentBet * multi);
            updateUI();
            saveToLocal();
            Composite.remove(world, pair.bodyB);
        }
    });
});

// --- FUNGSI UI & PROFIL ---
function updateUI() {
    document.getElementById('bal-usdt').innerText = userData.usdt.toFixed(2);
    document.getElementById('bal-idr').innerText = userData.idr.toLocaleString('id-ID');
    document.getElementById('bet-amount').innerText = activeCurrency === 'USDT' ? currentBet.toFixed(2) : currentBet.toLocaleString('id-ID');
}

window.switchCurrency = (type) => {
    activeCurrency = type;
    currentBet = type === 'USDT' ? 1.00 : 10000;
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
    const isShow = m.style.display === 'flex';
    if (!isShow) {
        document.getElementById('display-username').innerText = userData.username;
        document.getElementById('user-phone').value = userData.phone || "";
        document.getElementById('user-email').value = userData.email || "";
        document.getElementById('user-bank').value = userData.bank || "";
        m.style.display = 'flex';
    } else m.style.display = 'none';
};

window.saveProfile = () => {
    userData.phone = document.getElementById('user-phone').value;
    userData.email = document.getElementById('user-email').value;
    userData.bank = document.getElementById('user-bank').value;
    saveToLocal();
    alert("Profil Disimpan!");
    toggleProfile();
};

function saveToLocal() {
    const tgId = tg.initDataUnsafe?.user?.id || "USER_LOCAL";
    localStorage.setItem(`plinko_v3_${tgId}`, JSON.stringify(userData));
}

initAuth();
