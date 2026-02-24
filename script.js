const { Engine, Render, Runner, Bodies, Composite, Events, Body } = Matter;

const engine = Engine.create({ positionIterations: 10, velocityIterations: 10 });
const world = engine.world;
const width = window.innerWidth;
const height = window.innerHeight;

// SETTING KURS & SALDO (Contoh USDT)
let currentBalance = 100.00; // Saldo awal dalam USDT
let currentBet = 1.00;      // Taruhan awal
const currency = "USDT";    // Bisa diganti "Rp"

const render = Render.create({
    element: document.body,
    engine: engine,
    options: { width, height, wireframes: false, background: 'transparent' }
});

const multipliers = [5, 2, 0.5, 0.2, 0.2, 0.5, 2, 5];
let cheatMode = 'normal';

// Update Tampilan Saldo & Bet di UI
const updateUI = () => {
    document.getElementById('balance').innerText = `${currency} ${currentBalance.toFixed(2)}`;
    document.getElementById('bet-amount').innerText = currentBet.toFixed(2);
};

// 1. Membuat Kotak Perkalian
const slotWidth = width / multipliers.length;
multipliers.forEach((val, i) => {
    const x = i * slotWidth + slotWidth / 2;
    const slot = Bodies.rectangle(x, height - 100, slotWidth - 5, 45, {
        isStatic: true, isSensor: true, label: `slot-${val}`,
        render: { fillStyle: val >= 1 ? '#00ffcc' : '#ff0055' }
    });
    Composite.add(world, slot);

    const label = document.createElement('div');
    label.innerText = val + 'x';
    label.style = `position:absolute; left:${x-15}px; top:${height-105}px; color:black; font-weight:bold; z-index:10; pointer-events:none;`;
    document.body.appendChild(label);
});

// 2. Logika Tombol BET (Tambah/Kurang)
window.changeBet = (amount) => {
    if (currentBet + amount > 0) {
        currentBet += amount;
        updateUI();
    }
};

// 3. Jatuhkan Bola (UKURAN DIPERKECIL & ANTI-CHEAT MENCOLOK)
document.getElementById('drop-btn').addEventListener('click', () => {
    if (currentBalance < currentBet) return alert("Saldo tidak cukup!");
    
    currentBalance -= currentBet;
    updateUI();

    // Ukuran bola diperkecil dari 10 menjadi 7
    const ball = Bodies.circle(width / 2 + (Math.random() * 2 - 1), 50, 7, {
        restitution: 0.5,
        frictionAir: 0.025,
        render: { fillStyle: '#ff0077' }
    });
    Composite.add(world, ball);

    // Perbaikan Mode Kalah (Gaya gravitasi halus, bukan melayang tiba-tiba)
    Events.on(engine, 'beforeUpdate', () => {
        if (cheatMode === 'lose' && ball.position.y > height * 0.4) {
            // Gaya halus menarik bola ke tengah (multiplayer kecil)
            const targetX = width / 2;
            const forceX = (targetX - ball.position.x) * 0.00015; 
            Body.applyForce(ball, ball.position, { x: forceX, y: 0 });
        }
    });
});

// 4. Deteksi Kemenangan Berdasarkan Taruhan
Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach((pair) => {
        if (pair.bodyA.label && pair.bodyA.label.startsWith('slot-')) {
            const multi = parseFloat(pair.bodyA.label.split('-')[1]);
            const winAmount = currentBet * multi;
            currentBalance += winAmount;
            updateUI();
            Composite.remove(world, pair.bodyB);
        }
    });
});

updateUI();
Render.run(render);
Runner.run(Runner.create(), engine);
