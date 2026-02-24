// 1. LOGIKA DAFTAR & MASUK (HANDLING AUTH)
window.handleAuth = (type) => {
    const tgId = tg.initDataUnsafe?.user?.id || "DEV_USER";
    
    if (type === 'register') {
        const u = document.getElementById('reg-username').value;
        const p = document.getElementById('reg-password').value;
        const w = document.getElementById('reg-wallet').value;

        if (!u || !p || !w) return alert("Lengkapi semua data pendaftaran!");

        // Simpan Data & Kunci secara permanen
        window.userAccount = { 
            username: u, 
            password: p, 
            wallet: w, 
            usdt: 0, 
            idr: 0 
        };
        localStorage.setItem(`neon_plinko_v5_${tgId}`, JSON.stringify(window.userAccount));
    } else {
        const pInput = document.getElementById('login-password').value;
        if (pInput !== window.userAccount.password) return alert("Password Salah!");
    }

    // TRANSISI KE GAME
    document.getElementById('auth-layer').style.display = 'none';
    document.getElementById('game-layer').style.display = 'block';
    
    // START GAME & DATA SYNC (Kunci agar tidak mentok logo)
    setTimeout(() => {
        startPlinko(); 
        syncToProfile();
    }, 100);
};

// 2. SINKRONISASI DATA KE PROFIL
function syncToProfile() {
    document.getElementById('profile-id').innerText = window.userAccount.username;
    document.getElementById('profile-wallet').innerText = window.userAccount.wallet;
    
    document.getElementById('main-avatar').src = `https://api.dicebear.com/7.x/bottts/svg?seed=${window.userAccount.username}`;
    document.getElementById('bal-usdt').innerText = window.userAccount.usdt.toFixed(2);
    document.getElementById('bal-idr').innerText = window.userAccount.idr.toLocaleString('id-ID');
}

// 3. MESIN FISIKA PLINKO (DIPERBAIKI)
let engine, world, render;

function startPlinko() {
    const { Engine, Render, Runner, Bodies, Composite } = Matter;
    
    // Reset Engine jika sudah ada
    if (engine) Engine.clear(engine);

    engine = Engine.create();
    world = engine.world;

    const container = document.getElementById('plinko-canvas-container');
    if (!container) return; // Mencegah error jika elemen tidak ditemukan

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
    const rows = 9;
    for (let i = 0; i < rows; i++) {
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

// 4. JATUHKAN BOLA
window.spawnBall = () => {
    const ball = Matter.Bodies.circle(window.innerWidth / 2 + (Math.random() - 0.5) * 5, 10, 7, {
        restitution: 0.6, 
        friction: 0.05, 
        render: { fillStyle: '#00f7ff' }
    });
    Matter.Composite.add(world, ball);
};

// 5. FUNGSI POPUP PROFIL
window.toggleProfile = () => {
    const p = document.getElementById('profile-layer');
    p.style.display = p.style.display === 'none' ? 'flex' : 'none';
};
