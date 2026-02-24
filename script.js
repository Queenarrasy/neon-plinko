const { Engine, Render, Runner, Bodies, Composite, Events, Body } = Matter;
const engine = Engine.create({ positionIterations: 10 });
const world = engine.world;
const width = window.innerWidth;
const height = window.innerHeight;

const render = Render.create({
    element: document.body,
    engine: engine,
    options: { width, height, wireframes: false, background: 'transparent' }
});

// Pembuatan Paku dengan Efek VIP
const rows = 9;
const spacing = 42;
for (let i = 0; i < rows; i++) {
    const startX = (width - (i * spacing)) / 2;
    for (let j = 0; j <= i; j++) {
        const peg = Bodies.circle(startX + (j * spacing), 150 + (i * 45), 3.5, {
            isStatic: true,
            restitution: 0.8,
            render: { 
                fillStyle: '#ffffff',
                shadowBlur: 10,
                shadowColor: '#ffffff'
            }
        });
        Composite.add(world, peg);
    }
}

// Slot Multiplier Berwarna
const multipliers = [10, 5, 2, 0.5, 0.2, 0.5, 2, 5, 10];
const slotWidth = width / multipliers.length;
multipliers.forEach((val, i) => {
    const x = i * slotWidth + slotWidth / 2;
    const color = val >= 1 ? '#00f7ff' : '#ff0077';
    const slot = Bodies.rectangle(x, height - 120, slotWidth - 6, 40, {
        isStatic: true, isSensor: true, label: `slot-${val}`,
        render: { fillStyle: color, strokeStyle: '#fff', lineWidth: 1 }
    });
    Composite.add(world, slot);

    const label = document.createElement('div');
    label.innerText = val + 'x';
    label.className = 'multiplier-label';
    label.style.left = (x - 12) + 'px';
    label.style.top = (height - 135) + 'px';
    document.body.appendChild(label);
});

// Logika Jatuhkan Bola
document.getElementById('drop-btn').addEventListener('click', () => {
    const ball = Bodies.circle(width / 2 + (Math.random() * 2 - 1), 60, 6, {
        restitution: 0.5, frictionAir: 0.02,
        render: { fillStyle: '#ff0077', shadowBlur: 15, shadowColor: '#ff0077' }
    });
    Composite.add(world, ball);
});

Render.run(render);
Runner.run(Runner.create(), engine);
