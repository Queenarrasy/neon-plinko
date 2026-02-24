// script.js

// 1. Setup Matter.js
const { Engine, Render, Runner, Bodies, Composite, Events } = Matter;

const engine = Engine.create();
const world = engine.world;

// Sesuaikan ukuran layar HP
const width = window.innerWidth;
const height = window.innerHeight;

const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: width,
        height: height,
        wireframes: false,
        background: 'transparent'
    }
});

// 2. Membuat Paku (Pegs) secara otomatis membentuk Segitiga
const rows = 9;
const pegRadius = 4;
for (let i = 0; i < rows; i++) {
    const spacing = 45;
    const offsetX = (width / 2) - (i * spacing / 2);
    for (let j = 0; j <= i; j++) {
        const x = offsetX + (j * spacing);
        const y = 180 + (i * 45);
        const peg = Bodies.circle(x, y, pegRadius, {
            isStatic: true,
            render: { fillStyle: '#ffffff' },
            friction: 0
        });
        Composite.add(world, peg);
    }
}

// 3. Batas Bawah & Samping (Agar bola tidak keluar layar)
const ground = Bodies.rectangle(width / 2, height + 10, width, 20, { isStatic: true });
const leftWall = Bodies.rectangle(-10, height / 2, 20, height, { isStatic: true });
const rightWall = Bodies.rectangle(width + 10, height / 2, 20, height, { isStatic: true });
Composite.add(world, [ground, leftWall, rightWall]);

// 4. Logika Saldo (Sementara di browser)
let currentBalance = 100.00;
const balanceEl = document.getElementById('balance');

// 5. Fungsi Drop Bola
function dropBall() {
    if (currentBalance < 1) {
        alert("Saldo habis! Silakan Top Up.");
        return;
    }

    // Kurangi saldo
    currentBalance -= 1.0;
    balanceEl.innerText = currentBalance.toFixed(2);

    // Buat Bola di posisi atas acak sedikit
    const ballX = (width / 2) + (Math.random() * 10 - 5);
    const ball = Bodies.circle(ballX, 50, 10, {
        restitution: 0.5, // Efek pantulan
        friction: 0.05,
        render: { 
            fillStyle: '#ff0077',
            strokeStyle: '#ffffff',
            lineWidth: 2
        }
    });

    Composite.add(world, ball);

    // Hapus bola jika sudah sampai bawah (untuk hemat memori)
    setTimeout(() => {
        Composite.remove(world, ball);
    }, 6000);
}

// Hubungkan ke tombol
document.getElementById('drop-btn').addEventListener('click', dropBall);

// Jalankan Engine
Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

// Respon jika layar diputar/ubah ukuran
window.addEventListener('resize', () => {
    render.canvas.width = window.innerWidth;
    render.canvas.height = window.innerHeight;
});
