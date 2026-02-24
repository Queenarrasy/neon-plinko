const tg = window.Telegram.WebApp;
tg.expand();

function initApp() {
    const tgId = tg.initDataUnsafe?.user?.id || "GUEST_USER";
    const data = localStorage.getItem(`neon_v5_${tgId}`);

    if (data) {
        window.user = JSON.parse(data);
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('display-greet').innerText = "Halo, " + window.user.username;
    } else {
        document.getElementById('reg-container').style.display = 'block';
    }
}

window.handleAuth = (mode) => {
    const tgId = tg.initDataUnsafe?.user?.id || "GUEST_USER";
    if (mode === 'register') {
        const u = document.getElementById('reg-username').value;
        const p = document.getElementById('reg-password').value;
        const w = document.getElementById('reg-wallet').value;
        if (!u || !p || !w) return alert("Isi semua data!");
        window.user = { username: u, password: p, wallet: w, usdt: 0, idr: 0 };
        localStorage.setItem(`neon_v5_${tgId}`, JSON.stringify(window.user));
    } else {
        if (document.getElementById('login-password').value !== window.user.password) return alert("Salah!");
    }
    
    // TRANSISI
    document.getElementById('auth-layer').style.display = 'none';
    document.getElementById('game-layer').style.display = 'block';
    
    startPlinko();
    syncData();
};

function syncData() {
    document.getElementById('profile-id').innerText = window.user.username;
    document.getElementById('profile-wallet').innerText = window.user.wallet;
    document.getElementById('main-avatar').src = `https://api.dicebear.com/7.x/bottts/svg?seed=${window.user.username}`;
}

let engine, world;
function startPlinko() {
    const { Engine, Render, Runner, Bodies, Composite } = Matter;
    engine = Engine.create();
    world = engine.world;
    const container = document.getElementById('plinko-canvas-container');
    const render = Render.create({
        element: container,
        engine: engine,
        options: { width: container.clientWidth, height: 400, wireframes: false, background: 'transparent' }
    });
    // Buat Paku
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j <= i; j++) {
            Composite.add(world, Bodies.circle(container.clientWidth/2 + (j-i/2)*35, 50+i*40, 3, { isStatic: true }));
        }
    }
    Render.run(render);
    Runner.run(Runner.create(), engine);
}

window.spawnBall = () => {
    // Tambahkan efek getar saat klik (Opsional untuk Telegram)
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');

    const ball = Matter.Bodies.circle(window.innerWidth/2, 10, 8, { 
        restitution: 0.5,
        render: { fillStyle: '#ff0077' } // Bola warna Pink Neon
    });
    Matter.Composite.add(world, ball);
};
    Matter.Composite.add(world, Matter.Bodies.circle(window.innerWidth/2, 10, 8, { restitution: 0.5 }));
};

window.toggleProfile = () => {
    const p = document.getElementById('profile-layer');
    p.style.display = p.style.display === 'none' ? 'flex' : 'none';
};

document.addEventListener('DOMContentLoaded', initApp);
