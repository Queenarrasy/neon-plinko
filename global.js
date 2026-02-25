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
