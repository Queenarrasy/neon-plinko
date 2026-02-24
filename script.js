const { Engine, Render, Runner, Bodies, Composite, Events, Body } = Matter;

// 1. Inisialisasi Engine
const engine = Engine.create({ 
    positionIterations: 10, 
    velocityIterations: 10 
});
const world = engine.world;

// 2. Pengaturan Layar Otomatis
const width = window.innerWidth;
const height = window.innerHeight;

const render = Render.create({
    element: document.body,
    engine: engine,
    options: { 
        width: width, 
        height: height, 
        wireframes: false, 
        background: 'transparent',
        pixelRatio: window.devicePixelRatio 
    }
});

// 3. Variabel Game
let currentBalance = 100.00;
let currentBet = 1.00;
let cheatMode = 'normal';
const multipliers = [5, 2, 0.5, 0.2, 0.2, 0.5, 2, 5];

// 4. FUNGSI MEMBUAT PAKU (PEGS) - Diposisikan di tengah layar
const createPegs = () => {
    const rows = 9;
    const spacing = width < 400 ? 35 : 45; // Menyesuaikan lebar HP
    const startY = 120; // Mulai di bawah saldo

    for (let i = 0; i < rows; i++) {
        const pegsInRow = i + 1;
        const rowWidth = (pegsInRow - 1) * spacing;
        const startX = (width - rowWidth) / 2;

        for (let j = 0; j < pegsInRow; j++) {
            const peg = Bodies.circle(startX + (j * spacing), startY + (i * (spacing + 5)), 3.5, {
                isStatic: true,
                restitution: 0.8,
                render: { fillStyle: '#ffffff' }
            });
            Composite.add(world, peg);
        }
    }
};

// 5. Membuat Slot Multiplier di Bawah Paku
const createSlots = () => {
    const slotWidth = width / multipliers.length;
    const slotY = height - 120; // Posisi di atas tombol kontrol

    multipliers.forEach((val, i) => {
        const x = i * slotWidth + slotWidth / 2;
        const slot = Bodies.rectangle(x, slotY, slotWidth - 4, 35, {
            isStatic: true,
            isSensor: true,
            label: `slot-${val}`,
            render: { fillStyle: val >= 1 ? '#00ffcc' : '#ff0055' }
        });
        Composite.add(world, slot);

        // Label angka perkalian
        const label = document.createElement('div');
        label.innerText = val + 'x';
        label.className = 'multiplier-label';
        label.style.left = (x - 12) + 'px';
        label.style.top = (slotY - 15) + 'px';
        document.body.appendChild(label);
    });
};

// 6. Logika Jatuhkan Bola (Ukuran Kecil & Halus)
document.getElementById('drop-btn').addEventListener('click', () => {
    if (currentBalance < currentBet) return alert("Saldo tidak cukup!");
    
    currentBalance -= currentBet;
    updateUI();

    const ball = Bodies.circle(width / 2 + (Math.random() * 2 - 1), 60, 6, {
        restitution: 0.5,
        frictionAir: 0.02,
        render: { fillStyle: '#ff0077', strokeStyle: '#ffffff', lineWidth: 1 }
    });
    Composite.add(world, ball);

    // Manipulasi Halus
    Events.on(engine, 'beforeUpdate', () => {
        if (cheatMode === 'lose' && ball.position.y > height * 0.5) {
            const forceX = (width / 2 - ball.position.x) * 0.00012;
            Body.applyForce(ball, ball.position, { x: forceX, y: 0 });
        }
    });
});

// 7. Deteksi Tabrakan & Update UI
Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach((pair) => {
        if (pair.bodyA.label && pair.bodyA.label.startsWith('slot-')) {
            const multi = parseFloat(pair.bodyA.label.split('-')[1]);
            currentBalance += (currentBet * multi);
            updateUI();
            Composite.remove(world, pair.bodyB);
        }
    });
});

const updateUI = () => {
    document.getElementById('balance').innerText = `USDT ${currentBalance.toFixed(2)}`;
    document.getElementById('bet-amount').innerText = currentBet.toFixed(2);
};

window.changeBet = (val) => {
    if (currentBet + val > 0) { currentBet += val; updateUI(); }
};

window.setMode = (m) => { cheatMode = m; };

// Inisialisasi Game
createPegs();
createSlots();
updateUI();
Render.run(render);
Runner.run(Runner.create(), engine);
