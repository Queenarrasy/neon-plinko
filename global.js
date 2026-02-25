// GLOBAL SYSTEM - NEON PLINKO
// Menangani Saldo, Win Rate, dan Database Referral

// 1. SISTEM SALDO SINKRON
function updateSaldo(jumlah) {
    let saldo = parseInt(localStorage.getItem('saldo_permainan')) || 0;
    
    if (jumlah < 0 && Math.abs(jumlah) > saldo) {
        return false; // Saldo tidak cukup
    }
    
    saldo += jumlah;
    localStorage.setItem('saldo_permainan', saldo);
    
    // Update tampilan di semua halaman yang punya ID saldo
    const display = document.getElementById('display-saldo');
    if (display) {
        display.innerText = "IDR " + saldo.toLocaleString('id-ID');
    }
    
    // Update Tier Name berdasarkan saldo
    const tier = document.getElementById('tier-name');
    if (tier) {
        if (saldo >= 1000000) tier.innerText = "PLATINUM VIP";
        else if (saldo >= 500000) tier.innerText = "GOLD MEMBER";
        else tier.innerText = "BRONZE PLAYER";
    }
    return true;
}

// 2. SISTEM WIN RATE (TERKONEKSI KE ADMIN.HTML)
function getWinRate() {
    return parseInt(localStorage.getItem('admin_win_rate')) || 30; // Default 30%
}

// 3. SISTEM REFERRAL (PENGHUBUNG PENDAFTARAN)
function registerReferral(usernameBaru, kodeRef) {
    if (!kodeRef) return;

    // Ambil database referral yang sudah ada
    let refData = JSON.parse(localStorage.getItem('referral_database')) || [];
    
    // Simpan data user baru yang menggunakan kode referral seseorang
    refData.push({
        invitedUser: usernameBaru,
        fromCode: kodeRef,
        hasDeposited: false, // Default false, berubah jadi true saat deposit sukses
        date: new Date().toLocaleDateString('id-ID')
    });
    
    localStorage.setItem('referral_database', JSON.stringify(refData));
}

// 4. VALIDASI DEPOSIT UNTUK REWARD
// Dipanggil otomatis saat deposit SUKSES di deposit.html
function checkReferralOnDeposit() {
    let currentLog = JSON.parse(localStorage.getItem('riwayat_depo')) || [];
    let refData = JSON.parse(localStorage.getItem('referral_database')) || [];
    
    // Jika ada deposit yang sukses, update status referral
    if (currentLog.some(d => d.status === "SUKSES")) {
        refData.forEach(ref => {
            ref.hasDeposited = true;
        });
        localStorage.setItem('referral_database', JSON.stringify(refData));
    }
}

// Jalankan fungsi update saldo saat halaman dimuat
window.addEventListener('load', () => {
    updateSaldo(0);
});

// ============================================================
// 5. SISTEM NOTIFIKASI NEON GLOBAL (AUTO-INJECT)
// ============================================================

// Memasukkan CSS Neon ke dalam Head secara otomatis
const styleNeon = document.createElement('style');
styleNeon.innerHTML = `
    #neon-global-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.95); backdrop-filter: blur(10px);
        display: none; justify-content: center; align-items: center; z-index: 9999999;
        font-family: 'Segoe UI', sans-serif;
    }
    .neon-global-modal {
        background: #050612; border: 2px solid #00d4ff; border-radius: 25px;
        padding: 30px; text-align: center; width: 85%; max-width: 320px;
        box-shadow: 0 0 40px rgba(0, 212, 255, 0.4);
        animation: neonPopup 0.3s ease-out;
    }
    @keyframes neonPopup { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .neon-global-modal h2 { color: #fbff00; text-shadow: 0 0 10px #fbff00; margin: 0 0 15px 0; font-size: 22px; text-transform: uppercase; letter-spacing: 2px; }
    .neon-global-modal p { color: #ffffff; line-height: 1.6; margin-bottom: 25px; font-size: 15px; }
    .neon-global-btn {
        background: transparent; border: 2px solid #ff0077; color: #ff0077;
        padding: 12px 0; width: 100%; border-radius: 50px; font-weight: 900;
        cursor: pointer; box-shadow: 0 0 15px #ff0077; text-transform: uppercase;
        transition: 0.3s;
    }
    .neon-global-btn:hover { background: #ff0077; color: #000; }
`;
document.head.appendChild(styleNeon);

// Memasukkan HTML Modal ke dalam Body secara otomatis
const modalContainer = document.createElement('div');
modalContainer.id = 'neon-global-overlay';
modalContainer.innerHTML = `
    <div class="neon-global-modal">
        <h2 id="neon-title">INFO</h2>
        <p id="neon-msg">Pesan sistem di sini.</p>
        <button class="neon-global-btn" onclick="closeNeonAlert()">MENGERTI</button>
    </div>
`;
document.body.appendChild(modalContainer);

// Fungsi untuk menutup alert
window.closeNeonAlert = function() {
    document.getElementById('neon-global-overlay').style.display = 'none';
};

// Fungsi utama pemanggil modal
window.showNeonAlert = function(msg, title = "INFO") {
    document.getElementById('neon-title').innerText = title;
    document.getElementById('neon-msg').innerText = msg;
    document.getElementById('neon-global-overlay').style.display = 'flex';
};

// FORCE OVERRIDE: Mengganti fungsi alert() bawaan browser agar menggunakan tema Neon
window.alert = function(message) {
    showNeonAlert(message, "NOTIFIKASI");
};
