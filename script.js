const { Engine, Render, Runner, Bodies, Composite, Events, Body } = Matter;

const engine = Engine.create({
    positionIterations: 10, // Membuat tabrakan lebih akurat
    velocityIterations: 10
});
const world = engine.world;
const width = window.innerWidth;
const height = window.innerHeight;

const render = Render.create({
    element: document.body,
    engine: engine,
    options: { 
        width, 
        height, 
        wireframes: false, 
        background: 'transparent',
        pixelRatio: window.devicePixelRatio // Gerakan lebih tajam & halus
    }
});

let currentBalance = 100.00;
let cheatMode = 'normal'; 
const multipliers = [5, 2, 0.5, 0.2, 0.2, 0.5, 2, 5]; 

// 1. Membuat Paku (Pegs)
for (let i = 0; i < 9; i++) {
    const spacing = 45;
    const offsetX = (width / 2) - (i * spacing / 2);
    for (let j = 0; j <= i; j++) {
        const peg = Bodies.circle(offsetX + (j * spacing), 150 + (i * 45), 4, {
            isStatic: true,
            restitution: 0.8, // Membuat bola memantul lebih alami
            render: { fillStyle: '#ffffff' }
        });
        Composite.add(world, peg);
    }
}

// 2. Membuat Kotak Perkalian dengan Teks
const slotWidth = width / multipliers.length;
multipliers.forEach((val, i) => {
    const x = i * slotWidth + slotWidth / 2;
    const slot = Bodies.rectangle(x, height - 100, slotWidth - 5, 45, {
        isStatic: true,
        isSensor: true,
        label: `slot-${val}`,
        render: { fillStyle: val >= 1 ? '#00ffcc' : '#ff0055' }
    });
    Composite.add(world, slot);

    // Menambahkan elemen teks angka di atas kotak (Agar muncul di UI)
    const label = document.createElement('div');
    label.innerText = val + 'x';
    label.style.position = 'absolute';
    label.style.left = (x - 15) + 'px';
    label.style.top = (height - 105) + 'px';
    label.style.color = 'black';
    label.style.fontWeight = 'bold';
    label.style.fontSize = '12px';
    label.style.pointerEvents = 'none';
    label.style.zIndex = '10';
    document.body.appendChild(label);
});

// 3. Logika Jatuhkan Bola (Smooth Motion)
document.getElementById('drop-btn').addEventListener('click', () => {
    if (currentBalance < 1) return alert("Saldo Habis!");
    currentBalance -= 1;
    document.getElementById('balance').innerText = currentBalance.toFixed(2);

    const ball = Bodies.circle(width / 2 + (Math.random() * 4 - 2), 50, 10, {
        restitution: 0.6, // Pantulan bola lebih empuk
        friction: 0.001,
        frictionAir: 0.02, // Membuat bola jatuh lebih elegan/tidak terlalu cepat
        render: { fillStyle: '#ff0077' }
    });
    Composite.add(world, ball);

    // Gaya Dorong Admin/House Edge
    Events.on(engine, 'beforeUpdate', () => {
        if (ball.position.y > height / 2) {
            if (cheatMode === 'lose') {
                const force = (width / 2 - ball.position.x) * 0.0006;
                Body.applyForce(ball, ball.position, { x: force, y: 0 });
            } else if (cheatMode === 'win') {
                const dir = ball.position.x > width / 2 ? 1 : -1;
                Body.applyForce(ball, ball.position, { x: 0.0009 * dir, y: 0 });
            }
        }
    });
});

// 4. Deteksi Kemenangan
Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach((pair) => {
        if (pair.bodyA.label && pair.bodyA.label.startsWith('slot-')) {
            const multi = parseFloat(pair.bodyA.label.split('-')[1]);
            currentBalance += (1 * multi);
            document.getElementById('balance').innerText = currentBalance.toFixed(2);
            Composite.remove(world, pair.bodyB);
            
            if (window.Telegram && window.Telegram.WebApp) {
                window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
            }
        }
    });
});

window.setMode = (m) => { cheatMode = m; };

Render.run(render);
Runner.run(Runner.create(), engine);
