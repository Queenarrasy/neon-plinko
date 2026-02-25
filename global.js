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

document.addEventListener('DOMContentLoaded', refreshDisplaySaldo);
window.addEventListener('storage', refreshDisplaySaldo);
