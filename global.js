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

function refreshDisplaySaldo() {
    const elements = document.querySelectorAll('#display-saldo');
    elements.forEach(el => {
        el.innerText = "IDR " + getSaldo().toLocaleString('id-ID');
    });
}

window.addEventListener('storage', refreshDisplaySaldo);
document.addEventListener('DOMContentLoaded', refreshDisplaySaldo);
