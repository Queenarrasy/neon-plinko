// --- KODE SISTEM SALDO & TIER (SUDAH ADA) ---
const SALDO_KEY = 'saldo_permainan';

function getSaldo() {
    return parseInt(localStorage.getItem(SALDO_KEY)) || 0;
}

function updateSaldo(jumlah) {
    let saldoBaru = getSaldo() + jumlah;
    if (saldoBaru < 0) return false;
    localStorage.setItem(SALDO_KEY, saldoBaru);
    window.dispatchEvent(new Event('storage'));
    refreshDisplaySaldo();
    return true;
}

function getTierData() {
    const saldo = getSaldo();
    if (saldo >= 10000000) return { nama: "DIAMOND VIP", warna: "#00d4ff", icon: "fa-gem", persen: 100 };
    if (saldo >= 5000000) return { nama: "PLATINUM VIP", warna: "#e5e4e2", icon: "fa-crown", persen: Math.floor(((saldo-5000000)/5000000)*100) };
    if (saldo >= 1000000) return { nama: "GOLD VIP", warna: "#fbff00", icon: "fa-medal", persen: Math.floor(((saldo-1000000)/4000000)*100) };
    if (saldo >= 100000) return { nama: "SILVER VIP", warna: "#c0c0c0", icon: "fa-star", persen: Math.floor(((saldo-100000)/900000)*100) };
    return { nama: "BRONZE", warna: "#cd7f32", icon: "fa-user", persen: Math.floor((saldo/100000)*100) };
}

function refreshDisplaySaldo() {
    const saldo = getSaldo();
    const tier = getTierData();
    document.querySelectorAll('#display-saldo').forEach(el => el.innerText = "IDR " + saldo.toLocaleString('id-ID'));
    document.querySelectorAll('#tier-name').forEach(el => {
        el.innerText = tier.nama;
        el.style.color = tier.warna;
    });
}

// --- TAMBAHAN KODE SISTEM ADMIN (WIN RATE) ---
// Bagian ini untuk mengatur kemenangan dan kekalahan user

const WIN_RATE_KEY = 'admin_win_rate';

/**
 * Fungsi untuk Admin mengatur Win Rate (0 sampai 100)
 * Jalankan ini di Console Browser: setWinRate(10)
 */
function setWinRate(percent) {
    // Memastikan input adalah angka 0-100
    let val = parseInt(percent);
    if (isNaN(val)) val = 30; // Default jika salah input
    if (val < 0) val = 0;
    if (val > 100) val = 100;
    
    localStorage.setItem(WIN_RATE_KEY, val);
    console.log("%c ADMIN SYSTEM: Win Rate diatur ke " + val + "% ", "background: #ff0077; color: white; font-weight: bold;");
    return "Win Rate sekarang: " + val + "%";
}

/**
 * Fungsi untuk mengambil data Win Rate yang sedang aktif
 */
function getWinRate() {
    let rate = localStorage.getItem(WIN_RATE_KEY);
    // Jika belum pernah disetting admin, default kemenangan adalah 30%
    return rate !== null ? parseInt(rate) : 30; 
}

// Event Listeners
document.addEventListener('DOMContentLoaded', refreshDisplaySaldo);
window.addEventListener('storage', refreshDisplaySaldo);
