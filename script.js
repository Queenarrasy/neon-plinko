const tg = window.Telegram.WebApp;
tg.expand();

function initApp() {
    const tgId = tg.initDataUnsafe?.user?.id || "GUEST";
    const data = localStorage.getItem(`neon_v5_${tgId}`);

    // SEMBUNYIKAN SEMUA TERLEBIH DAHULU
    document.getElementById('reg-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'none';

    if (data) {
        window.user = JSON.parse(data);
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('display-greet').innerText = window.user.username;
        document.getElementById('user-avatar').src = `https://api.dicebear.com/7.x/bottts/svg?seed=${window.user.username}`;
    } else {
        document.getElementById('reg-container').style.display = 'block';
    }
}

window.handleAuth = (mode) => {
    const tgId = tg.initDataUnsafe?.user?.id || "GUEST";
    if (mode === 'register') {
        const u = document.getElementById('reg-username').value;
        const p = document.getElementById('reg-password').value;
        const w = document.getElementById('reg-wallet').value;
        if (!u || !p || !w) return alert("Lengkapi data!");
        window.user = { username: u, password: p, wallet: w };
        localStorage.setItem(`neon_v5_${tgId}`, JSON.stringify(window.user));
    } else {
        if (document.getElementById('login-password').value !== window.user.password) return alert("Salah!");
    }
    document.getElementById('auth-layer').style.display = 'none';
    document.getElementById('game-layer').style.display = 'block';
    
    document.getElementById('profile-id').innerText = window.user.username;
    document.getElementById('profile-wallet').innerText = window.user.wallet;
};
let engine, world, render;

function startPlinko() {
    const { Engine, Render, Runner, Bodies, Composite } = Matter;
    engine = Engine.create();
    world = engine.world;

    const container = document.getElementById('plinko-canvas-container');
    render = Render.create({
        element: container,
        engine: engine,
        options: { 
            width: container.clientWidth, 
            height: 380, 
            wireframes: false, 
            background: 'transparent' 
        }
    });

    // Membuat Formasi Paku (Pegs)
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j <= i; j++) {
            const x = container.clientWidth / 2 + (j - i / 2) * 35;
            const y = 40 + i * 38;
            const peg = Bodies.circle(x, y, 3, { 
                isStatic: true, 
                render: { fillStyle: '#ffffff' } 
            });
            Composite.add(world, peg);
        }
    }

    Render.run(render);
    Runner.run(Runner.create(), engine);
}

// Fungsi Menjatuhkan Bola
window.spawnBall = () => {
    const ball = Matter.Bodies.circle(window.innerWidth / 2 + (Math.random() - 0.5) * 5, 10, 7, {
        restitution: 0.6, 
        friction: 0.05, 
        render: { fillStyle: '#00f7ff' }
    });
    Matter.Composite.add(world, ball);
};


window.toggleProfile = () => {
    const p = document.getElementById('profile-layer');
    p.style.display = p.style.display === 'none' ? 'flex' : 'none';
};

// JALANKAN SAAT LOAD
document.addEventListener('DOMContentLoaded', initApp);
