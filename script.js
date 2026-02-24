const { Engine, Render, Runner, Bodies, Composite, Events, Body } = Matter;

const engine = Engine.create();
const world = engine.world;
const width = window.innerWidth;
const height = window.innerHeight;

const render = Render.create({
    element: document.body,
    engine: engine,
    options: { width, height, wireframes: false, background: 'transparent' }
});

// --- SISTEM SALDO & PENGATURAN BANDAR ---
let currentBalance = 100.00;
let cheatMode = 'normal'; // Pilihan: 'win', 'lose', 'normal'
const multipliers = [10, 5, 2, 0.5, 0.2, 0.5, 2, 5, 10]; // Pinggir besar, tengah rugi

// 1. Membuat Paku (Pegs) Statis
for (let i = 0; i < 9; i++) {
    const spacing = 40;
    const offsetX = (width / 2) - (i * spacing / 2);
    for (let j = 0; j <= i; j++) {
        const peg = Bodies.circle(offsetX + (j * spacing), 180 + (i * 45), 4, {
            isStatic: true,
            render: { fillStyle: '#ffffff' }
        });
        Composite.add(world, peg);
    }
}

// 2. Membuat Lubang Multiplier di Bawah
const slotWidth = width / multipliers.length;
multipliers.forEach((val, i) => {
    const x = i * slotWidth + slotWidth / 2;
    const slot = Bodies.rectangle(x, height - 25, slotWidth - 4, 50, {
        isStatic: true,
        isSensor: true, // Sensor agar bola terdeteksi tanpa memantul balik
        label: `slot-${val}`,
        render: { fillStyle: val >= 1 ? '#00ffcc' : '#ff0055' }
    });
    Composite.add(world, slot);
});

// 3. Logika Menjatuhkan Bola & Manipulasi Hasil
document.getElementById('drop-btn').addEventListener('click', () => {
    if (currentBalance < 1) return alert("Saldo tidak cukup untuk taruhan (Min 1 TON)");
    
    currentBalance -= 1; // Biaya per bola
    updateUI();

    const ball = Bodies.circle(width / 2 + (Math.random() * 6 - 3), 60, 10, {
        restitution: 0.6,
        friction: 0.01,
        render: { fillStyle: '#ff0077', strokeStyle: '#fff', lineWidth: 2 }
    });
    Composite.add(world, ball);

    // LOGIKA MANIPULASI (House Edge / Cheat)
    Events.on(engine, 'beforeUpdate', () => {
        if (ball.position.y > height * 0.6) { // Mulai manipulasi di area bawah
            if (cheatMode === 'lose' || (cheatMode === 'normal' && Math.random() > 0.6)) {
                // Dorong halus bola ke arah tengah (0.2x) agar bandar untung
                const force = (width / 2 - ball.position.x) * 0.0004;
                Body.applyForce(ball, ball.position, { x: force, y: 0 });
            } else if (cheatMode === 'win') {
                // Dorong bola ke arah pinggir (5x atau 10x)
                const pushDirection = ball.position.x > width / 2 ? 1 : -1;
                Body.applyForce(ball, ball.position, { x: 0.0006 * pushDirection, y: 0 });
            }
        }
    });
});

// 4. Deteksi Kemenangan & Update Saldo
Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach((pair) => {
        if (pair.bodyA.label.startsWith('slot-')) {
            const multi = parseFloat(pair.bodyA.label.split('-')[1]);
            const winAmount = 1 * multi;
            currentBalance += winAmount;
            updateUI();
            
            // Efek Getar di Telegram jika menang
            if (window.Telegram && window.Telegram.WebApp) {
                window.Telegram.WebApp.HapticFeedback.notificationOccurred(multi >= 1 ? 'success' : 'warning');
            }

            Composite.remove(world, pair.bodyB); // Hapus bola setelah masuk lubang
        }
    });
});

function updateUI() {
    document.getElementById('balance').innerText = currentBalance.toFixed(2);
}

// Fungsi Admin (Global agar bisa dipanggil dari HTML)
window.setMode = function(mode) {
    cheatMode = mode;
    document.getElementById('status-mode').innerText = "Mode: " + mode.toUpperCase();
};

// Integrasi dummy untuk Deposit/Withdraw
document.getElementById('deposit-btn').onclick = () => alert("Hubungkan Wallet TON Anda di BotFather > Payments");
document.getElementById('wd-btn').onclick = () => alert("Penarikan diproses otomatis ke Wallet Anda.");

Render.run(render);
Runner.run(Runner.create(), engine);
