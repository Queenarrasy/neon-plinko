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

// 1. LOGIKA DAFTAR & MASUK (HANDLING AUTH)
window.handleAuth = (type) => {
    const tgId = tg.initDataUnsafe?.user?.id || "DEV_USER";
    
    if (type === 'register') {
        const u = document.getElementById('reg-username').value;
        const p = document.getElementById('reg-password').value;
        const w = document.getElementById('reg-wallet').value;

        if (!u || !p || !w) return alert("Lengkapi semua data pendaftaran!");

        // Simpan Data Permanen (Saldo Awal 0)
        window.userAccount = { 
            username: u, 
            password: p, 
            wallet: w, 
            usdt: 0, 
            idr: 0 
        };
        localStorage.setItem(`neon_plinko_v5_${tgId}`, JSON.stringify(window.userAccount));
        alert("Pendaftaran Berhasil! User ID Anda telah aktif.");
    } else {
        const pInput = document.getElementById('login-password').value;
        if (pInput !== window.userAccount.password) return alert("Password Salah!");
    }

    // TRANSISI KE GAME (NO 3)
    document.getElementById('auth-layer').style.display = 'none';
    document.getElementById('game-layer').style.display = 'block';
    
    // Aktifkan Papan Game & Sinkronisasi Profil
    startPlinko(); 
    syncToProfile();
};

// 2. SINKRONISASI DATA KE PROFIL (READ ONLY)
function syncToProfile() {
    // Isi data ke Lembar 3 (Profil Popup)
    document.getElementById('profile-id').innerText = window.userAccount.username;
    document.getElementById('profile-wallet').innerText = window.userAccount.wallet;
    
    // Update Avatar & Saldo di Lembar 2
    document.getElementById('main-avatar').src = `https://api.dicebear.com/7.x/bottts/svg?seed=${window.userAccount.username}`;
    document.getElementById('bal-usdt').innerText = window.userAccount.usdt.toFixed(2);
    document.getElementById('bal-idr').innerText = window.userAccount.idr.toLocaleString('id-ID');
}

// 3. MESIN FISIKA PLINKO (MATTER.JS)
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

    // Membuat Formasi Paku (Pegs) Segitiga
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

// 4. FUNGSI JATUHKAN BOLA
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
