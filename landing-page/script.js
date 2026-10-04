// KATEGORI: klik untuk pindah item aktif 
const kategoriItems = document.querySelectorAll('.kategori-item');
document.documentElement.classList.add('js');

kategoriItems.forEach((item) => {
    item.addEventListener('click', () => {
        kategoriItems.forEach((i) => i.classList.remove('active'));
        item.classList.add('active');
    });
});

// NAVBAR: tandai link sesuai section yang sedang dilihat 
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

// NAVBAR: bayangan muncul saat halaman sudah discroll
const navbarEl = document.querySelector('.navbar');

const setNavbarShadow = () => {
    navbarEl.classList.toggle('scrolled', window.scrollY > 20);
};

window.addEventListener('scroll', setNavbarShadow);
window.addEventListener('load', setNavbarShadow);

const setActiveLink = () => {
    let currentSectionId = sections[0] ? sections[0].id : '';

    sections.forEach((section) => {
        const sectionTop = section.offsetTop - 120;
        if (window.scrollY >= sectionTop) {
            currentSectionId = section.id;
        }
    });

    // Kalau sudah discroll sampai halaman paling bawah, paksa section terakhir aktif
    const scrolledToBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

    if (scrolledToBottom) {
        currentSectionId = sections[sections.length - 1].id;
    }

    navLinks.forEach((link) => {
        link.classList.remove('active-link');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
            link.classList.add('active-link');
        }
    });
};

window.addEventListener('scroll', setActiveLink);
window.addEventListener('load', setActiveLink);

// NAVBAR MOBILE: buka/tutup menu hamburger 
const navToggle = document.getElementById('navToggle');
const navLinksList = document.querySelector('.nav-links');

if (navToggle && navLinksList) {
    navToggle.addEventListener('click', () => {
        const isOpen = navLinksList.classList.toggle('open');
        navToggle.classList.toggle('open', isOpen);
        navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Tutup menu otomatis saat salah satu link diklik (khusus mobile)
    navLinksList.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            navLinksList.classList.remove('open');
            navToggle.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

// BACK TO TOP: tombol muncul setelah discroll turun ke plg bawah ngeklik buat balik ke atas
const backToTopBtn = document.getElementById('backToTop');

if (backToTopBtn) {
    window.addEventListener('scroll', () => {
        backToTopBtn.classList.toggle('show', window.scrollY > 400);
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// STATUS BUKA/TUTUP: dihitung dari jam buka resto, pakai waktu WIB
const statusBadge = document.getElementById('statusBadge');

const updateStatusBadge = () => {
    if (!statusBadge) return;

    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Jakarta',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    }).formatToParts(new Date());

    const map = {};
    parts.forEach((p) => { map[p.type] = p.value; });

    const isWeekend = map.weekday === 'Sat' || map.weekday === 'Sun';
    const minutesNow = parseInt(map.hour, 10) * 60 + parseInt(map.minute, 10);

    // Buka Senin-Jumat (8-21) dan Sabtu-Minggu (8-22)
    const openAt = 8 * 60; // 08.00
    const closeAt = isWeekend ? 22 * 60 : 21 * 60; // 22.00 Sabtu-Minggu, 21.00 Senin-Jumat

    const isOpen = minutesNow >= openAt && minutesNow < closeAt;

    statusBadge.textContent = isOpen ? 'Buka Sekarang' : 'Tutup';
    statusBadge.classList.toggle('open', isOpen);
    statusBadge.classList.toggle('closed', !isOpen);
};

updateStatusBadge();
setInterval(updateStatusBadge, 60000); // ngcek ulang tiap 1 menit

// SCROLL REVEAL: munculkan elemen .reveal saat masuk layar, sembunyikan lagi saat keluar
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        entry.target.classList.toggle('show', entry.isIntersecting);         // toggle('show', kondisi): tambah class kalau true, lepas kalau false
    });
}, {
    threshold: 0.15,
    rootMargin: '0px 0px -8% 0px' // picu sedikit sebelum elemen menyentuh tepi bawah layar
});

revealEls.forEach((el) => revealObserver.observe(el));

// ==========================================
// RENDER MENU LANDING PAGE DARI localStorage ato data dari Admin
// ==========================================
(function renderMenuFromAdmin() {

    const STORAGE_KEY = 'lamak-bana-menu-data';

    // false = tampilin semua menu yang website ON
    // true  = hanya menu yg website ON dan Menu Andalan
    const SHOW_ONLY_FEATURED = false;

    const grid = document.querySelector('.menu-section .menu-grid');
    if (!grid) return;

    // Kembalikan null kalo admin belom pernah nyimpen data
    function getAdminMenuData() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved === null) return null;
            const data = JSON.parse(saved);
            return Array.isArray(data) ? data : null;
        } catch (error) {
            console.warn('Gagal membaca menu admin:', error);
            return null;
        }
    }

    function formatRupiah(value) {
        return 'Rp' + Number(value || 0).toLocaleString('id-ID');
    }

    function createMenuCard(menu) {
        const card = document.createElement('div');
        card.className = 'menu-card reveal';
        card.dataset.menuId = menu.id || '';

        const imgWrap = document.createElement('div');
        imgWrap.className = 'card-img-wrapper';

        if (menu.featured) {
            const badge = document.createElement('span');
            badge.className = 'badge-terlaris';
            badge.textContent = '★ Terlaris';
            imgWrap.appendChild(badge);
        }

        const foto = document.createElement('div');
        foto.className = 'foto-placeholder';
        foto.textContent = 'FOTO';
        imgWrap.appendChild(foto);

        const body = document.createElement('div');
        body.className = 'card-body';

        const row = document.createElement('div');
        row.className = 'card-title-row';

        const title = document.createElement('h3');
        title.className = 'menu-card-title';
        title.textContent = String(menu.name || '').toUpperCase();

        const price = document.createElement('span');
        price.className = 'menu-card-price';
        price.textContent = formatRupiah(menu.price);

        row.appendChild(title);
        row.appendChild(price);

        const desc = document.createElement('p');
        desc.className = 'menu-card-desc';
        desc.textContent = menu.desc || '';

        const btn = document.createElement('a');
        btn.className = 'btn-solid-red';
        btn.href = '#';
        btn.textContent = 'Pesan';
        btn.dataset.menuId = menu.id || '';

        // kalo stok habis ato ga tersedia,maka → tombol dimatikan
        if (menu.available === false || Number(menu.stock) <= 0) {
            btn.textContent = 'Habis';
            btn.classList.add('is-disabled');
            btn.setAttribute('aria-disabled', 'true');
        }

        body.appendChild(row);
        body.appendChild(desc);
        body.appendChild(btn);

        card.appendChild(imgWrap);
        card.appendChild(body);
        return card;
    }

    function renderMenuCards() {
        const menuData = getAdminMenuData();

        // admin belum pernah nyimpen apa pun, maka pakai kartu HTML asli
        if (menuData === null) return;

        const visible = menuData.filter(function (menu) {
            if (menu.website === false) return false;
            if (SHOW_ONLY_FEATURED && !menu.featured) return false;
            return true;
        });

        grid.innerHTML = '';

        if (!visible.length) {
            const empty = document.createElement('p');
            empty.className = 'menu-card-desc';
            empty.style.gridColumn = '1 / -1';
            empty.style.color = 'var(--cream)';
            empty.style.textAlign = 'center';
            empty.textContent = 'Menu sedang diperbarui. Silakan cek kembali sebentar lagi.';
            grid.appendChild(empty);
            return;
        }

        visible.forEach(function (menu) {
            const card = createMenuCard(menu);
            grid.appendChild(card);
            // wajib daftarin  ke observer, kalo gak kartu tetap opacity 0
            revealObserver.observe(card);
        });
    }

    renderMenuCards();

    // ngupdate otomatis kalo admin ngubah data di tab lain
    window.addEventListener('storage', function (event) {
        if (event.key === STORAGE_KEY) {
            renderMenuCards();
        }
    });

})();

// ==========================================
// PESAN DARI LANDING PAGE KE PESANAN ADMIN (localStorage)
// ==========================================
(function orderFromLanding() {

    const MENU_KEY  = 'lamak-bana-menu-data';
    const ORDER_KEY = 'lamak-bana-order-data';

    const modal   = document.getElementById('orderModal');
    const form    = document.getElementById('orderForm');
    const grid    = document.querySelector('.menu-section .menu-grid');
    if (!modal || !form || !grid) return;

    const itemsWrap = document.getElementById('orderItems');
    const totalEl   = document.getElementById('orderTotal');
    const errorEl   = document.getElementById('orderError');
    const formView  = document.getElementById('orderFormView');
    const doneView  = document.getElementById('orderDoneView');
    const doneId    = document.getElementById('orderDoneId');
    const channelEl = document.getElementById('orderChannel');
    const infoWrap  = document.getElementById('orderInfoWrap');

    let menuOptions = [];

    function formatRupiah(value) {
        return 'Rp' + Number(value || 0).toLocaleString('id-ID');
    }

    function cleanText(value, max) {
        // buang <> supaya gajadi HTML di dashboard admin
        return String(value || '').replace(/[<>]/g, '').trim().slice(0, max);
    }

    function toTitleCase(text) {
        return String(text).toLowerCase().replace(/(^|\s)\S/g, function (c) { return c.toUpperCase(); });
    }

    // daftar menu yang boleh dipesan
    // prioritasnya data admin. kalo belum ada dia ambil dari kartu HTML.
    function loadMenuOptions() {
        let data = null;
        try {
            const saved = localStorage.getItem(MENU_KEY);
            if (saved !== null) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) data = parsed;
            }
        } catch (e) { data = null; }

        if (data) {
            return data.filter(function (m) {
                return m.website !== false && m.available !== false && Number(m.stock) > 0;
            }).map(function (m) {
                return { id: String(m.id), name: String(m.name), price: Number(m.price) || 0 };
            });
        }

        return Array.from(document.querySelectorAll('.menu-section .menu-card')).map(function (card) {
            const name  = toTitleCase(card.querySelector('.menu-card-title').textContent.trim());
            const price = Number(card.querySelector('.menu-card-price').textContent.replace(/\D/g, '')) || 0;
            return { id: name, name: name, price: price };
        });
    }

    function findOption(id) {
        return menuOptions.find(function (m) { return m.id === id; });
    }

    function addItemRow(selectedId, qty) {
        const row = document.createElement('div');
        row.className = 'order-item-row';

        const select = document.createElement('select');
        select.className = 'order-item-menu';
        select.setAttribute('aria-label', 'Pilih menu');
        menuOptions.forEach(function (m) {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = m.name + ' — ' + formatRupiah(m.price);
            if (m.id === selectedId) opt.selected = true;
            select.appendChild(opt);
        });

        const qtyInput = document.createElement('input');
        qtyInput.type = 'number';
        qtyInput.className = 'order-item-qty';
        qtyInput.min = '1';
        qtyInput.max = '50';
        qtyInput.value = String(qty || 1);
        qtyInput.setAttribute('aria-label', 'Jumlah');

        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'order-item-remove';
        remove.setAttribute('aria-label', 'Hapus baris menu');
        remove.textContent = '×';

        row.appendChild(select);
        row.appendChild(qtyInput);
        row.appendChild(remove);
        itemsWrap.appendChild(row);
    }

    function readItems() {
        const items = [];
        itemsWrap.querySelectorAll('.order-item-row').forEach(function (row) {
            const menu = findOption(row.querySelector('.order-item-menu').value);
            const qty  = Math.min(50, Math.max(1, parseInt(row.querySelector('.order-item-qty').value, 10) || 1));
            if (menu) items.push({ menu: menu, qty: qty });
        });
        return items;
    }

    function updateTotal() {
        const total = readItems().reduce(function (sum, it) { return sum + it.menu.price * it.qty; }, 0);
        totalEl.textContent = formatRupiah(total);
    }

    function showError(message) {
        errorEl.textContent = message;
        errorEl.hidden = !message;
    }

    function toggleInfoField() {
        infoWrap.hidden = channelEl.value !== 'Makan di Tempat';
    }

    function openModal(menuId, menuName) {
        menuOptions = loadMenuOptions();
        if (!menuOptions.length) {
            alert('Maaf, belum ada menu yang tersedia untuk dipesan.');
            return;
        }

        form.reset();
        itemsWrap.innerHTML = '';
        showError('');

        const target = String(menuName || '').toLowerCase().trim();
        const preselect = menuOptions.find(function (m) {
            return (menuId && m.id === menuId) || m.name.toLowerCase() === target;
        });
        addItemRow(preselect ? preselect.id : menuOptions[0].id, 1);

        toggleInfoField();
        updateTotal();
        formView.hidden = false;
        doneView.hidden = true;

        modal.classList.add('open');
        document.body.classList.add('modal-open');
        document.getElementById('orderCustomer').focus();
    }

    function closeModal() {
        modal.classList.remove('open');
        document.body.classList.remove('modal-open');
    }

    // format ID dan waktu sama persis dengan admin (generateOrderId, currentOrderDateParts)
    function generateOrderId(orders) {
        let max = 0;
        orders.forEach(function (o) {
            const match = String(o.id || '').match(/(\d+)$/);
            if (match) max = Math.max(max, Number(match[1]) || 0);
        });
        const now = new Date();
        const yy = String(now.getFullYear()).slice(-2);
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        return '#LB-' + yy + mm + '-' + String(max + 1).padStart(3, '0');
    }

    function submitOrder() {
        const customer = cleanText(document.getElementById('orderCustomer').value, 60);
        const phone    = cleanText(document.getElementById('orderPhone').value, 20);
        const channel  = channelEl.value;
        const info     = cleanText(document.getElementById('orderInfo').value, 40);
        const note     = cleanText(document.getElementById('orderNote').value, 200);
        const items    = readItems();

        if (!customer) { showError('Nama wajib diisi.'); return; }
        if (!/^[0-9+\-\s]{8,20}$/.test(phone)) { showError('Nomor telepon tidak valid.'); return; }
        if (!items.length) { showError('Pilih minimal satu menu.'); return; }
        showError('');

        let orders = [];
        try {
            const saved = localStorage.getItem(ORDER_KEY);
            const parsed = saved ? JSON.parse(saved) : [];
            if (Array.isArray(parsed)) orders = parsed;
        } catch (e) { orders = []; }

        const now  = new Date();
        const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
        const date = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
        const total = items.reduce(function (sum, it) { return sum + it.menu.price * it.qty; }, 0);
        const id = generateOrderId(orders);

        const order = {
            id: id,
            customer: customer,
            phone: phone,
            items: items.map(function (it) { return [it.menu.name, it.qty, formatRupiah(it.menu.price)]; }),
            summary: items.map(function (it) { return it.menu.name + ' ×' + it.qty; }).join(', '),
            channel: channel,
            channelInfo: channel === 'Makan di Tempat' ? (info || 'Meja belum ditentukan') : '-',
            time: time,
            date: date,
            total: formatRupiah(total),
            subtotal: formatRupiah(total),
            discount: 'Rp0',
            status: 'Baru',
            payment: 'Bayar di Tempat',
            paymentStatus: 'BELUM DIBAYAR',
            note: note || 'Tidak ada catatan khusus.',
            timeline: [[time, 'Pesanan diterima']],
            source: 'Website'
        };

        orders.unshift(order);

        try {
            localStorage.setItem(ORDER_KEY, JSON.stringify(orders));
        } catch (e) {
            showError('Pesanan gagal disimpan di browser ini. Coba lagi.');
            return;
        }

        doneId.textContent = id;
        formView.hidden = true;
        doneView.hidden = false;
    }

    // klik pesan di kartu menu (delegasi berlaku buat kartu hasil render JS)
    grid.addEventListener('click', function (event) {
        const btn = event.target.closest('.btn-solid-red');
        if (!btn) return;
        event.preventDefault();
        if (btn.classList.contains('is-disabled')) return;

        const card  = btn.closest('.menu-card');
        const title = card ? card.querySelector('.menu-card-title') : null;
        openModal(btn.dataset.menuId, title ? title.textContent : '');
    });

    document.getElementById('orderAddItem').addEventListener('click', function () {
        addItemRow(menuOptions[0].id, 1);
        updateTotal();
    });

    itemsWrap.addEventListener('click', function (event) {
        if (!event.target.classList.contains('order-item-remove')) return;
        if (itemsWrap.querySelectorAll('.order-item-row').length <= 1) {
            showError('Minimal satu menu harus dipilih.');
            return;
        }
        event.target.closest('.order-item-row').remove();
        updateTotal();
    });

    itemsWrap.addEventListener('input', updateTotal);
    itemsWrap.addEventListener('change', updateTotal);
    channelEl.addEventListener('change', toggleInfoField);

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        submitOrder();
    });

    document.getElementById('orderModalClose').addEventListener('click', closeModal);
    document.getElementById('orderDoneClose').addEventListener('click', closeModal);
    modal.addEventListener('click', function (event) {
        if (event.target === modal) closeModal();
    });
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });

})();

// ==========================================
// RESERVASI DARI LANDING PAGE KE RESERVASI ADMIN (localStorage)
// ==========================================
(function reservationFromLanding() {

    const RESERVATION_KEY = 'lamak-bana-reservation-data';
    const SETTINGS_KEY    = 'lamak-bana-settings';
    const AREAS = ['Ruang Utama', 'Area Jendela', 'Area Keluarga', 'Private Room'];

    const modal = document.getElementById('reservationModal');
    const form  = document.getElementById('reservationForm');
    if (!modal || !form) return;

    const formView = document.getElementById('reservationFormView');
    const doneView = document.getElementById('resDoneView');
    const doneId   = document.getElementById('resDoneId');
    const errorEl  = document.getElementById('resError');

    const nameEl     = document.getElementById('resCustomer');
    const phoneEl    = document.getElementById('resPhone');
    const dateEl     = document.getElementById('resDate');
    const timeEl     = document.getElementById('resTime');
    const paxEl      = document.getElementById('resPax');
    const areaEl     = document.getElementById('resArea');
    const occasionEl = document.getElementById('resOccasion');
    const noteEl     = document.getElementById('resNote');

    function pad(n) { return String(n).padStart(2, '0'); }

    function todayISO() {
        const d = new Date();
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    }

    function nowHHMM() {
        const d = new Date();
        return pad(d.getHours()) + ':' + pad(d.getMinutes());
    }

    function cleanText(value, max) {
        // buang <> supaya gak jadi HTML di dashboard admin
        return String(value || '').replace(/[<>]/g, '').trim().slice(0, max);
    }

    function showError(message) {
        errorEl.textContent = message;
        errorEl.hidden = !message;
    }

    // jam buka mengikuti Pengaturan admin (default sama dengan SETTINGS_DEFAULT di admin)
    function getOpeningHours(dateIso) {
        let s = {};
        try { s = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; } catch (e) { s = {}; }

        const p = dateIso.split('-').map(Number);
        const day = new Date(p[0], p[1] - 1, p[2]).getDay();
        const weekend = day === 0 || day === 6;

        return weekend
            ? { open: s.weekendOpen || '08:00', close: s.weekendClose || '23:00' }
            : { open: s.weekdayOpen || '09:00', close: s.weekdayClose || '22:00' };
    }

    function readReservations() {
        try {
            const saved = localStorage.getItem(RESERVATION_KEY);
            const parsed = saved ? JSON.parse(saved) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    // format ID sama dengan admin: #RS-yymm-nnn (nomor lanjut dari angka terbesar)
    function generateReservationId(list) {
        let max = 0;
        list.forEach(function (r) {
            const match = String(r.id || '').match(/(\d+)$/);
            if (match) max = Math.max(max, Number(match[1]) || 0);
        });
        const now = new Date();
        const yy = String(now.getFullYear()).slice(-2);
        const mm = pad(now.getMonth() + 1);
        return '#RS-' + yy + mm + '-' + String(max + 1).padStart(3, '0');
    }

    function openModal() {
        form.reset();
        showError('');

        const today = todayISO();
        dateEl.min = today;
        dateEl.value = today;
        timeEl.value = '12:00';
        paxEl.value = '2';

        formView.hidden = false;
        doneView.hidden = true;

        modal.classList.add('open');
        document.body.classList.add('modal-open');
        nameEl.focus();
    }

    function closeModal() {
        modal.classList.remove('open');
        document.body.classList.remove('modal-open');
    }

    function submitReservation() {
        const customer = cleanText(nameEl.value, 60);
        const phone    = cleanText(phoneEl.value, 20);
        const date     = dateEl.value;
        const time     = timeEl.value;
        const pax      = parseInt(paxEl.value, 10);
        const area     = AREAS.indexOf(areaEl.value) !== -1 ? areaEl.value : AREAS[0];
        const occasion = cleanText(occasionEl.value, 60);
        const note     = cleanText(noteEl.value, 220);

        if (!customer) { showError('Nama wajib diisi.'); return; }
        if (!/^[0-9+\-\s]{8,20}$/.test(phone)) { showError('Nomor WhatsApp tidak valid.'); return; }
        if (!date) { showError('Tanggal wajib diisi.'); return; }
        if (date < todayISO()) { showError('Tanggal reservasi tidak boleh sudah lewat.'); return; }
        if (!time) { showError('Jam wajib diisi.'); return; }

        const hours = getOpeningHours(date);
        if (time < hours.open || time > hours.close) {
            showError('Jam reservasi harus antara ' + hours.open + ' dan ' + hours.close + ' pada hari tersebut.');
            return;
        }
        if (date === todayISO() && time <= nowHHMM()) {
            showError('Jam reservasi hari ini harus lebih dari jam sekarang.');
            return;
        }
        if (!pax || pax < 1 || pax > 30) { showError('Jumlah tamu 1 sampai 30 orang.'); return; }
        showError('');

        const list = readReservations();
        const id = generateReservationId(list);

        const now = new Date();
        const createdAt = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
            + ' · ' + nowHHMM();

        // struktur sama persis dengan RESERVATION_DATA di admin
        list.push({
            id: id,
            customer: customer,
            phone: phone,
            date: date,
            time: time,
            pax: pax,
            table: '',
            area: area,
            source: 'Website',
            status: 'Menunggu',
            occasion: occasion || 'Reservasi meja',
            note: note || 'Tidak ada catatan khusus.',
            createdAt: createdAt
        });

        try {
            localStorage.setItem(RESERVATION_KEY, JSON.stringify(list));
        } catch (e) {
            showError('Reservasi gagal disimpan di browser ini. Coba lagi.');
            return;
        }

        doneId.textContent = id;
        formView.hidden = true;
        doneView.hidden = false;
    }

    document.querySelectorAll('[data-open-reservation]').forEach(function (el) {
        el.addEventListener('click', function (event) {
            event.preventDefault();
            openModal();
        });
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        submitReservation();
    });

    document.getElementById('reservationModalClose').addEventListener('click', closeModal);
    document.getElementById('resDoneClose').addEventListener('click', closeModal);
    modal.addEventListener('click', function (event) {
        if (event.target === modal) closeModal();
    });
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });

})();

// ==========================================
// RENDER PROMO LANDING PAGE DARI localStorage (data dari Admin)
// ==========================================
(function renderPromoFromAdmin() {

    const PROMO_KEY = 'lamak-bana-promo-data';
    const MAX_PROMO = 3;

    const grid = document.querySelector('.promo-section .promo-grid');
    if (!grid) return;
    const colLeft  = grid.querySelector('.promo-col-left');
    const colRight = grid.querySelector('.promo-col-right');
    if (!colLeft || !colRight) return;

    // gaya tiap slot kartu (urutan sama dengan desain awal)
    const SLOTS = [
        { col: 'left',  card: 'card-yellow', title: 'text-black', btn: 'btn btn-red',     badge: 'badge-red',                   circle: 'circle-small', desc: false },
        { col: 'left',  card: 'card-red',    title: 'text-light', btn: 'btn btn-outline', badge: 'badge-white',                 circle: 'circle-small', desc: false },
        { col: 'right', card: 'card-green',  title: 'text-light', btn: 'btn btn-red',     badge: 'badge-white badge-top-right', circle: 'circle-large', desc: true  }
    ];

    function todayISO() {
        const d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    // null kalau admin belum pernah menyimpan data promo
    function getAdminPromoData() {
        try {
            const saved = localStorage.getItem(PROMO_KEY);
            if (saved === null) return null;
            const data = JSON.parse(saved);
            return Array.isArray(data) ? data : null;
        } catch (error) {
            console.warn('Gagal membaca promo admin:', error);
            return null;
        }
    }

    // sama dengan promoStatus() di admin: Aktif = aktif + periode mencakup hari ini
    function isRunning(promo, today) {
        if (promo.active === false || promo.website === false) return false;
        if (promo.start && promo.start > today) return false;
        if (promo.end && promo.end < today) return false;
        return true;
    }

    function badgeLines(promo) {
        const value = String(promo.value || '').trim();
        if (promo.type === 'Diskon Persen') return value ? ['HEMAT', value] : ['HEMAT'];
        if (promo.type === 'Gratis Ongkir') return ['GRATIS'];
        if (promo.type === 'Harga Spesial') return value ? ['HANYA', value] : ['PROMO'];
        return value ? ['PROMO', value] : ['PROMO'];
    }

    function createPromoCard(promo, slot) {
        const card = document.createElement('div');
        card.className = 'promo-card ' + slot.card + ' reveal';
        card.dataset.promoId = promo.id || '';

        const content = document.createElement('div');
        content.className = 'card-content';

        const title = document.createElement('h3');
        title.className = 'card-title ' + slot.title;
        title.textContent = String(promo.name || '').toUpperCase();
        content.appendChild(title);

        if (slot.desc && promo.desc) {
            const desc = document.createElement('p');
            desc.className = 'card-desc text-light';
            desc.textContent = promo.desc;
            content.appendChild(desc);
        }

        const btn = document.createElement('a');
        btn.className = slot.btn;
        btn.href = '#menu';
        btn.textContent = 'Pesan Sekarang';
        content.appendChild(btn);

        const badge = document.createElement('div');
        badge.className = 'card-badge ' + slot.badge;
        badgeLines(promo).forEach(function (line, i) {
            if (i > 0) badge.appendChild(document.createElement('br'));
            badge.appendChild(document.createTextNode(line));
        });

        const circle = document.createElement('div');
        circle.className = 'card-circle ' + slot.circle;
        const span = document.createElement('span');
        span.textContent = 'FOTO';
        circle.appendChild(span);

        card.appendChild(content);
        card.appendChild(badge);
        card.appendChild(circle);
        return card;
    }

    function renderPromoCards() {
        const data = getAdminPromoData();

        // admin belum pernah menyimpan apa pun, pakai kartu HTML asli
        if (data === null) return;

        const today = todayISO();
        let shown = data.filter(function (p) { return isRunning(p, today); }).slice(0, MAX_PROMO);

        // Gratis Ongkir ditaruh di kartu hijau besar kalau ada 3 promo
        if (shown.length === MAX_PROMO) {
            const idx = shown.findIndex(function (p) { return p.type === 'Gratis Ongkir'; });
            if (idx !== -1) shown.push(shown.splice(idx, 1)[0]);
        }

        colLeft.innerHTML = '';
        colRight.innerHTML = '';

        if (!shown.length) {
            grid.style.gridTemplateColumns = '1fr';
            const empty = document.createElement('p');
            empty.className = 'promo-subtitle';
            empty.style.textAlign = 'center';
            empty.textContent = 'Belum ada promo aktif saat ini. Cek kembali sebentar lagi.';
            colLeft.appendChild(empty);
            return;
        }

        shown.forEach(function (promo, i) {
            const slot = SLOTS[i];
            const card = createPromoCard(promo, slot);
            (slot.col === 'left' ? colLeft : colRight).appendChild(card);
            // wajib didaftarkan ke observer, kalau tidak kartu tetap opacity 0
            revealObserver.observe(card);
        });

        // kolom kanan kosong (kurang dari 3 promo), kolom kiri dibuat selebar penuh
        grid.style.gridTemplateColumns = colRight.children.length ? '' : '1fr';
    }

    renderPromoCards();

    // update otomatis kalau admin mengubah promo di tab lain
    window.addEventListener('storage', function (event) {
        if (event.key === PROMO_KEY) renderPromoCards();
    });

})();

// ==========================================
// HERO: foto di lingkaran berganti otomatis
// ==========================================
(function heroPhotoRotator() {

    const INTERVAL = 5000;  // ganti foto tiap 5 detik
    const STAGGER  = 1500;  // jeda antar lingkaran (kiri → tengah → kanan)
    const FADE     = 900;   // lama transisi pudar (samakan dengan CSS)

    // slide pertama = foto asli di CSS; sisanya foto cadangan
    const CONFIG = [
        { sel: '.circle-left', slides: [
            { src: 'images/hero/rendang.jpg',      size: 'cover', pos: 'center',  label: 'Rendang daging sapi dalam mangkuk kayu, ditaburi irisan cabai merah' },
            { src: 'images/menu/dendengbalado.jpg', size: 'cover', pos: 'center',  label: 'Dendeng balado' },
            { src: 'images/menu/gulaitunjang.jpg',  size: 'cover', pos: 'center',  label: 'Gulai tunjang' }
        ]},
        { sel: '.circle-center', slides: [
            { src: 'images/hero/nasipadang.jpg',    size: '110%',  pos: 'center',  label: 'Sepiring nasi Padang dengan rendang, daun singkong, dan sambal' },
            { src: 'images/menu/gulaiikan.jpg',     size: 'cover', pos: 'center',  label: 'Gulai ikan' },
            { src: 'images/menu/telurbalado.jpg',   size: 'cover', pos: 'center',  label: 'Telur balado' }
        ]},
        { sel: '.circle-right', slides: [
            { src: 'images/hero/ayampop.jpg',       size: 'cover', pos: '30% center', label: 'Ayam pop dengan sambal oranye di atas daun pisang' },
            { src: 'images/menu/ayambakar.jpg',     size: 'cover', pos: 'center',  label: 'Ayam bakar' },
            { src: 'images/menu/perkedel.jpg',      size: 'cover', pos: 'center',  label: 'Perkedel' }
        ]}
    ];

    // pengguna yang mematikan animasi: biarkan foto diam
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    function makeLayer(slide) {
        const layer = document.createElement('div');
        layer.className = 'hero-layer';
        layer.style.backgroundImage = "url('" + slide.src + "')";
        layer.style.backgroundSize = slide.size;
        layer.style.backgroundPosition = slide.pos;
        return layer;
    }

    CONFIG.forEach(function (cfg, index) {
        const circle = document.querySelector(cfg.sel);
        if (!circle) return;

        // muat semua foto di awal supaya tidak berkedip saat ganti
        cfg.slides.forEach(function (s) { const img = new Image(); img.src = s.src; });

        let current = 0;
        let activeLayer = makeLayer(cfg.slides[0]);
        activeLayer.classList.add('is-active');
        circle.appendChild(activeLayer);

        function showNext() {
            if (document.hidden) return; // tab tidak terlihat, jangan ganti

            current = (current + 1) % cfg.slides.length;
            const slide = cfg.slides[current];

            const incoming = makeLayer(slide);
            circle.appendChild(incoming);
            void incoming.offsetWidth;            // paksa reflow supaya transisi jalan
            incoming.classList.add('is-active');
            circle.setAttribute('aria-label', slide.label);

            const outgoing = activeLayer;
            activeLayer = incoming;
            setTimeout(function () { outgoing.remove(); }, FADE + 100);
        }

        // mulai dengan jeda berbeda tiap lingkaran
        setTimeout(function () {
            setInterval(showNext, INTERVAL);
        }, index * STAGGER);
    });

})();