/**
 * NEON PLINKO VIP - Global Finance System
 * Menghubungkan semua saldo di setiap halaman secara Real-Time.
 */

// Kunci utama database lokal
const SALDO_KEY = 'saldo_permainan';

// 1. Fungsi Mengambil Saldo Terkini
function getSaldo() {
    return parseInt(localStorage.getItem(SALDO_KEY)) || 0;
}

// 2. Fungsi Mengupdate Saldo (Tambah/Kurang)
function updateSaldo(jumlah) {
    let saldoSaatIni = getSaldo();
    let saldoBaru = saldoSaatIni + jumlah;
    
    // Cegah saldo menjadi negatif
    if (saldoBaru < 0) return false;
    
    localStorage.setItem(SALDO_KEY, saldoBaru);
    
    // Trigger event agar halaman lain tahu saldo berubah
    window.dispatchEvent(new Event('storage'));
    refreshDisplaySaldo();
    return true;
}

// 3. Fungsi Menampilkan Saldo ke Elemen HTML
function refreshDisplaySaldo() {
    const elements = document.querySelectorAll('#display-saldo, .user-balance, #user-balance');
    const currentSaldo = getSaldo();
    
    elements.forEach(el => {
        // Efek transisi angka jika perlu
        el.innerText = "IDR " + currentSaldo.toLocaleString('id-ID');
    });
}

// 4. Sinkronisasi Otomatis antar Tab/Halaman
window.addEventListener('storage', (event) => {
    // Jika ada perubahan saldo di tab lain, update tampilan di tab ini
    refreshDisplaySaldo();
});

// Jalankan saat halaman dimuat
document.addEventListener('DOMContentLoaded', refreshDisplaySaldo);
