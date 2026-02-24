const { Engine, Render, Runner, Bodies, Composite, Events, Body } = Matter;

const engine = Engine.create({ positionIterations: 15, velocityIterations: 15 });
const world = engine.world;
const width = window.innerWidth;
const height = window.innerHeight;

const render = Render.create({
    element: document.body,
    engine: engine,
    options: { width, height, wireframes: false, background: 'transparent' }
});

let currentBalance = 100.00;
let currentBet = 1.00;
let cheatMode = 'normal';
const multipliers = [5, 2, 0.5, 0.2, 0.2, 0.5, 2, 5];

// Buat Paku
const rows = 9;
const spacing = width < 400 ? 35 : 42;
for (let i = 0; i < rows; i++) {
    const startX = (width - (i * spacing)) / 2;
    for (let j = 0; j <= i; j++) {
        const peg = Bodies.circle(startX + (j * spacing), 140 + (i * 45), 3, {
            isStatic: true, restitution: 0.8, render: { fillStyle: '#ffffff' }
        });
        Composite.add(world, peg);
    }
}

// Slot Multiplier
const slotY = height - 130;
const slotWidth = width / multipliers.length;
multipliers.forEach((val, i) => {
    const x = i * slotWidth + slotWidth / 2;
    const slot = Bodies.rectangle(x, slotY, slotWidth - 4, 35, {
        isStatic: true, isSensor: true, label: `slot-${val}`,
        render: { fillStyle: val >= 1 ? '#00ffcc' : '#ff0055' }
    });
    Composite.add(world, slot);

    const label = document.createElement('div');
    label.innerText = val + 'x';
    label.className = 'multiplier-label';
    label.style.left = (x - 12) + 'px';
    label.style.top = (slotY - 15) + 'px';
    document.body.appendChild(label);
});

// Drop Bola
document.getElementById('drop-btn').addEventListener('click', () => {
    if (currentBalance < currentBet) return alert("Saldo tidak cukup!");
    currentBalance -= currentBet;
    updateUI();

    const ball = Bodies.circle(width / 2 + (Math.random() * 2 - 1), 60, 6, {
        restitution: 0.6, frictionAir: 0.02,
        render: { fillStyle: '#ff0077', strokeStyle: '#fff', lineWidth: 1 }
    });
    Composite.add(world, ball);

    // EFEK GULIR SMOOTH (Anti-Cheat Natural)
    Events.on(engine, 'beforeUpdate', () => {
        if (cheatMode === 'lose' && ball.position.y > height * 0.4) {
            // Memberikan gaya gravitasi lateral yang sangat lemah ke arah tengah
            const force = (width / 2 - ball.position.x) * 0.00008; 
            Body.applyForce(ball, ball.position, { x: force, y: 0 });
        }
    });
});

// Deteksi Goal
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

// UI & Modal Functions
function updateUI() {
    document.getElementById('balance').innerText = `USDT ${currentBalance.toFixed(2)}`;
    document.getElementById('bet-amount').innerText = currentBet.toFixed(2);
}
window.changeBet = (v) => { if (currentBet + v > 0) { currentBet += v; updateUI(); } };
window.openDepo = () => { document.getElementById('depoModal').style.display = 'flex'; };
window.closeDepo = () => { document.getElementById('depoModal').style.display = 'none'; };

updateUI();
Render.run(render);
Runner.run(Runner.create(), engine);
