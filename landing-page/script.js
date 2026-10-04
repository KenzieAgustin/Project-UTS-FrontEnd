// KATEGORI: klik untuk pindah item aktif 
const kategoriItems = document.querySelectorAll('.kategori-item');
document.documentElement.classList.add('js');

kategoriItems.forEach((item) => {
    item.addEventListener('click', () => {
        kategoriItems.forEach((i) => i.classList.remove('active'));
        item.classList.add('active');
    });
});

// KATEGORI data dari admin, pop up info singkat
// Data diatur di Admin Dashboard > Menu Makanan > Kategori Landing Page
(function kategoriFromAdmin() {

    const KATEGORI_KEY = 'lamak-bana-kategori-data';
    const MENU_KEY     = 'lamak-bana-menu-data';

    const KATEGORI_DEFAULT = [
        { id: 'KAT-001', name: 'Rendang',        image: 'images/menu/rendang.jpg',       desc: 'Daging sapi dimasak perlahan dengan santan dan rempah sampai bumbunya kering dan meresap.', taste: 'Gurih, Rempah kuat',  spicy: 1, menuId: 'MN-001', menuName: 'Rendang Daging', visible: true },
        { id: 'KAT-002', name: 'Dendeng Balado', image: 'images/menu/dendengbalado.jpg', desc: 'Irisan daging sapi tipis digoreng kering lalu dibalut sambal cabai merah.',                taste: 'Pedas, Renyah',       spicy: 2, menuId: '',       menuName: '',               visible: true },
        { id: 'KAT-003', name: 'Gulai Tunjang',  image: 'images/menu/gulaitunjang.jpg',  desc: 'Kikil sapi kenyal dalam kuah gulai kuning kental yang kaya rempah.',                        taste: 'Gurih, Berkuah',      spicy: 1, menuId: 'MN-004', menuName: 'Gulai Tunjang',  visible: true },
        { id: 'KAT-004', name: 'Gulai Ikan',     image: 'images/menu/gulaiikan.jpg',     desc: 'Ikan segar dimasak dalam kuah santan kuning dengan sedikit asam kandis.',                   taste: 'Gurih, Sedikit asam', spicy: 1, menuId: 'MN-005', menuName: 'Gulai Ikan',     visible: true },
        { id: 'KAT-005', name: 'Telur Balado',   image: 'images/menu/telurbalado.jpg',   desc: 'Telur rebus digoreng sebentar lalu disiram sambal balado merah.',                           taste: 'Pedas manis',         spicy: 2, menuId: 'MN-006', menuName: 'Telur Balado',   visible: true },
        { id: 'KAT-006', name: 'Perkedel',       image: 'images/menu/perkedel.jpg',      desc: 'Kentang tumbuk berbumbu, dicelup telur, lalu digoreng sampai keemasan.',                    taste: 'Gurih, Lembut',       spicy: 0, menuId: 'MN-007', menuName: 'Perkedel',       visible: true },
        { id: 'KAT-007', name: 'Ayam Bakar',     image: 'images/menu/ayambakar.jpg',     desc: 'Ayam berbumbu kuning dibakar di atas arang sampai harum.',                                  taste: 'Gurih, Smoky',        spicy: 1, menuId: 'MN-008', menuName: 'Ayam Bakar',     visible: true }
    ];

    const SPICY_LABEL = ['Tidak pedas', 'Sedikit pedas', 'Pedas', 'Sangat pedas'];

    const list = document.querySelector('.kategori-list');
    if (!list) return;

    let data = [];
    let lastTrigger = null;

    /* helper */
    function loadKategori() {
        try {
            const saved = localStorage.getItem(KATEGORI_KEY);
            const parsed = saved ? JSON.parse(saved) : null;
            if (Array.isArray(parsed)) return parsed;
        } catch (e) { /* pakai default */ }
        return KATEGORI_DEFAULT;
    }

    function formatRupiah(value) {
        return 'Rp' + Number(value || 0).toLocaleString('id-ID');
    }

    function cssUrl(src) {
        return 'url("' + String(src).replace(/["\\\n\r]/g, '') + '")';
    }

    // cari menu terkait data admin dulu (harga & stok terbaru), kalau belum ada pakai kartu HTML
    function findMenu(k) {
        if (!k.menuId && !k.menuName) return null;

        try {
            const menus = JSON.parse(localStorage.getItem(MENU_KEY));
            if (Array.isArray(menus)) {
                const m = menus.find(function (x) { return x.id === k.menuId; });
                if (!m || m.website === false) return null;
                return {
                    id: m.id,
                    name: m.name,
                    price: Number(m.price) || 0,
                    available: m.available !== false && Number(m.stock) > 0
                };
            }
        } catch (e) { /* lanjut ke kartu HTML */ }

        const target = String(k.menuName || '').toLowerCase();
        const card = Array.from(document.querySelectorAll('.menu-section .menu-card')).find(function (c) {
            const t = c.querySelector('.menu-card-title');
            return t && t.textContent.trim().toLowerCase() === target;
        });
        if (!card) return null;
        return {
            id: '',
            name: k.menuName,
            price: Number(card.querySelector('.menu-card-price').textContent.replace(/\D/g, '')) || 0,
            available: true
        };
    }

    /* daftar kategori */
    function render() {
        data = loadKategori().filter(function (k) { return k.visible !== false && k.name; });
        list.innerHTML = '';

        if (!data.length) {
            const empty = document.createElement('p');
            empty.className = 'kategori-desc kategori-empty';
            empty.textContent = 'Kategori sedang diperbarui.';
            list.appendChild(empty);
            return;
        }

        data.forEach(function (k, i) {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'kategori-item' + (i === 0 ? ' active' : '');
            item.dataset.kategoriId = k.id;
            item.setAttribute('aria-haspopup', 'dialog');
            item.setAttribute('aria-label', 'Lihat info ' + k.name);

            const box = document.createElement('span');
            box.className = 'kategori-box';
            box.setAttribute('aria-hidden', 'true');
            if (k.image) box.style.backgroundImage = cssUrl(k.image);
            else {
                box.classList.add('kategori-box-initial');
                box.textContent = String(k.name).charAt(0).toUpperCase();
            }

            const name = document.createElement('span');
            name.className = 'kategori-name';
            name.textContent = k.name;

            item.appendChild(box);
            item.appendChild(name);
            list.appendChild(item);
        });
    }

    /* pop up */
    const modal = document.createElement('div');
    modal.className = 'order-modal kategori-modal';
    modal.id = 'kategoriModal';
    modal.innerHTML =
        '<div class="order-modal-panel kategori-modal-panel" role="dialog" aria-modal="true" aria-labelledby="kategoriModalTitle">' +
            '<div class="kategori-modal-photo" id="kategoriModalPhoto">' +
                '<button type="button" class="order-modal-close kategori-modal-close" id="kategoriModalClose" aria-label="Tutup">&times;</button>' +
            '</div>' +
            '<div class="kategori-modal-body">' +
                '<h3 class="order-modal-title" id="kategoriModalTitle"></h3>' +
                '<div class="kategori-modal-tags" id="kategoriModalTags"></div>' +
                '<p class="kategori-modal-desc" id="kategoriModalDesc"></p>' +
                '<div class="kategori-modal-footer" id="kategoriModalFooter"></div>' +
            '</div>' +
        '</div>';
    document.body.appendChild(modal);

    const photoEl  = document.getElementById('kategoriModalPhoto');
    const titleEl  = document.getElementById('kategoriModalTitle');
    const tagsEl   = document.getElementById('kategoriModalTags');
    const descEl   = document.getElementById('kategoriModalDesc');
    const footerEl = document.getElementById('kategoriModalFooter');
    const closeBtn = document.getElementById('kategoriModalClose');

    function addTag(text, extraClass) {
        const tag = document.createElement('span');
        tag.className = 'kategori-tag' + (extraClass ? ' ' + extraClass : '');
        tag.textContent = text;
        tagsEl.appendChild(tag);
    }

    function openModal(k) {
        titleEl.textContent = String(k.name).toUpperCase();
        descEl.textContent = k.desc || '';

        photoEl.style.backgroundImage = k.image ? cssUrl(k.image) : '';
        photoEl.classList.toggle('no-photo', !k.image);

        // tag: level pedas + rasa
        tagsEl.innerHTML = '';
        const spicy = Math.min(3, Math.max(0, Number(k.spicy) || 0));
        addTag((spicy ? '🌶'.repeat(spicy) + ' ' : '') + SPICY_LABEL[spicy], 'kategori-tag-spicy');
        String(k.taste || '').split(',').map(function (t) { return t.trim(); }).filter(Boolean).forEach(function (t) {
            addTag(t);
        });

        // harga + tombol pesan dari menu terkait
        footerEl.innerHTML = '';
        const menu = findMenu(k);
        const btn = document.createElement('a');
        btn.className = 'btn-solid-red';

        if (menu) {
            const price = document.createElement('div');
            price.className = 'kategori-modal-price';
            price.innerHTML = '<small></small><strong></strong>';
            price.querySelector('small').textContent = menu.name;
            price.querySelector('strong').textContent = formatRupiah(menu.price);
            footerEl.appendChild(price);

            btn.href = '#menu';
            if (menu.available) {
                btn.textContent = 'Pesan Sekarang';
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    closeModal(true);
                    if (typeof window.lamakOpenOrder === 'function') window.lamakOpenOrder(menu.id, menu.name);
                    else document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
                });
            } else {
                btn.textContent = 'Sedang Habis';
                btn.classList.add('is-disabled');
                btn.setAttribute('aria-disabled', 'true');
            }
        } else {
            btn.href = '#menu';
            btn.textContent = 'Lihat Menu';
            btn.addEventListener('click', function () { closeModal(true); });
        }
        footerEl.appendChild(btn);

        modal.classList.add('open');
        document.body.classList.add('modal-open');
        closeBtn.focus();
    }

    // keepScroll = true kalau langsung lanjut ke modal lain / scroll ke menu
    function closeModal(keepScroll) {
        modal.classList.remove('open');
        document.body.classList.remove('modal-open');
        if (!keepScroll && lastTrigger) lastTrigger.focus();
    }

    /* event */
    list.addEventListener('click', function (event) {
        const item = event.target.closest('.kategori-item');
        if (!item) return;

        list.querySelectorAll('.kategori-item').forEach(function (i) { i.classList.remove('active'); });
        item.classList.add('active');

        const k = data.find(function (x) { return x.id === item.dataset.kategoriId; });
        if (!k) return;
        lastTrigger = item;
        openModal(k);
    });

    closeBtn.addEventListener('click', function () { closeModal(); });
    modal.addEventListener('click', function (event) {
        if (event.target === modal) closeModal();
    });
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });

    render();

    // update otomatis kalau admin mengubah kategori/menu di tab lain
    window.addEventListener('storage', function (event) {
        if (event.key === KATEGORI_KEY) render();
    });

})();

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

    // jumlah menu yang tampil sebelum tombol "Lihat Semua Menu" diklik
    const HIGHLIGHT_COUNT = 3;

    const section = document.querySelector('.menu-section');
    const grid = document.querySelector('.menu-section .menu-grid');
    const toggleBtn = document.getElementById('menuToggleAll');
    if (!grid) return;

    let showAll = false;

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

    // 3 Menu Andalan tampil duluan, sisanya disembunyikan sampai "Lihat Semua Menu" diklik
    function sortForDisplay(list) {
        const featured = list.filter(function (m) { return m.featured; }).slice(0, HIGHLIGHT_COUNT);
        const rest = list.filter(function (m) { return featured.indexOf(m) === -1; });
        // belum ada Menu Andalan sama sekali -> pakai urutan biasa
        return featured.length ? featured.concat(rest) : list;
    }

    function applyToggle() {
        const cards = grid.querySelectorAll('.menu-card');
        cards.forEach(function (card, i) {
            card.classList.toggle('menu-card-extra', i >= HIGHLIGHT_COUNT);
        });
        grid.classList.toggle('show-all', showAll);

        if (toggleBtn) {
            toggleBtn.hidden = cards.length <= HIGHLIGHT_COUNT;
            toggleBtn.textContent = showAll ? 'Tampilkan Lebih Sedikit' : 'Lihat Semua Menu';
            toggleBtn.setAttribute('aria-expanded', String(showAll));
        }
    }

    function renderMenuCards() {
        const menuData = getAdminMenuData();

        // admin belum pernah nyimpen apa pun, maka pakai kartu HTML asli
        if (menuData === null) {
            applyToggle();
            return;
        }

        const visible = sortForDisplay(menuData.filter(function (menu) {
            return menu.website !== false;
        }));

        grid.innerHTML = '';

        if (!visible.length) {
            const empty = document.createElement('p');
            empty.className = 'menu-card-desc';
            empty.style.gridColumn = '1 / -1';
            empty.style.color = 'var(--cream)';
            empty.style.textAlign = 'center';
            empty.textContent = 'Menu sedang diperbarui. Silakan cek kembali sebentar lagi.';
            grid.appendChild(empty);
            applyToggle();
            return;
        }

        visible.forEach(function (menu) {
            const card = createMenuCard(menu);
            grid.appendChild(card);
            // wajib daftarin  ke observer, kalo gak kartu tetap opacity 0
            revealObserver.observe(card);
        });

        applyToggle();
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', function (event) {
            event.preventDefault();
            showAll = !showAll;
            applyToggle();
            // waktu ditutup, balik ke atas section supaya pengunjung gak "nyasar" di bawah
            if (!showAll && section) section.scrollIntoView({ behavior: 'smooth' });
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
    let activePromo = null; // promo yang sedang dipakai (dari tombol di section Promo)

    // "20%" -> 20. Hanya tipe Diskon Persen yang dihitung otomatis
    function promoPercent(promo) {
        if (!promo || promo.type !== 'Diskon Persen') return 0;
        const n = parseFloat(String(promo.value || '').replace(',', '.'));
        return n > 0 && n <= 90 ? n : 0;
    }

    function calcTotals(items) {
        const subtotal = items.reduce(function (sum, it) { return sum + it.menu.price * it.qty; }, 0);
        const discount = Math.round(subtotal * promoPercent(activePromo) / 100);
        return { subtotal: subtotal, discount: discount, total: subtotal - discount };
    }

    function renderPromoBanner() {
        const banner = document.getElementById('orderPromoBanner');
        if (!banner) return;
        if (!activePromo) { banner.hidden = true; banner.textContent = ''; return; }

        const pct = promoPercent(activePromo);
        const info = pct
            ? 'Diskon ' + pct + '% otomatis dipotong dari total.'
            : 'Harga promo ' + (activePromo.value || '') + ' dikonfirmasi kasir saat pembayaran.';

        banner.innerHTML = '';
        const strong = document.createElement('strong');
        strong.textContent = 'Promo: ' + activePromo.name;
        const small = document.createElement('small');
        small.textContent = info;
        banner.appendChild(strong);
        banner.appendChild(small);
        banner.hidden = false;
    }

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
        const t = calcTotals(readItems());
        totalEl.textContent = formatRupiah(t.total);

        const row = document.getElementById('orderDiscountRow');
        if (row) {
            row.hidden = !t.discount;
            document.getElementById('orderDiscountLabel').textContent = 'Diskon ' + (activePromo ? activePromo.name : 'promo');
            document.getElementById('orderDiscount').textContent = '-' + formatRupiah(t.discount);
        }
    }

    function showError(message) {
        errorEl.textContent = message;
        errorEl.hidden = !message;
    }

    function toggleInfoField() {
        infoWrap.hidden = channelEl.value !== 'Makan di Tempat';
    }

    function openModal(menuId, menuName, promo) {
        activePromo = promo || null;
        menuOptions = loadMenuOptions();
        if (!menuOptions.length) {
            alert('Maaf, belum ada menu yang tersedia untuk dipesan.');
            return;
        }

        form.reset();
        itemsWrap.innerHTML = '';
        showError('');

        const target = String(menuName || '').toLowerCase().trim();
        let preselect = menuOptions.find(function (m) {
            return (menuId && m.id === menuId) || m.name.toLowerCase() === target;
        });

        // dari promo pilih menu yang namanya disebut di judul promo (mis. "Nasi Rendang" -> Rendang Daging)
        if (!preselect && activePromo) {
            const promoName = String(activePromo.name || '').toLowerCase();
            preselect = menuOptions.find(function (m) {
                return m.name.toLowerCase().split(/\s+/).some(function (word) {
                    return word.length > 3 && promoName.indexOf(word) !== -1;
                });
            });
        }
        addItemRow(preselect ? preselect.id : menuOptions[0].id, 1);
        renderPromoBanner();

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
        const totals = calcTotals(items);
        const total = totals.total;
        const id = generateOrderId(orders);
        const promoNote = activePromo ? 'Promo: ' + activePromo.name + (activePromo.value ? ' (' + activePromo.value + ')' : '') + '. ' : '';

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
            subtotal: formatRupiah(totals.subtotal),
            discount: formatRupiah(totals.discount),
            promo: activePromo ? activePromo.name : '',
            status: 'Baru',
            payment: 'Bayar di Tempat',
            paymentStatus: 'BELUM DIBAYAR',
            note: (promoNote + (note || '')).trim() || 'Tidak ada catatan khusus.',
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

    // dipakai tombol di section Promo
    window.lamakOpenOrder = openModal;

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
// PESAN KATERING DARI LANDING PAGE KE KATERING ADMIN (localStorage)
// ==========================================
(function cateringFromLanding() {

    const CATERING_KEY = 'lamak-bana-catering-data';

    // nilai harus sama dengan pilihan <select> di editor katering admin
    const EVENTS   = ['Acara Kantor', 'Pernikahan', 'Arisan & Syukuran', 'Lainnya'];
    const SERVICES = {
        'Nasi Kotak': {
            minPax: 20,
            packages: [
                { name: 'Nasi Kotak Ayam Pop',           price: 30000, desc: 'Nasi, ayam pop, sayur nangka, sambal ijo, kerupuk.' },
                { name: 'Nasi Kotak Rendang Komplit',    price: 35000, desc: 'Nasi, rendang daging, sayur nangka, sambal ijo, kerupuk.' },
                { name: 'Nasi Kotak Dendeng',            price: 35000, desc: 'Nasi, dendeng balado, daun singkong, sambal, kerupuk.' },
                { name: 'Nasi Kotak Rendang + Ayam Pop', price: 36000, desc: 'Dua lauk: rendang dan ayam pop, plus sayur dan sambal.' }
            ]
        },
        'Prasmanan': {
            minPax: 30,
            packages: [
                { name: 'Paket Prasmanan Minang A', price: 80000, desc: '4 lauk, 2 sayur, sambal, kerupuk, air mineral.' },
                { name: 'Paket Prasmanan Keluarga', price: 90000, desc: '5 lauk termasuk rendang & gulai, 2 sayur, dessert.' },
                { name: 'Paket Pernikahan Minang',  price: 90000, desc: '6 lauk pilihan, 2 sayur, dessert, gubukan teh talua.' }
            ]
        }
    };
    const MAX_PAX       = 1000;
    const MIN_LEAD_DAYS = 3;        // pesan paling cepat H-3
    const OPEN_TIME     = '07:00';  // jam antar paling pagi
    const CLOSE_TIME    = '20:00';  // jam antar paling malam

    const modal = document.getElementById('cateringModal');
    const form  = document.getElementById('cateringForm');
    if (!modal || !form) return;

    const formView = document.getElementById('cateringFormView');
    const doneView = document.getElementById('catDoneView');
    const doneId   = document.getElementById('catDoneId');
    const doneSum  = document.getElementById('catDoneSummary');
    const errorEl  = document.getElementById('catError');

    const picEl      = document.getElementById('catPic');
    const phoneEl    = document.getElementById('catPhone');
    const companyEl  = document.getElementById('catCompany');
    const eventEl    = document.getElementById('catEvent');
    const paxEl      = document.getElementById('catPax');
    const paxHintEl  = document.getElementById('catPaxHint');
    const dateEl     = document.getElementById('catDate');
    const timeEl     = document.getElementById('catTime');
    const addressEl  = document.getElementById('catAddress');
    const packageEl  = document.getElementById('catPackage');
    const packDescEl = document.getElementById('catPackageDesc');
    const noteEl     = document.getElementById('catNote');
    const estimateEl = document.getElementById('catEstimate');
    const estDetail  = document.getElementById('catEstimateDetail');
    const serviceEls = form.querySelectorAll('input[name="catService"]');

    function pad(n) { return String(n).padStart(2, '0'); }

    function toISO(d) {
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    }

    function minDateISO() {
        const d = new Date();
        d.setDate(d.getDate() + MIN_LEAD_DAYS);
        return toISO(d);
    }

    function formatRupiah(value) {
        return 'Rp' + Number(value || 0).toLocaleString('id-ID');
    }

    function cleanText(value, max) {
        // buang <> supaya gak jadi HTML di dashboard admin
        return String(value || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
    }

    function showError(message) {
        errorEl.textContent = message;
        errorEl.hidden = !message;
    }

    function currentService() {
        const checked = form.querySelector('input[name="catService"]:checked');
        return checked && SERVICES[checked.value] ? checked.value : 'Nasi Kotak';
    }

    function currentPackage() {
        const list = SERVICES[currentService()].packages;
        return list.find(function (p) { return p.name === packageEl.value; }) || list[0];
    }

    // isi ulang pilihan paket sesuai layanan yang dipilih
    function renderPackages() {
        const service = SERVICES[currentService()];
        packageEl.innerHTML = '';
        service.packages.forEach(function (p) {
            const opt = document.createElement('option');
            opt.value = p.name;
            opt.textContent = p.name + ' — ' + formatRupiah(p.price) + '/porsi';
            packageEl.appendChild(opt);
        });

        paxEl.min = String(service.minPax);
        paxHintEl.textContent = 'Minimal ' + service.minPax + ' porsi';
        if ((parseInt(paxEl.value, 10) || 0) < service.minPax) paxEl.value = String(service.minPax);

        updatePackageInfo();
    }

    function updatePackageInfo() {
        const pack = currentPackage();
        packDescEl.textContent = pack.desc;

        const pax = parseInt(paxEl.value, 10) || 0;
        estDetail.textContent = pax + ' porsi × ' + formatRupiah(pack.price);
        estimateEl.textContent = formatRupiah(pax * pack.price);
    }

    function readCatering() {
        try {
            const saved = localStorage.getItem(CATERING_KEY);
            const parsed = saved ? JSON.parse(saved) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    // format ID sama dengan admin: #KT-yymm-nnn (nomor lanjut dari angka terbesar)
    function generateCateringId(list) {
        let max = 0;
        list.forEach(function (c) {
            const match = String(c.id || '').match(/(\d+)$/);
            if (match) max = Math.max(max, Number(match[1]) || 0);
        });
        const now = new Date();
        return '#KT-' + String(now.getFullYear()).slice(-2) + pad(now.getMonth() + 1) + '-' + String(max + 1).padStart(3, '0');
    }

    function openModal(presetEvent) {
        form.reset();
        showError('');

        const minDate = minDateISO();
        dateEl.min = minDate;
        dateEl.value = minDate;
        timeEl.min = OPEN_TIME;
        timeEl.max = CLOSE_TIME;
        timeEl.value = '11:00';
        paxEl.max = String(MAX_PAX);

        if (presetEvent && EVENTS.indexOf(presetEvent) !== -1) eventEl.value = presetEvent;
        // pernikahan biasanya prasmanan
        if (eventEl.value === 'Pernikahan') {
            form.querySelector('input[name="catService"][value="Prasmanan"]').checked = true;
        }

        renderPackages();

        formView.hidden = false;
        doneView.hidden = true;

        modal.classList.add('open');
        document.body.classList.add('modal-open');
        picEl.focus();
    }

    function closeModal() {
        modal.classList.remove('open');
        document.body.classList.remove('modal-open');
    }

    function submitCatering() {
        const pic      = cleanText(picEl.value, 60);
        const phone    = cleanText(phoneEl.value, 20);
        const company  = cleanText(companyEl.value, 60);
        const event    = EVENTS.indexOf(eventEl.value) !== -1 ? eventEl.value : 'Lainnya';
        const service  = currentService();
        const pack     = currentPackage();
        const pax      = parseInt(paxEl.value, 10);
        const date     = dateEl.value;
        const time     = timeEl.value;
        const address  = cleanText(addressEl.value, 200);
        const note     = cleanText(noteEl.value, 300);
        const minPax   = SERVICES[service].minPax;

        if (!pic) { showError('Nama pemesan wajib diisi.'); picEl.focus(); return; }
        if (!/^[0-9+\-\s]{8,20}$/.test(phone)) { showError('Nomor WhatsApp tidak valid.'); phoneEl.focus(); return; }
        if (!pax || pax < minPax || pax > MAX_PAX) {
            showError('Jumlah porsi ' + service + ' antara ' + minPax + ' sampai ' + MAX_PAX + '.');
            paxEl.focus();
            return;
        }
        if (!date) { showError('Tanggal acara wajib diisi.'); dateEl.focus(); return; }
        if (date < minDateISO()) {
            showError('Katering perlu dipesan paling cepat ' + MIN_LEAD_DAYS + ' hari sebelum acara.');
            dateEl.focus();
            return;
        }
        if (!time) { showError('Jam makanan tiba wajib diisi.'); timeEl.focus(); return; }
        if (time < OPEN_TIME || time > CLOSE_TIME) {
            showError('Jam makanan tiba harus antara ' + OPEN_TIME + ' dan ' + CLOSE_TIME + '.');
            timeEl.focus();
            return;
        }
        if (address.length < 10) { showError('Alamat lokasi acara wajib diisi dengan lengkap.'); addressEl.focus(); return; }
        showError('');

        const list = readCatering();
        const id = generateCateringId(list);
        const total = pax * pack.price;

        const now = new Date();
        const createdAt = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
            + ' · ' + pad(now.getHours()) + ':' + pad(now.getMinutes());

        // struktur sama persis dengan CATERING_DATA di admin
        list.push({
            id: id,
            customer: company || pic,
            pic: pic,
            phone: phone,
            date: date,
            time: time,
            pax: pax,
            event: event,
            service: service,
            package: pack.name,
            address: address,
            total: total,          // estimasi, admin bisa ubah saat kirim penawaran
            dp: 0,
            source: 'Website',
            status: 'Menunggu',
            note: note || 'Tidak ada catatan khusus.',
            createdAt: createdAt
        });

        try {
            localStorage.setItem(CATERING_KEY, JSON.stringify(list));
        } catch (e) {
            showError('Pesanan katering gagal disimpan di browser ini. Coba lagi.');
            return;
        }

        doneId.textContent = id;
        doneSum.textContent = service + ' · ' + pack.name + ' · ' + pax + ' porsi · estimasi ' + formatRupiah(total);
        formView.hidden = true;
        doneView.hidden = false;
    }

    // tombol "Pesan Katering" + kartu katering (Pernikahan / Acara Kantor / Arisan)
    document.querySelectorAll('[data-open-catering]').forEach(function (el) {
        el.addEventListener('click', function (event) {
            event.preventDefault();
            openModal(el.dataset.cateringEvent || '');
        });
    });

    serviceEls.forEach(function (el) { el.addEventListener('change', renderPackages); });
    packageEl.addEventListener('change', updatePackageInfo);
    // pesan error hilang begitu pengguna mulai memperbaiki isian
    form.addEventListener('input', function () { if (!errorEl.hidden) showError(''); });
    paxEl.addEventListener('input', updatePackageInfo);

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        submitCatering();
    });

    document.getElementById('cateringModalClose').addEventListener('click', closeModal);
    document.getElementById('catDoneClose').addEventListener('click', closeModal);
    modal.addEventListener('click', function (event) {
        if (event.target === modal) closeModal();
    });
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });

})();

// ==========================================
// TOMBOL "PESAN SEKARANG" DI SECTION PROMO
// ==========================================
(function promoButtons() {

    const PROMO_KEY = 'lamak-bana-promo-data';
    const WA_NUMBER = '6281234567890';

    const grid = document.querySelector('.promo-section .promo-grid');
    if (!grid) return;

    // ambil data promo: dari admin (pakai data-promo-id) atau dari atribut kartu HTML awal
    function getPromo(card) {
        const id = card.dataset.promoId;
        if (id) {
            try {
                const list = JSON.parse(localStorage.getItem(PROMO_KEY)) || [];
                const found = list.find(function (p) { return p.id === id; });
                if (found) return found;
            } catch (e) { /* lanjut ke atribut */ }
        }
        const title = card.querySelector('.card-title');
        return {
            name:  card.dataset.promoName || (title ? title.textContent.trim() : 'Promo'),
            type:  card.dataset.promoType || '',
            value: card.dataset.promoValue || ''
        };
    }

    // delegasi: tetap jalan untuk kartu yang dirender ulang dari data admin
    grid.addEventListener('click', function (event) {
        const btn = event.target.closest('.card-content .btn');
        if (!btn) return;
        event.preventDefault();

        const card = btn.closest('.promo-card');
        if (!card) return;
        const promo = getPromo(card);

        // Gratis Ongkir = pesan antar, website belum punya pengantaran -> lanjut ke WhatsApp
        if (promo.type === 'Gratis Ongkir') {
            const text = 'Halo Lamak Bana, saya mau pesan antar dengan promo ' + promo.name
                + (promo.value ? ' (' + promo.value + ')' : '') + '.\n\nNama: \nAlamat: \nPesanan: ';
            window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
            return;
        }

        // Diskon Persen / Harga Spesial -> buka form Pesan Menu dengan promo terpasang
        if (typeof window.lamakOpenOrder === 'function') {
            window.lamakOpenOrder('', '', promo);
        } else {
            document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
        }
    });

})();
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

// ==========================================
// HERO: judul kata per kata + parallax kursor
// ==========================================
(function heroMotion() {
    const hero  = document.querySelector('.hero');
    const title = document.querySelector('.hero-title');
    if (!hero || !title) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // bungkus tiap kata supaya muncul bergantian
    let i = 0;
    title.setAttribute('aria-label', title.textContent.replace(/\s+/g, ' ').trim());

    Array.from(title.childNodes).forEach(function (node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const frag = document.createDocumentFragment();
            node.textContent.split(/(\s+)/).forEach(function (tok) {
                if (!tok) return;
                if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
                const w = document.createElement('span');
                w.className = 'hero-word';
                w.style.setProperty('--i', i++);
                w.textContent = tok;
                frag.appendChild(w);
            });
            title.replaceChild(frag, node);
        } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'BR') {
            const w = document.createElement('span');   // kata "HATI"
            w.className = 'hero-word';
            w.style.setProperty('--i', i++);
            title.insertBefore(w, node);
            w.appendChild(node);
        }
    });
    title.classList.add('title-split');

    // parallax mengikuti kursor (hanya perangkat dengan mouse)
    if (!window.matchMedia('(hover: hover)').matches) return;

    let raf = null, x = 0, y = 0;
    hero.addEventListener('mousemove', function (e) {
        const r = hero.getBoundingClientRect();
        x = ((e.clientX - r.left) / r.width)  * 2 - 1;
        y = ((e.clientY - r.top)  / r.height) * 2 - 1;
        if (raf) return;
        raf = requestAnimationFrame(function () {
            hero.style.setProperty('--mx', x.toFixed(3));
            hero.style.setProperty('--my', y.toFixed(3));
            raf = null;
        });
    });
    hero.addEventListener('mouseleave', function () {
        hero.style.setProperty('--mx', 0);
        hero.style.setProperty('--my', 0);
    });
})();