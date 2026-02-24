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

// PENGATURAN GAME
let currentBalance = 100.00;
let cheatMode = 'normal'; 
const multipliers = [5, 2, 0.5, 0.2, 0.2, 0.5, 2, 5]; // Kotak hadiah di bawah

// 1. Membuat Paku (Pegs)
for (let i = 0; i < 9; i++) {
    const spacing = 45;
    const offsetX = (width / 2) - (i * spacing / 2);
    for (let j = 0; j <= i; j++) {
        const peg = Bodies.circle(offsetX + (j * spacing), 150 + (i * 45), 4, {
            isStatic: true, render: { fillStyle: '#ffffff' }
        });
        Composite.add(world, peg);
    }
}

// 2. Membuat Kotak Perkalian (Multiplier) di bawah
const slotWidth = width / multipliers.length;
multipliers.forEach((val, i) => {
    const x = i * slotWidth + slotWidth / 2;
    const slot = Bodies.rectangle(x, height - 100, slotWidth - 5, 40, {
        isStatic: true, isSensor: true, label: `slot-${val}`,
        render: { fillStyle: val >= 1 ? '#00ffcc' : '#ff0055' }
    });
    Composite.add(world, slot);
    
    // Teks angka perkalian (Opsional, muncul di console log)
    console.log("Slot created: " + val);
});

// 3. Logika Jatuhkan Bola
document.getElementById('drop-btn').addEventListener('click', () => {
    if (currentBalance < 1) return alert("Saldo Habis!");
    currentBalance -= 1;
    document.getElementById('balance').innerText = currentBalance.toFixed(2);

    const ball = Bodies.circle(width / 2 + (Math.random() * 4 - 2), 50, 10, {
        restitution: 0.5, render: { fillStyle: '#ff0077' }
    });
    Composite.add(world, ball);

    // Manipulasi Menang/Kalah
    Events.on(engine, 'beforeUpdate', () => {
        if (ball.position.y > height / 2) {
            if (cheatMode === 'lose') {
                const force = (width / 2 - ball.position.x) * 0.0005;
                Body.applyForce(ball, ball.position, { x: force, y: 0 });
            } else if (cheatMode === 'win') {
                const dir = ball.position.x > width / 2 ? 1 : -1;
                Body.applyForce(ball, ball.position, { x: 0.0008 * dir, y: 0 });
            }
        }
    });
});

// 4. Deteksi Bola Masuk Slot
Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach((pair) => {
        if (pair.bodyA.label && pair.bodyA.label.startsWith('slot-')) {
            const multi = parseFloat(pair.bodyA.label.split('-')[1]);
            currentBalance += (1 * multi);
            document.getElementById('balance').innerText = currentBalance.toFixed(2);
            Composite.remove(world, pair.bodyB); // Hapus bola
            
            if (window.Telegram && window.Telegram.WebApp) {
                window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
            }
        }
    });
});

window.setMode = (m) => { cheatMode = m; alert("Mode: " + m); };

Render.run(render);
Runner.run(Runner.create(), engine);
