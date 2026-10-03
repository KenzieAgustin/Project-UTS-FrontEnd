$(function () {

  // Frontend-only admin access gate for the UTS demo.
  // This is not production-grade authentication.
  const ADMIN_AUTH_KEY = 'lamak-bana-admin-auth';

  if (localStorage.getItem(ADMIN_AUTH_KEY) !== 'true') {
    window.location.replace('../security-check/index.html');
    return;
  }

  /* ---------------- Data ---------------- */
  const NAV_UTAMA = [
    ['Dashboard', 'layout-dashboard'], ['Pesanan', 'receipt'], ['Menu Makanan', 'utensils'],
    ['Reservasi', 'calendar-days'], ['Katering', 'store'], ['Laporan', 'bar-chart-3'],
  ];
  const NAV_LAINNYA = [['Promo', 'tag'], ['Bantuan', 'help-circle'], ['Pengaturan', 'settings']];

  const STATUS_STYLE = {
    Baru:       { bg: 'rgba(139,30,30,.09)', color: '#8b1e1e' },
    Diproses:   { bg: 'rgba(242,169,59,.20)', color: '#7a5200' },
    Siap:       { bg: 'rgba(54,95,145,.10)', color: '#365f91' },
    Selesai:    { bg: 'rgba(47,93,58,.12)', color: '#2f5d3a' },
    Dibatalkan: { bg: 'rgba(180,35,24,.09)', color: '#b42318' },
  };

  async function loadMenuFromDatabase(){

    try{

        const response = await fetch(
            "http://localhost:3000/api/menu"
        );

        const data = await response.json();


        MENU_DATA = data.map(item => ({

            id: "MN-" + String(item.id).padStart(3,"0"),

            name:item.name,

            category:item.category,

            price:item.price,

            stock:item.stock,

            available:item.status === "tersedia",

            website:true,

            featured:false,

            desc:item.description,

            tone:"rendang"

        }));


        renderMenuPage();


    }catch(error){

        console.error(
            "Gagal mengambil data menu",
            error
        );

    }

}

  const ORDER_DATA_DEFAULT = [
    {
      id:'#LB-2609-019', customer:'Siti Rahma', phone:'0812-8765-4321',
      items:[['Rendang Daging',2,'Rp28.000'],['Nasi Putih',2,'Rp8.000'],['Es Teh Manis',1,'Rp7.000']],
      summary:'Rendang Daging ×2, Nasi Putih ×2', channel:'Makan di Tempat', channelInfo:'Meja 08',
      time:'12:48', date:'28 Sep 2026', total:'Rp79.000', subtotal:'Rp79.000', discount:'Rp0',
      status:'Baru', payment:'QRIS', paymentStatus:'LUNAS', note:'Sambalnya dipisah.',
      timeline:[['12:48','Pesanan diterima']]
    },
    {
      id:'#LB-2609-018', customer:'Rina Maharani', phone:'0813-2201-8890',
      items:[['Rendang Daging',2,'Rp28.000'],['Nasi Putih',2,'Rp8.000'],['Teh Tawar',1,'Rp6.000']],
      summary:'Rendang Daging ×2, Nasi Putih', channel:'Makan di Tempat', channelInfo:'Meja 04',
      time:'12:40', date:'28 Sep 2026', total:'Rp78.000', subtotal:'Rp78.000', discount:'Rp0',
      status:'Selesai', payment:'Tunai', paymentStatus:'LUNAS', note:'Tidak ada catatan.',
      timeline:[['12:40','Pesanan diterima'],['12:42','Pesanan diproses'],['12:57','Pesanan siap'],['13:03','Pesanan selesai']]
    },
    {
      id:'#LB-2609-017', customer:'Budi Santoso', phone:'0819-7743-2291',
      items:[['Ayam Pop',1,'Rp29.000'],['Es Teh Manis',1,'Rp7.000'],['Nasi Putih',1,'Rp5.000']],
      summary:'Ayam Pop ×1, Es Teh Manis', channel:'Ojek Online', channelInfo:'GoFood · GF-98112',
      time:'12:32', date:'28 Sep 2026', total:'Rp41.000', subtotal:'Rp41.000', discount:'Rp0',
      status:'Diproses', payment:'GoPay', paymentStatus:'LUNAS', note:'Tambahkan sambal hijau.',
      timeline:[['12:32','Pesanan diterima'],['12:34','Pesanan diproses']]
    },
    {
      id:'#LB-2609-016', customer:'PT Sinar Jaya', phone:'021-5567-8811',
      items:[['Nasi Kotak Rendang',40,'Rp35.000']],
      summary:'Nasi Kotak Rendang ×40', channel:'Katering', channelInfo:'Kirim 16:30 · Slipi, Jakarta Barat',
      time:'11:15', date:'28 Sep 2026', total:'Rp1.400.000', subtotal:'Rp1.400.000', discount:'Rp0',
      status:'Diproses', payment:'Transfer Bank', paymentStatus:'DP 50%', note:'PIC: Ibu Nadia. Mohon sertakan sendok, tisu, dan label perusahaan.',
      timeline:[['11:15','Pesanan diterima'],['11:22','Pesanan dikonfirmasi'],['11:40','Pesanan diproses']]
    },
    {
      id:'#LB-2609-015', customer:'Dewi Lestari', phone:'0821-4432-1178',
      items:[['Dendeng Batokok',1,'Rp31.000'],['Nasi Putih',1,'Rp5.000']],
      summary:'Dendeng Batokok ×1', channel:'Ojek Online', channelInfo:'GrabFood · GF-77190',
      time:'11:02', date:'28 Sep 2026', total:'Rp36.000', subtotal:'Rp36.000', discount:'Rp0',
      status:'Dibatalkan', payment:'OVO', paymentStatus:'REFUND', note:'Dibatalkan pelanggan sebelum diproses.',
      timeline:[['11:02','Pesanan diterima'],['11:05','Pesanan dibatalkan']]
    },
    {
      id:'#LB-2609-014', customer:'Andi Pratama', phone:'0857-9001-2266',
      items:[['Gulai Tunjang',2,'Rp27.000'],['Nasi Putih',2,'Rp5.000']],
      summary:'Gulai Tunjang ×2, Nasi Putih', channel:'Makan di Tempat', channelInfo:'Meja 11',
      time:'10:48', date:'28 Sep 2026', total:'Rp64.000', subtotal:'Rp64.000', discount:'Rp0',
      status:'Selesai', payment:'QRIS', paymentStatus:'LUNAS', note:'Tidak ada catatan.',
      timeline:[['10:48','Pesanan diterima'],['10:50','Pesanan diproses'],['11:06','Pesanan siap'],['11:10','Pesanan selesai']]
    },
    {
      id:'#LB-2609-013', customer:'Maya Putri', phone:'0812-3309-8712',
      items:[['Sate Padang',2,'Rp30.000'],['Es Jeruk',2,'Rp8.000']],
      summary:'Sate Padang ×2, Es Jeruk ×2', channel:'Makan di Tempat', channelInfo:'Meja 02',
      time:'10:32', date:'28 Sep 2026', total:'Rp76.000', subtotal:'Rp76.000', discount:'Rp0',
      status:'Siap', payment:'QRIS', paymentStatus:'LUNAS', note:'Kuah sate dipisah satu.',
      timeline:[['10:32','Pesanan diterima'],['10:35','Pesanan diproses'],['10:51','Pesanan siap']]
    },
    {
      id:'#LB-2609-012', customer:'Fajar Ramadhan', phone:'0817-2255-6631',
      items:[['Ayam Bakar Padang',1,'Rp32.000'],['Nasi Putih',1,'Rp5.000'],['Es Teh',1,'Rp7.000']],
      summary:'Ayam Bakar Padang ×1, Nasi', channel:'Ojek Online', channelInfo:'ShopeeFood · SF-46118',
      time:'10:18', date:'28 Sep 2026', total:'Rp44.000', subtotal:'Rp44.000', discount:'Rp0',
      status:'Baru', payment:'ShopeePay', paymentStatus:'LUNAS', note:'Tidak pedas.',
      timeline:[['10:18','Pesanan diterima']]
    }
  ];


  let ORDER_DATA = (function () {
    try {
      const saved = localStorage.getItem('lamak-bana-order-data');
      return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(ORDER_DATA_DEFAULT));
    } catch (e) {
      return JSON.parse(JSON.stringify(ORDER_DATA_DEFAULT));
    }
  })();

  function saveOrderData() {
    try {
      localStorage.setItem('lamak-bana-order-data', JSON.stringify(ORDER_DATA));
    } catch (e) {
      console.warn('Data pesanan tidak dapat disimpan di localStorage.', e);
    }
  }


  const MENU_DATA_DEFAULT = [
    { id:'MN-001', name:'Rendang Daging', category:'Daging', price:28000, stock:12, available:true, website:true, featured:true, tone:'rendang', desc:'Daging sapi dimasak 8 jam dengan santan dan rempah Minang.' },
    { id:'MN-002', name:'Ayam Pop', category:'Ayam', price:25000, stock:18, available:true, website:true, featured:true, tone:'ayam', desc:'Ayam kampung direbus bumbu lalu digoreng sebentar, lembut dan gurih.' },
    { id:'MN-003', name:'Dendeng Batokok', category:'Daging', price:30000, stock:9, available:true, website:true, featured:true, tone:'dendeng', desc:'Daging tipis dipukul, dibakar, lalu disiram sambal lado mudo.' },
    { id:'MN-004', name:'Gulai Tunjang', category:'Gulai', price:27000, stock:6, available:true, website:true, featured:false, tone:'gulai', desc:'Tunjang sapi empuk dengan kuah gulai Minang yang kaya rempah.' },
    { id:'MN-005', name:'Gulai Ikan', category:'Gulai', price:29000, stock:14, available:true, website:true, featured:false, tone:'ikan', desc:'Ikan dengan kuah gulai santan dan rempah segar khas Minang.' },
    { id:'MN-006', name:'Telur Balado', category:'Telur', price:15000, stock:20, available:true, website:true, featured:false, tone:'telur', desc:'Telur dengan balado merah pedas gurih khas rumah makan Minang.' },
    { id:'MN-007', name:'Perkedel', category:'Pendamping', price:10000, stock:7, available:true, website:true, featured:false, tone:'perkedel', desc:'Perkedel kentang lembut dengan bumbu sederhana dan gurih.' },
    { id:'MN-008', name:'Ayam Bakar', category:'Ayam', price:32000, stock:0, available:false, website:true, featured:false, tone:'bakar', desc:'Ayam bakar berbumbu Minang dengan aroma panggang yang kuat.' }
  ];

  let MENU_DATA = (function () {
    try {
      const saved = localStorage.getItem('lamak-bana-menu-data');
      return saved ? JSON.parse(saved) : MENU_DATA_DEFAULT.map(function (m) { return Object.assign({}, m); });
    } catch (e) {
      return MENU_DATA_DEFAULT.map(function (m) { return Object.assign({}, m); });
    }
  })();

  /* ---------------- Reservation data ---------------- */
  const RESERVATION_TODAY = '2026-09-28';
  const RESERVATION_STATUS_STYLE = {
    Menunggu:      { bg:'rgba(242,169,59,.20)', color:'#7a5200' },
    Dikonfirmasi:  { bg:'rgba(47,93,58,.12)', color:'#2f5d3a' },
    Hadir:         { bg:'rgba(38,95,135,.11)', color:'#265f87' },
    Selesai:       { bg:'rgba(59,31,20,.08)', color:'#3b1f14' },
    Dibatalkan:    { bg:'rgba(139,30,30,.10)', color:'#8b1e1e' },
  };

  const RESERVATION_DATA_DEFAULT = [
    { id:'#RS-2609-031', customer:'Nadia Putri', phone:'0812-8890-2214', date:'2026-09-28', time:'13:00', pax:8, table:'Meja 12', area:'Ruang Utama', source:'Website', status:'Menunggu', occasion:'Makan siang keluarga', note:'Mohon meja yang cukup lega dan dekat area depan.', createdAt:'28 Sep 2026 · 10:22' },
    { id:'#RS-2609-030', customer:'Dimas Pratama', phone:'0813-4401-6672', date:'2026-09-28', time:'11:30', pax:4, table:'Meja 04', area:'Area Jendela', source:'WhatsApp', status:'Dikonfirmasi', occasion:'Makan siang', note:'Satu kursi bayi jika tersedia.', createdAt:'28 Sep 2026 · 08:41' },
    { id:'#RS-2609-029', customer:'Rina Maharani', phone:'0813-2201-8890', date:'2026-09-28', time:'12:00', pax:2, table:'Meja 02', area:'Ruang Utama', source:'Website', status:'Hadir', occasion:'Makan siang', note:'Tidak ada catatan khusus.', createdAt:'27 Sep 2026 · 19:32' },
    { id:'#RS-2609-028', customer:'Keluarga Santoso', phone:'0819-7712-3030', date:'2026-09-28', time:'14:30', pax:6, table:'Meja 08', area:'Area Keluarga', source:'Telepon', status:'Dikonfirmasi', occasion:'Ulang tahun', note:'Mohon meja keluarga. Membawa kue sendiri.', createdAt:'27 Sep 2026 · 16:05' },
    { id:'#RS-2609-027', customer:'Maya Putri', phone:'0812-3309-8712', date:'2026-09-28', time:'18:30', pax:5, table:'Meja 10', area:'Area Jendela', source:'Website', status:'Menunggu', occasion:'Makan malam keluarga', note:'Preferensi area tidak terlalu dekat pintu masuk.', createdAt:'28 Sep 2026 · 09:54' },
    { id:'#RS-2609-026', customer:'Fajar Ramadhan', phone:'0817-2255-6631', date:'2026-09-28', time:'19:00', pax:3, table:'Meja 06', area:'Ruang Utama', source:'WhatsApp', status:'Menunggu', occasion:'Makan malam', note:'Tidak ada catatan khusus.', createdAt:'28 Sep 2026 · 09:17' },
    { id:'#RS-2609-025', customer:'Arief Wijaya', phone:'0856-9902-1872', date:'2026-09-28', time:'10:00', pax:2, table:'Meja 01', area:'Ruang Utama', source:'Admin', status:'Selesai', occasion:'Sarapan', note:'Walk-in dicatat oleh admin.', createdAt:'28 Sep 2026 · 09:51' },
    { id:'#RS-2609-024', customer:'Laila Hasan', phone:'0822-7188-4402', date:'2026-09-28', time:'20:00', pax:4, table:'Private 01', area:'Private Room', source:'Website', status:'Dikonfirmasi', occasion:'Makan malam', note:'Memerlukan area yang lebih tenang.', createdAt:'27 Sep 2026 · 21:12' },
    { id:'#RS-2609-023', customer:'Dewi Lestari', phone:'0821-4432-1178', date:'2026-09-28', time:'17:00', pax:2, table:'Meja 03', area:'Ruang Utama', source:'Website', status:'Dibatalkan', occasion:'Makan sore', note:'Dibatalkan pelanggan melalui WhatsApp.', createdAt:'27 Sep 2026 · 20:04' },
    { id:'#RS-2609-022', customer:'Sari Utami', phone:'0812-1170-2883', date:'2026-09-29', time:'12:00', pax:4, table:'Meja 05', area:'Ruang Utama', source:'Website', status:'Menunggu', occasion:'Makan siang', note:'Mohon dekat area jendela jika memungkinkan.', createdAt:'28 Sep 2026 · 08:33' },
    { id:'#RS-2609-021', customer:'Budi Hartono', phone:'0819-9220-1455', date:'2026-09-29', time:'19:30', pax:6, table:'Meja 09', area:'Area Keluarga', source:'WhatsApp', status:'Dikonfirmasi', occasion:'Makan keluarga', note:'Satu tamu lansia.', createdAt:'27 Sep 2026 · 15:48' },
    { id:'#RS-2609-020', customer:'Sarah Amelia', phone:'0813-5531-9022', date:'2026-09-30', time:'18:00', pax:4, table:'Meja 07', area:'Area Jendela', source:'Website', status:'Menunggu', occasion:'Makan malam', note:'Tidak ada catatan khusus.', createdAt:'28 Sep 2026 · 07:44' }
  ];

  let RESERVATION_DATA = (function () {
    try {
      const saved = localStorage.getItem('lamak-bana-reservation-data');
      return saved ? JSON.parse(saved) : RESERVATION_DATA_DEFAULT.map(function (r) { return Object.assign({}, r); });
    } catch (e) {
      return RESERVATION_DATA_DEFAULT.map(function (r) { return Object.assign({}, r); });
    }
  })();



  /* ---------------- Catering data ---------------- */
  const CATERING_TODAY = '2026-09-28';
  const CATERING_STATUS_STYLE = {
    Menunggu:     { bg:'rgba(242,169,59,.20)', color:'#7a5200' },
    Penawaran:    { bg:'rgba(139,30,30,.09)', color:'#8b1e1e' },
    Dikonfirmasi: { bg:'rgba(47,93,58,.12)', color:'#2f5d3a' },
    Produksi:     { bg:'rgba(38,95,135,.11)', color:'#265f87' },
    Selesai:      { bg:'rgba(59,31,20,.08)', color:'#3b1f14' },
    Dibatalkan:   { bg:'rgba(139,30,30,.10)', color:'#8b1e1e' },
  };

  const CATERING_DATA_DEFAULT = [
    { id:'#KT-2609-014', customer:'PT Sinar Jaya', pic:'Nadia Putri', phone:'0812-8890-2214', date:'2026-09-28', time:'16:30', pax:40, event:'Acara Kantor', service:'Nasi Kotak', package:'Nasi Kotak Rendang + Ayam Pop', address:'Slipi, Jakarta Barat', total:1400000, dp:700000, source:'WhatsApp', status:'Produksi', note:'Sertakan sendok, tisu, dan label perusahaan. Pengiriman maksimal 16.15.', createdAt:'27 Sep 2026 · 15:42' },
    { id:'#KT-2609-013', customer:'CV Minang Makmur', pic:'Rizky Ananda', phone:'0813-5570-1144', date:'2026-09-29', time:'10:00', pax:65, event:'Acara Kantor', service:'Prasmanan', package:'Paket Prasmanan Minang A', address:'Kebon Jeruk, Jakarta Barat', total:5200000, dp:2600000, source:'Website', status:'Dikonfirmasi', note:'Setup buffet pukul 08.30. Membutuhkan 2 meja buffet dan perlengkapan makan.', createdAt:'28 Sep 2026 · 08:12' },
    { id:'#KT-2609-012', customer:'Nadia & Arif', pic:'Nadia Putri', phone:'0821-7743-1188', date:'2026-10-04', time:'11:00', pax:150, event:'Pernikahan', service:'Prasmanan', package:'Paket Pernikahan Minang', address:'Gedung Serbaguna Palmerah, Jakarta Barat', total:13500000, dp:0, source:'Website', status:'Menunggu', note:'Meminta pilihan rendang, ayam pop, gulai ikan, sambal ijo, dan dessert. Masih menunggu survei lokasi.', createdAt:'28 Sep 2026 · 09:16' },
    { id:'#KT-2609-011', customer:'Keluarga Putri', pic:'Ibu Ratna', phone:'0817-2219-6670', date:'2026-09-30', time:'13:00', pax:30, event:'Arisan & Syukuran', service:'Nasi Kotak', package:'Nasi Kotak Rendang Komplit', address:'Tanjung Duren, Jakarta Barat', total:1050000, dp:0, source:'WhatsApp', status:'Penawaran', note:'Minta opsi harga untuk 30 dan 35 box. Sambal dipisah.', createdAt:'27 Sep 2026 · 18:02' },
    { id:'#KT-2609-010', customer:'PT Andalas Digital', pic:'Dewi Lestari', phone:'0812-4402-8813', date:'2026-10-01', time:'12:00', pax:100, event:'Acara Kantor', service:'Nasi Kotak', package:'Nasi Kotak Ayam Pop + Rendang', address:'Grogol Petamburan, Jakarta Barat', total:3600000, dp:1800000, source:'Telepon', status:'Dikonfirmasi', note:'Dikirim ke lobby kantor. Setiap box diberi label vegetarian/non-vegetarian jika ada.', createdAt:'26 Sep 2026 · 14:20' },
    { id:'#KT-2609-009', customer:'Bu Rina Maharani', pic:'Rina Maharani', phone:'0813-2201-8890', date:'2026-09-25', time:'11:30', pax:25, event:'Arisan & Syukuran', service:'Prasmanan', package:'Paket Prasmanan Keluarga', address:'Tomang, Jakarta Barat', total:2250000, dp:2250000, source:'Admin', status:'Selesai', note:'Acara selesai dan pembayaran lunas.', createdAt:'20 Sep 2026 · 10:15' },
    { id:'#KT-2609-008', customer:'Komunitas Minang Jaya', pic:'Fajar', phone:'0819-7302-1100', date:'2026-09-27', time:'18:00', pax:45, event:'Arisan & Syukuran', service:'Nasi Kotak', package:'Nasi Kotak Dendeng', address:'Kemanggisan, Jakarta Barat', total:1575000, dp:0, source:'Website', status:'Dibatalkan', note:'Dibatalkan pelanggan karena perubahan jadwal acara.', createdAt:'22 Sep 2026 · 12:04' }
  ];

  let CATERING_DATA = (function () {
    try {
      const saved = localStorage.getItem('lamak-bana-catering-data');
      return saved ? JSON.parse(saved) : CATERING_DATA_DEFAULT.map(function (c) { return Object.assign({}, c); });
    } catch (e) {
      return CATERING_DATA_DEFAULT.map(function (c) { return Object.assign({}, c); });
    }
  })();


  /* ---------------- Promo data ---------------- */
  const PROMO_TODAY = '2026-09-28';
  const PROMO_DATA_DEFAULT = [
    { id:'PR-001', name:'Paket Hemat Nasi Rendang', type:'Diskon Persen', value:'20%', start:'2026-09-23', end:'2026-10-04', active:true, website:true, desc:'Hemat 20% untuk paket nasi rendang pilihan.' },
    { id:'PR-002', name:'Gratis Ongkir', type:'Gratis Ongkir', value:'Min. Rp100rb', start:'2026-09-20', end:'2026-10-05', active:true, website:true, desc:'Gratis ongkir untuk pengantaran area Jakarta dengan minimum transaksi Rp100.000.' },
    { id:'PR-003', name:'Hidang Keluarga', type:'Diskon Persen', value:'30%', start:'2026-10-01', end:'2026-10-12', active:true, website:true, desc:'Hemat 30% untuk paket hidangan keluarga selama periode promo.' },
    { id:'PR-004', name:'Promo Akhir Pekan', type:'Harga Spesial', value:'Rp99.000', start:'2026-09-12', end:'2026-09-20', active:false, website:false, desc:'Paket pilihan akhir pekan dengan harga spesial.' }
  ];

  let PROMO_DATA = (function () {
    try {
      const saved = localStorage.getItem('lamak-bana-promo-data');
      return saved ? JSON.parse(saved) : PROMO_DATA_DEFAULT.map(function (x) { return Object.assign({}, x); });
    } catch (e) {
      return PROMO_DATA_DEFAULT.map(function (x) { return Object.assign({}, x); });
    }
  })();

  const DROPDOWN_OPTIONS = {
    status: ['Semua','Selesai','Diproses','Dibatalkan'],
    waktu:  ['Hari ini','7 hari terakhir','Bulan ini','Tahun ini'],
    tahun:  ['2026','2025','2024','2023'],
    'order-channel': ['Semua','Makan di Tempat','Ojek Online','Katering'],
    'order-date': ['Hari ini','7 hari','Bulan ini'],
    'menu-category': ['Semua','Daging','Ayam','Gulai','Telur','Pendamping'],
    'reservation-source': ['Semua','Website','WhatsApp','Telepon','Admin'],
    'reservation-date': ['Hari ini','Besok','7 hari','Semua Tanggal'],
    'catering-service': ['Semua','Nasi Kotak','Prasmanan'],
    'catering-date': ['Hari ini','7 hari','Bulan ini','Semua Tanggal'],
    'report-period': ['7 hari terakhir','Bulan ini','Tahun ini','Rentang tanggal'],
    'report-channel': ['Semua','Makan di Tempat','Ojek Online','Katering'],
  };

  const DROPDOWN_CONFIG = {
    status:          { scope: 'filters', field: 'status' },
    waktu:           { scope: 'filters', field: 'waktu' },
    tahun:           { scope: 'filters', field: 'tahun' },
    'order-channel': { scope: 'orderFilters', field: 'channel' },
    'order-date':    { scope: 'orderFilters', field: 'date' },
    'menu-category':  { scope: 'menuFilters', field: 'category' },
    'reservation-source': { scope: 'reservationFilters', field: 'source' },
    'reservation-date': { scope: 'reservationFilters', field: 'date' },
    'catering-service': { scope: 'cateringFilters', field: 'service' },
    'catering-date': { scope: 'cateringFilters', field: 'date' },
    'report-period': { scope: 'reportFilters', field: 'period' },
    'report-channel': { scope: 'reportFilters', field: 'channel' },
  };

  function dropdownLabel(key, value) {
    if (key === 'order-channel' && value === 'Semua') return 'Semua Kanal';
    if (key === 'order-date' && value === '7 hari') return '7 hari terakhir';
    if (key === 'menu-category' && value === 'Semua') return 'Semua Kategori';
    if (key === 'reservation-source' && value === 'Semua') return 'Semua Sumber';
    if (key === 'reservation-date' && value === '7 hari') return '7 hari ke depan';
    if (key === 'catering-service' && value === 'Semua') return 'Semua Layanan';
    if (key === 'catering-date' && value === '7 hari') return '7 hari ke depan';
    if (key === 'report-channel' && value === 'Semua') return 'Semua Kanal';
    return value;
  }

  const NOTIFICATIONS = [
    ['Pesanan baru masuk','#LB-2609-019 · Siti Rahma · Rp79.000','Baru saja','#8b1e1e'],
    ['Pesanan katering dikonfirmasi','PT Sinar Jaya menyetujui penawaran','8 mnt lalu','#2f5d3a'],
    ['Stok Rendang Daging menipis','Sisa 12 porsi untuk hari ini','26 mnt lalu','#f2a93b'],
    ['Ulasan baru diterima','Rina Maharani memberi rating ★ 5','1 jam lalu','#3b1f14'],
  ];


  const SETTINGS_DEFAULT = {
    adminName:'Admin Utama', adminRole:'Super Admin', adminEmail:'',
    storeName:'Lamak Bana', storePhone:'', storeCity:'Jakarta', storeAddress:'',
    weekdayOpen:'09:00', weekdayClose:'22:00', weekendOpen:'08:00', weekendClose:'23:00',
    notifOrder:true, notifReservation:true, notifCatering:true, notifStock:true
  };
  let SETTINGS_DATA = (function(){
    try {
      const saved=localStorage.getItem('lamak-bana-settings');
      return Object.assign({},SETTINGS_DEFAULT,saved?JSON.parse(saved):{});
    } catch(e) { return Object.assign({},SETTINGS_DEFAULT); }
  })();

  /* ---------------- State ---------------- */
  const state = {
    page: 'Dashboard',
    filters: { status: 'Semua', waktu: 'Hari ini', tahun: '2026' },
    orderFilters: { status: 'Semua', channel: 'Semua', date: 'Hari ini', search: '' },
    menuFilters: { category: 'Semua', search: '' },
    reservationFilters: { status:'Semua', source:'Semua', date:'Hari ini', search:'' },
    cateringFilters: { status:'Semua', service:'Semua', date:'7 hari', search:'' },
    reportFilters: { period:'Bulan ini', channel:'Semua', dateFrom:'2026-09-01', dateTo:'2026-09-28' },
    promoFilters: { status:'Semua' },
    openDropdown: null,
  };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Crossfade teks label saat nilainya berubah (animasi diulang dari awal).
  function swapLabel($el, text) {
    if (!$el.length || $el.text() === text) return;
    $el.text(text).removeClass('label-swap');
    void $el[0].offsetWidth; // paksa reflow supaya animasi mulai ulang
    $el.addClass('label-swap');
  }

  /* ---------------- Render: sidebar ---------------- */
  function navButton(label, icon) {
    const active = state.page === label;
    return $('<button>', {
        'data-nav': label,
        class: 'app-nav-item d-flex w-100 align-items-center u-gap-3 u-rounded-lg u-px-3 u-py-2 text-start u-text-sm fw-medium u-leading-5 u-transition-colors' + (active ? ' is-active' : ''),
      })
      .html('<i data-lucide="' + icon + '" class="u-size-5 flex-shrink-0"></i><span>' + label + '</span>');
  }

  function renderSidebar() {
    const $u = $('#nav-utama').empty();
    $.each(NAV_UTAMA, function (_, n) { $u.append(navButton(n[0], n[1])); });
    const $o = $('#nav-lainnya').empty();
    $.each(NAV_LAINNYA, function (_, n) { $o.append(navButton(n[0], n[1])); });
  }

  /* ---------------- Render: orders ---------------- */
  function renderOrders() {
    const $wrap = $('#orders').empty();
    $.each(ORDER_DATA.slice(0, 5), function (_, o) {
      const s = STATUS_STYLE[o.status] || STATUS_STYLE.Baru;
      $('<div>', { class: 'order-row d-flex w-100 u-cursor-pointer align-items-center u-gap-4 u-border-b u-border-solid border-soft u-px-4 u-py-3-5' })
        .html(
          '<p class="u-w-120px flex-shrink-0 u-text-sm fw-medium u-leading-5 u-text-ink">' + o.id + '</p>' +
          '<p class="u-w-150px flex-shrink-0 u-text-sm u-text-ink">' + o.customer + '</p>' +
          '<p class="u-min-w-0 u-flex-1 u-text-sm u-text-ink">' + o.summary + '</p>' +
          '<p class="u-w-130px flex-shrink-0 u-text-sm ink60">' + o.channel + '</p>' +
          '<p class="u-w-64px flex-shrink-0 u-text-sm ink60">' + o.time + '</p>' +
          '<p class="u-w-120px flex-shrink-0 text-end u-text-sm fw-medium u-leading-5 u-text-ink">' + o.total + '</p>' +
          '<div class="u-w-110px flex-shrink-0"><span class="d-inline-flex align-items-center rounded-pill u-px-2-5 u-py-0-5 u-text-xs fw-medium" style="background:' + s.bg + ';color:' + s.color + '">' + o.status + '</span></div>'
        )
        .appendTo($wrap);
    });
  }

  /* ---------------- Render: full orders page ---------------- */
  function statusBadge(status) {
    const s = STATUS_STYLE[status] || STATUS_STYLE.Baru;
    return '<span class="d-inline-flex align-items-center rounded-pill u-px-2-5 u-py-0-5 u-text-xs fw-medium" style="background:' + s.bg + ';color:' + s.color + '">' + status + '</span>';
  }

  function filteredOrders() {
    const f = state.orderFilters;
    const q = (f.search || '').trim().toLowerCase();
    return ORDER_DATA.filter(function (o) {
      const statusOk = f.status === 'Semua' || o.status === f.status;
      const channelOk = f.channel === 'Semua' || o.channel === f.channel;
      const text = [o.id,o.customer,o.summary,o.channel].join(' ').toLowerCase();
      return statusOk && channelOk && (!q || text.indexOf(q) !== -1);
    });
  }

  function renderOrderStats() {
    const count = ORDER_DATA.length;
    const baru = ORDER_DATA.filter(function (o) { return o.status === 'Baru'; }).length;
    const diproses = ORDER_DATA.filter(function (o) { return o.status === 'Diproses'; }).length;
    const siap = ORDER_DATA.filter(function (o) { return o.status === 'Siap'; }).length;
    const selesai = ORDER_DATA.filter(function (o) { return o.status === 'Selesai'; }).length;

    $('.summary-baru').text(baru);
    $('.summary-proses').text(diproses);
    $('.summary-siap').text(siap);
    $('.summary-selesai').text(selesai);

    $('#tab-semua-count').text(count);
    $('#tab-baru-count').text(baru);
    $('#tab-proses-count').text(diproses);
    $('#tab-siap-count').text(siap);
  }

  function renderFullOrders() {
    const data = filteredOrders();
    const $wrap = $('#orders-full').empty();
    if (!data.length) {
      $('<div>', { class:'order-empty' })
        .html('<i data-lucide="search-x" class="u-size-5"></i><p class="u-text-sm fw-medium u-text-ink">Pesanan tidak ditemukan</p><p class="u-text-xs ink60">Coba ubah kata pencarian atau filter.</p>')
        .appendTo($wrap);
    } else {
      $.each(data, function (_, o) {
        $('<div>', { class:'order-full-row', 'data-order-id':o.id, tabindex:'0', role:'button' })
          .html(
            '<p class="u-text-sm fw-medium u-text-ink">' + o.id + '</p>' +
            '<div><p class="u-text-sm u-text-ink">' + o.customer + '</p><p class="u-text-xs ink40">' + o.phone + '</p></div>' +
            '<p class="u-text-sm u-text-ink text-truncate">' + o.summary + '</p>' +
            '<p class="u-text-sm ink60">' + o.channel + '</p>' +
            '<p class="u-text-sm ink60">' + o.time + '</p>' +
            '<p class="u-text-sm fw-medium u-text-ink text-end">' + o.total + '</p>' +
            '<div>' + statusBadge(o.status) + '</div>' +
            '<button class="order-row-menu" aria-label="Buka detail ' + o.id + '"><i data-lucide="more-horizontal" class="u-size-4"></i></button>'
          )
          .appendTo($wrap);
      });
    }
    renderOrderStats();
    $('#orders-count').text('Menampilkan ' + data.length + ' dari ' + ORDER_DATA.length + ' pesanan');
    $('#order-tabs .order-tab').removeClass('is-active').filter('[data-status="' + state.orderFilters.status + '"]').addClass('is-active');
    lucide.createIcons();
  }

  function showToast(message) {
    $('.demo-toast').remove();
    const $t = $('<div>', { class:'demo-toast', text:message }).appendTo('body');
    setTimeout(function () { $t.fadeOut(180, function () { $(this).remove(); }); }, 2400);
  }

  function getOrder(id) {
    return ORDER_DATA.find(function (o) { return o.id === id; });
  }

  function orderStepIndex(status) {
    return { Baru:0, Diproses:1, Siap:2, Selesai:3 }[status] ?? -1;
  }

  function rupiahNumber(text) { return Number(String(text).replace(/[^0-9]/g, '')) || 0; }
  function rupiah(textNumber) { return 'Rp' + Number(textNumber).toLocaleString('id-ID'); }

  /* ---------------- Create: order ---------------- */
  function orderEditorMenuOptions(selected) {
    const menus = MENU_DATA.filter(function (m) { return m.available !== false && Number(m.stock) !== 0; });
    if (!menus.length) return '<option value="">Belum ada menu tersedia</option>';
    return '<option value="">Pilih menu...</option>' + menus.map(function (m) {
      const isSelected = m.id === selected ? ' selected' : '';
      return '<option value="' + resEsc(m.id) + '"' + isSelected + '>' + resEsc(m.name) + ' · ' + menuRupiah(m.price) + '</option>';
    }).join('');
  }

  function ensureOrderEditor() {
    if ($('#order-create-modal').length) return;
    const html = `
      <div id="order-create-modal" style="display:none;position:fixed;inset:0;z-index:2000;background:rgba(30,18,12,.42);padding:24px;overflow:auto;">
        <div id="order-create-panel" style="width:min(720px,100%);margin:5vh auto;background:#fff;border-radius:24px;border:1px solid rgba(59,31,20,.10);box-shadow:0 24px 70px rgba(59,31,20,.22);overflow:hidden;">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:22px 24px;border-bottom:1px solid rgba(59,31,20,.08);">
            <div><p style="margin:0;font-size:18px;font-weight:700;color:#2f201a;">Pesanan Baru</p><p style="margin:4px 0 0;font-size:13px;color:rgba(47,32,26,.60);">Buat pesanan dan simpan langsung di browser.</p></div>
            <button type="button" class="order-create-close" aria-label="Tutup" style="width:38px;height:38px;border:1px solid rgba(59,31,20,.10);border-radius:50%;background:#fff;font-size:22px;line-height:1;color:#3b1f14;cursor:pointer;">×</button>
          </div>
          <form id="order-create-form" style="padding:24px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
              <div><label style="display:block;font-size:12px;font-weight:600;color:rgba(47,32,26,.65);margin-bottom:7px;">NAMA PELANGGAN *</label><input id="order-form-customer" required type="text" placeholder="Nama pelanggan" style="width:100%;padding:11px 13px;border:1px solid rgba(59,31,20,.14);border-radius:12px;outline:none;"></div>
              <div><label style="display:block;font-size:12px;font-weight:600;color:rgba(47,32,26,.65);margin-bottom:7px;">NO. TELEPON</label><input id="order-form-phone" type="text" placeholder="08xxxxxxxxxx" style="width:100%;padding:11px 13px;border:1px solid rgba(59,31,20,.14);border-radius:12px;outline:none;"></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
              <div><label style="display:block;font-size:12px;font-weight:600;color:rgba(47,32,26,.65);margin-bottom:7px;">KANAL *</label><select id="order-form-channel" style="width:100%;padding:11px 13px;border:1px solid rgba(59,31,20,.14);border-radius:12px;background:#fff;"><option>Makan di Tempat</option><option>Take Away</option><option>Ojek Online</option><option>Katering</option></select></div>
              <div><label style="display:block;font-size:12px;font-weight:600;color:rgba(47,32,26,.65);margin-bottom:7px;">INFO KANAL</label><input id="order-form-channel-info" type="text" placeholder="Contoh: Meja 05" style="width:100%;padding:11px 13px;border:1px solid rgba(59,31,20,.14);border-radius:12px;outline:none;"></div>
            </div>
            <div style="margin-top:20px;">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:9px;"><label style="font-size:12px;font-weight:600;color:rgba(47,32,26,.65);">MENU PESANAN *</label><button type="button" id="order-add-item" style="border:0;background:transparent;color:#8b1e1e;font-weight:600;cursor:pointer;">+ Tambah menu</button></div>
              <div id="order-editor-items"></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
              <div><label style="display:block;font-size:12px;font-weight:600;color:rgba(47,32,26,.65);margin-bottom:7px;">PEMBAYARAN</label><select id="order-form-payment" style="width:100%;padding:11px 13px;border:1px solid rgba(59,31,20,.14);border-radius:12px;background:#fff;"><option>QRIS</option><option>Tunai</option><option>Transfer Bank</option><option>GoPay</option><option>OVO</option></select></div>
              <div><label style="display:block;font-size:12px;font-weight:600;color:rgba(47,32,26,.65);margin-bottom:7px;">CATATAN</label><input id="order-form-note" type="text" placeholder="Catatan pesanan (opsional)" style="width:100%;padding:11px 13px;border:1px solid rgba(59,31,20,.14);border-radius:12px;outline:none;"></div>
            </div>
            <div style="margin-top:20px;padding:15px 16px;border-radius:14px;background:rgba(139,30,30,.05);display:flex;align-items:center;justify-content:space-between;"><span style="font-size:13px;color:rgba(47,32,26,.60);">Total Pesanan</span><strong id="order-editor-total" style="font-size:20px;color:#8b1e1e;">Rp0</strong></div>
            <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:22px;"><button type="button" class="order-create-close" style="padding:10px 18px;border:1px solid rgba(59,31,20,.12);border-radius:999px;background:#fff;color:#3b1f14;font-weight:600;cursor:pointer;">Batal</button><button type="submit" style="padding:10px 20px;border:0;border-radius:999px;background:#8b1e1e;color:#fff;font-weight:600;cursor:pointer;">Simpan Pesanan</button></div>
          </form>
        </div>
      </div>`;
    $('body').append(html);
  }

  function renderOrderEditorItems() {
    ensureOrderEditor();
    const $wrap = $('#order-editor-items');
    if (!$wrap.children().length) addOrderEditorItem();
    else $wrap.find('.order-editor-item-menu').each(function () {
      const selected = $(this).val();
      $(this).html(orderEditorMenuOptions(selected));
      $(this).val(selected);
    });
    updateOrderEditorTotal();
  }

  function addOrderEditorItem() {
    ensureOrderEditor();
    const row = $('<div>', { class:'order-editor-item', style:'display:grid;grid-template-columns:minmax(0,1fr) 82px 90px 36px;gap:8px;align-items:center;margin-bottom:8px;' });
    row.html(
      '<select class="order-editor-item-menu" style="width:100%;padding:10px 11px;border:1px solid rgba(59,31,20,.14);border-radius:11px;background:#fff;">' + orderEditorMenuOptions('') + '</select>' +
      '<input class="order-editor-item-qty" type="number" min="1" value="1" style="width:100%;padding:10px 8px;border:1px solid rgba(59,31,20,.14);border-radius:11px;" aria-label="Jumlah" />' +
      '<span class="order-editor-item-price" style="font-size:12px;color:rgba(47,32,26,.62);text-align:right;">Rp0</span>' +
      '<button type="button" class="order-editor-item-remove" aria-label="Hapus menu" style="width:32px;height:32px;border:0;border-radius:50%;background:rgba(59,31,20,.06);color:#8b1e1e;cursor:pointer;">×</button>'
    );
    $wrap = $('#order-editor-items');
    $wrap.append(row);
    updateOrderEditorTotal();
  }

  function updateOrderEditorTotal() {
    let total = 0;
    $('#order-editor-items .order-editor-item').each(function () {
      const menu = getMenuItem($(this).find('.order-editor-item-menu').val());
      const qty = Math.max(1, Number($(this).find('.order-editor-item-qty').val()) || 1);
      const price = menu ? Number(menu.price) || 0 : 0;
      total += price * qty;
      $(this).find('.order-editor-item-price').text(menu ? menuRupiah(price * qty) : 'Rp0');
    });
    $('#order-editor-total').text(menuRupiah(total));
    return total;
  }

  function generateOrderId() {
    let max = 0;
    ORDER_DATA.forEach(function (o) {
      const match = String(o.id || '').match(/(\d+)$/);
      if (match) max = Math.max(max, Number(match[1]) || 0);
    });
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2,'0');
    return '#LB-' + yy + mm + '-' + String(max + 1).padStart(3,'0');
  }

  function currentOrderDateParts() {
    const now = new Date();
    return {
      time: now.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}).replace('.',':'),
      date: now.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})
    };
  }

  function openOrderEditor() {
    ensureOrderEditor();
    $('#order-create-form')[0].reset();
    $('#order-form-channel').val('Makan di Tempat');
    $('#order-form-payment').val('QRIS');
    $('#order-editor-items').empty();
    addOrderEditorItem();
    $('#order-create-modal').css('display','block');
    $('body').css('overflow','hidden');
    lucide.createIcons();
  }

  function closeOrderEditor() {
    $('#order-create-modal').css('display','none');
    $('body').css('overflow','');
  }

  function saveNewOrder() {
    const customer = $('#order-form-customer').val().trim();
    const phone = $('#order-form-phone').val().trim() || '-';
    const channel = $('#order-form-channel').val();
    const channelInfo = $('#order-form-channel-info').val().trim() || (channel === 'Makan di Tempat' ? 'Meja belum ditentukan' : '-');
    const payment = $('#order-form-payment').val();
    const note = $('#order-form-note').val().trim() || 'Tidak ada catatan khusus.';
    const items = [];
    let total = 0;

    $('#order-editor-items .order-editor-item').each(function () {
      const menu = getMenuItem($(this).find('.order-editor-item-menu').val());
      const qty = Math.max(1, Number($(this).find('.order-editor-item-qty').val()) || 1);
      if (!menu) return;
      const price = Number(menu.price) || 0;
      items.push([menu.name, qty, menuRupiah(price)]);
      total += price * qty;
    });

    if (!customer) { showToast('Nama pelanggan wajib diisi.'); return false; }
    if (!items.length) { showToast('Pilih minimal satu menu.'); return false; }

    const dt = currentOrderDateParts();
    const id = generateOrderId();
    const summary = items.map(function (it) { return it[0] + ' ×' + it[1]; }).join(', ');
    const order = {
      id:id, customer:customer, phone:phone, items:items, summary:summary,
      channel:channel, channelInfo:channelInfo, time:dt.time, date:dt.date,
      total:menuRupiah(total), subtotal:menuRupiah(total), discount:'Rp0',
      status:'Baru', payment:payment, paymentStatus:'BELUM DIBAYAR', note:note,
      timeline:[[dt.time,'Pesanan diterima']]
    };

    ORDER_DATA.unshift(order);
    saveOrderData();
    renderOrders();
    renderFullOrders();
    closeOrderEditor();
    showToast(id + ' berhasil dibuat.');
    return true;
  }

  function renderOrderDetail(order) {
    if (!order) return;
    $('#detail-id').text(order.id);
    const safeItems = Array.isArray(order.items) ? order.items : [];
    const itemHtml = safeItems.map(function (it) {
      return '<div class="detail-item"><div><p class="u-text-sm fw-medium u-text-ink">' + it[0] + '</p><p class="u-text-xs ink60">' + it[1] + ' × ' + it[2] + '</p></div><p class="u-text-sm fw-medium u-text-ink">' + it[2] + '</p></div>';
    }).join('');
    const steps = ['Pesanan diterima','Pesanan diproses','Pesanan siap','Pesanan selesai'];
    const current = orderStepIndex(order.status);
    let timelineHtml = '';
    if (order.status === 'Dibatalkan') {
      timelineHtml = order.timeline.map(function (tl, i) {
        return '<div class="timeline-row ' + (i < order.timeline.length - 1 ? 'done' : 'current') + '"><span class="timeline-dot"></span><div><p class="u-text-sm fw-medium u-text-ink">' + tl[1] + '</p><p class="u-text-xs ink60">' + tl[0] + '</p></div></div>';
      }).join('');
    } else {
      timelineHtml = steps.map(function (label, i) {
        const existing = order.timeline[i];
        const cls = i < current ? 'done' : (i === current ? 'current' : '');
        return '<div class="timeline-row ' + cls + '"><span class="timeline-dot"></span><div><p class="u-text-sm ' + (i <= current ? 'fw-medium u-text-ink' : 'ink40') + '">' + label + '</p><p class="u-text-xs ' + (i <= current ? 'ink60' : 'ink40') + '">' + (existing ? existing[0] : '—') + '</p></div></div>';
      }).join('');
    }

    $('#order-detail-body').html(
      '<div class="d-flex flex-column u-gap-4">' +
        '<div class="d-flex align-items-start justify-content-between u-gap-3"><div><p class="u-text-base fw-semibold u-text-ink">' + order.customer + '</p><p class="u-text-sm ink60">' + order.phone + '</p></div>' + statusBadge(order.status) + '</div>' +
        '<div class="detail-card d-flex flex-column u-gap-3"><div class="d-flex justify-content-between u-gap-3"><div><p class="detail-label">KANAL</p><p class="detail-value">' + order.channel + '</p></div><div class="text-end"><p class="detail-label">WAKTU</p><p class="detail-value">' + order.date + ' · ' + order.time + '</p></div></div><div><p class="detail-label">INFO</p><p class="detail-value">' + order.channelInfo + '</p></div></div>' +
        '<div><p class="detail-label">RINCIAN PESANAN</p><div class="mt-2">' + itemHtml + '</div></div>' +
        '<div class="detail-card d-flex flex-column u-gap-2"><div class="detail-total-row"><span class="ink60">Subtotal</span><span>' + order.subtotal + '</span></div><div class="detail-total-row"><span class="ink60">Diskon</span><span>' + order.discount + '</span></div><div class="u-h-px divider my-1"></div><div class="detail-total-row fw-semibold"><span>Total</span><span class="u-text-maroon">' + order.total + '</span></div></div>' +
        '<div class="detail-card d-flex flex-column u-gap-2"><div class="d-flex justify-content-between"><div><p class="detail-label">PEMBAYARAN</p><p class="detail-value">' + order.payment + '</p></div><div class="text-end"><p class="detail-label">STATUS</p><p class="detail-value fw-medium u-text-leaf">' + order.paymentStatus + '</p></div></div></div>' +
        '<div><p class="detail-label">CATATAN</p><p class="u-text-sm u-text-ink mt-1">' + order.note + '</p></div>' +
        '<div><p class="detail-label">STATUS PESANAN</p><div class="detail-timeline">' + timelineHtml + '</div></div>' +
      '</div>'
    );

    const nextMap = { Baru:'Proses Pesanan', Diproses:'Tandai Siap', Siap:'Selesaikan Pesanan' };
    let actions = '';
    if (order.status !== 'Selesai' && order.status !== 'Dibatalkan') {
      actions += '<button id="btn-cancel-order" class="drawer-btn drawer-btn-secondary">Batalkan</button>';
      actions += '<button id="btn-advance-order" class="drawer-btn drawer-btn-primary">' + nextMap[order.status] + '</button>';
    } else {
      actions = '<button id="btn-close-completed" class="drawer-btn drawer-btn-primary">Tutup Detail</button>';
    }
    $('#order-detail-actions').html(actions);
    $('#order-detail').data('order-id', order.id);
    lucide.createIcons();
  }

  function openOrderDetail(id) {
    const order = getOrder(id);
    if (!order) return;
    renderOrderDetail(order);
    $('#order-detail').removeClass('hidden-page');
    const $p = $('#order-detail-panel').removeClass('anim-slide');
    void $p[0].offsetWidth;
    $p.addClass('anim-slide');
  }

  function closeOrderDetail() { $('#order-detail').addClass('hidden-page'); }

  function advanceOrder(order) {
    const map = { Baru:'Diproses', Diproses:'Siap', Siap:'Selesai' };
    const next = map[order.status];
    if (!next) return;
    order.status = next;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2,'0');
    const mm = String(now.getMinutes()).padStart(2,'0');
    const label = { Diproses:'Pesanan diproses', Siap:'Pesanan siap', Selesai:'Pesanan selesai' }[next];
    order.timeline.push([hh + ':' + mm, label]);
    saveOrderData();
    renderOrders();
    renderFullOrders();
    renderOrderDetail(order);
    showToast(order.id + ' diperbarui menjadi “' + next + '”.');
  }


  /* ---------------- Render: Menu Makanan ---------------- */
  function saveMenuData() {
    try { localStorage.setItem('lamak-bana-menu-data', JSON.stringify(MENU_DATA)); } catch (e) {}
  }

  function menuRupiah(value) { return 'Rp' + Number(value || 0).toLocaleString('id-ID'); }

  function filteredMenuData() {
    const q = (state.menuFilters.search || '').trim().toLowerCase();
    return MENU_DATA.filter(function (m) {
      const categoryOk = state.menuFilters.category === 'Semua' || m.category === state.menuFilters.category;
      return categoryOk && (!q || [m.name,m.category,m.desc].join(' ').toLowerCase().indexOf(q) !== -1);
    });
  }

  function renderMenuStats() {
    $('#menu-stat-total').text(MENU_DATA.length);
    $('#menu-stat-web').text(MENU_DATA.filter(function (m) { return m.website; }).length);
    $('#menu-stat-low').text(MENU_DATA.filter(function (m) { return m.available && m.stock > 0 && m.stock <= 7; }).length);
    $('#menu-stat-featured').text(MENU_DATA.filter(function (m) { return m.featured; }).length);
  }

  function menuStockBadge(m) {
    if (!m.available || m.stock <= 0) return '<span class="menu-stock-badge is-out">Tidak tersedia</span>';
    if (m.stock <= 7) return '<span class="menu-stock-badge is-low">Sisa ' + m.stock + '</span>';
    return '<span class="menu-stock-badge is-ok">Stok ' + m.stock + '</span>';
  }

  function renderMenuPage() {
    renderMenuStats();
    const data = filteredMenuData();
    const $grid = $('#menu-catalog').empty();
    $('#menu-empty').toggleClass('hidden-page', data.length > 0);
    $.each(data, function (_, m) {
      const initials = m.name.split(' ').map(function (p) { return p[0]; }).join('').slice(0,2).toUpperCase();
      $('<article>', { class:'menu-admin-card', 'data-menu-id':m.id })
        .html(
          '<div class="menu-admin-photo menu-tone-' + m.tone + '">' +
            '<span class="menu-admin-photo-mark">' + initials + '</span>' +
            (m.featured ? '<span class="menu-featured-badge"><i data-lucide="star" class="u-size-3"></i> Andalan</span>' : '') +
            '<button class="menu-card-more" type="button" data-menu-edit="' + m.id + '" aria-label="Edit ' + m.name + '"><i data-lucide="more-horizontal" class="u-size-4"></i></button>' +
          '</div>' +
          '<div class="menu-admin-body">' +
            '<div class="d-flex align-items-start justify-content-between u-gap-3"><div class="u-min-w-0"><p class="menu-admin-name">' + m.name + '</p><p class="menu-admin-category">' + m.category + '</p></div><p class="menu-admin-price">' + menuRupiah(m.price) + '</p></div>' +
            '<p class="menu-admin-desc">' + m.desc + '</p>' +
            '<div class="d-flex align-items-center justify-content-between u-gap-2">' + menuStockBadge(m) + '<button class="menu-edit-link" type="button" data-menu-edit="' + m.id + '">Edit menu</button></div>' +
          '</div>' +
          '<div class="menu-admin-footer">' +
            '<div><p>Tersedia</p><button class="mini-switch ' + (m.available ? 'is-on' : '') + '" type="button" role="switch" aria-checked="' + (m.available ? 'true' : 'false') + '" data-menu-toggle-available="' + m.id + '"><span></span></button></div>' +
            '<div><p>Website</p><button class="mini-switch ' + (m.website ? 'is-on' : '') + '" type="button" role="switch" aria-checked="' + (m.website ? 'true' : 'false') + '" data-menu-toggle-web="' + m.id + '"><span></span></button></div>' +
          '</div>'
        ).appendTo($grid);
    });
    lucide.createIcons();
  }

  function getMenuItem(id) { return MENU_DATA.find(function (m) { return m.id === id; }); }

  function openMenuEditor(id) {
    const isNew = !id;
    const m = isNew ? { id:'', name:'', category:'Daging', price:0, stock:0, available:true, website:true, featured:false, desc:'', tone:'rendang' } : getMenuItem(id);
    if (!m) return;
    $('#menu-editor-title').text(isNew ? 'Tambah Menu' : 'Edit Menu');
    $('#menu-form-id').val(m.id);
    $('#menu-form-name').val(m.name);
    $('#menu-form-category').val(m.category);
    $('#menu-form-price').val(m.price || '');
    $('#menu-form-stock').val(m.stock);
    $('#menu-form-available').val(String(!!m.available));
    $('#menu-form-desc').val(m.desc || '');
    $('#menu-desc-count').text((m.desc || '').length);
    $('#menu-form-website').prop('checked', !!m.website);
    $('#menu-form-featured').prop('checked', !!m.featured);
    syncAllUnifiedSelects();
    $('#menu-delete').toggleClass('hidden-page', isNew);
    $('#menu-editor').removeClass('hidden-page');
    const $panel = $('#menu-editor-panel').removeClass('anim-slide'); void $panel[0].offsetWidth; $panel.addClass('anim-slide');
    lucide.createIcons();
  }

  function closeMenuEditor() { $('#menu-editor').addClass('hidden-page'); }

  function saveMenuEditor() {
    const name = $('#menu-form-name').val().trim();
    const price = Number($('#menu-form-price').val());
    if (!name || !price) { showToast('Nama menu dan harga wajib diisi.'); return; }
    const id = $('#menu-form-id').val();
    const payload = {
      name:name,
      category:$('#menu-form-category').val(),
      price:price,
      stock:Number($('#menu-form-stock').val()) || 0,
      available:$('#menu-form-available').val() === 'true',
      website:$('#menu-form-website').is(':checked'),
      featured:$('#menu-form-featured').is(':checked'),
      desc:$('#menu-form-desc').val().trim(),
    };
    if (id) {
      const m = getMenuItem(id); Object.assign(m, payload);
      if (!m.tone) m.tone = 'rendang';
      showToast(m.name + ' berhasil diperbarui dan siap disinkronkan.');
    } else {
      const next = MENU_DATA.reduce(function (max,m) { return Math.max(max, Number(m.id.replace(/\D/g,'')) || 0); },0) + 1;
      MENU_DATA.push(Object.assign({ id:'MN-' + String(next).padStart(3,'0'), tone:'rendang' }, payload));
      showToast(name + ' berhasil ditambahkan.');
    }
    saveMenuData(); renderMenuPage(); closeMenuEditor();
  }

  function deleteMenuEditor() {
    const id = $('#menu-form-id').val();
    const m = getMenuItem(id); if (!m) return;
    MENU_DATA = MENU_DATA.filter(function (x) { return x.id !== id; });
    saveMenuData(); renderMenuPage(); closeMenuEditor(); showToast(m.name + ' dihapus dari katalog admin.');
  }

  function renderWebsiteMenuPreview() {
    const data = MENU_DATA.filter(function (m) { return m.website && m.featured; }).slice(0,3);
    const $wrap = $('#website-preview-items').empty();
    if (!data.length) $wrap.html('<div class="website-preview-empty">Belum ada Menu Andalan yang aktif di website.</div>');
    $.each(data, function (_, m) {
      $('<div>', { class:'website-preview-card' }).html(
        '<div class="website-preview-photo menu-tone-' + m.tone + '"><span>FOTO</span></div>' +
        '<div class="website-preview-body"><div class="d-flex align-items-start justify-content-between u-gap-2"><strong>' + m.name.toUpperCase() + '</strong><b>' + menuRupiah(m.price) + '</b></div><p>' + m.desc + '</p><button>Pesan</button></div>'
      ).appendTo($wrap);
    });
  }

  function openMenuPreview() { renderWebsiteMenuPreview(); $('#menu-preview').removeClass('hidden-page'); lucide.createIcons(); }
  function closeMenuPreview() { $('#menu-preview').addClass('hidden-page'); }

  /* ---------------- Render: reservations ---------------- */
  function saveReservationData() {
    try { localStorage.setItem('lamak-bana-reservation-data', JSON.stringify(RESERVATION_DATA)); } catch (e) {}
  }

  function resEsc(value) {
    return String(value == null ? '' : value).replace(/[&<>'"]/g, function (c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c];
    });
  }

  function reservationBadge(status) {
    const s = RESERVATION_STATUS_STYLE[status] || RESERVATION_STATUS_STYLE.Menunggu;
    return '<span class="reservation-status-badge" style="background:' + s.bg + ';color:' + s.color + '">' + resEsc(status) + '</span>';
  }

  function formatReservationDate(iso, compact) {
    const parts = String(iso || '').split('-').map(Number);
    if (parts.length !== 3) return iso;
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return new Intl.DateTimeFormat('id-ID', compact ? { day:'2-digit', month:'short' } : { day:'numeric', month:'short', year:'numeric' }).format(d);
  }

  function isoShift(iso, days) {
    const p = iso.split('-').map(Number);
    const d = new Date(p[0], p[1]-1, p[2]);
    d.setDate(d.getDate() + days);
    const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0');
    return y+'-'+m+'-'+day;
  }

  function reservationMatchesDate(r, filter) {
    if (filter === 'Semua Tanggal') return true;
    if (filter === 'Hari ini') return r.date === RESERVATION_TODAY;
    if (filter === 'Besok') return r.date === isoShift(RESERVATION_TODAY, 1);
    if (filter === '7 hari') return r.date >= RESERVATION_TODAY && r.date <= isoShift(RESERVATION_TODAY, 6);
    return true;
  }

  function filteredReservations() {
    const f = state.reservationFilters;
    const q = (f.search || '').trim().toLowerCase();
    return RESERVATION_DATA.filter(function (r) {
      const statusOk = f.status === 'Semua' || r.status === f.status;
      const sourceOk = f.source === 'Semua' || r.source === f.source;
      const dateOk = reservationMatchesDate(r, f.date);
      const text = [r.id,r.customer,r.phone,r.table,r.area,r.source,r.occasion].join(' ').toLowerCase();
      return statusOk && sourceOk && dateOk && (!q || text.indexOf(q) !== -1);
    }).sort(function (a,b) { return (a.date+a.time).localeCompare(b.date+b.time); });
  }

  function renderReservationStats() {
    const today = RESERVATION_DATA.filter(function (r) { return r.date === RESERVATION_TODAY && r.status !== 'Dibatalkan'; });
    const pending = today.filter(function (r) { return r.status === 'Menunggu'; });
    const guests = today.reduce(function (sum,r) { return sum + Number(r.pax || 0); }, 0);
    const tables = new Set(today.filter(function (r) { return r.table; }).map(function (r) { return r.table; })).size;
    $('#reservation-stat-today').text(today.length);
    $('#reservation-stat-pending').text(pending.length);
    $('#reservation-stat-guests').text(guests);
    $('#reservation-stat-tables').text(tables + '/18');
  }

  function renderReservationAgenda() {
    const today = RESERVATION_DATA.filter(function (r) { return r.date === RESERVATION_TODAY && r.status !== 'Dibatalkan'; })
      .sort(function (a,b) { return a.time.localeCompare(b.time); });
    $('#reservation-agenda-count').text(today.length + ' booking');
    const $wrap = $('#reservation-agenda').empty();
    if (!today.length) {
      $wrap.html('<div class="reservation-empty-small">Belum ada reservasi untuk hari ini.</div>');
      return;
    }
    $.each(today.slice(0,7), function (_, r) {
      $('<button>', { class:'reservation-agenda-item', type:'button', 'data-reservation-id':r.id })
        .html(
          '<span class="reservation-agenda-time">' + resEsc(r.time) + '</span>' +
          '<span class="reservation-agenda-line"><i></i></span>' +
          '<span class="reservation-agenda-copy"><strong>' + resEsc(r.customer) + '</strong><small>' + r.pax + ' pax · ' + resEsc(r.table || r.area) + '</small></span>' +
          reservationBadge(r.status)
        ).appendTo($wrap);
    });
  }

  function renderReservationCounts() {
    const f = state.reservationFilters;
    const q = (f.search || '').trim().toLowerCase();
    const base = RESERVATION_DATA.filter(function (r) {
      const sourceOk = f.source === 'Semua' || r.source === f.source;
      const dateOk = reservationMatchesDate(r, f.date);
      const text = [r.id,r.customer,r.phone,r.table,r.area,r.source,r.occasion].join(' ').toLowerCase();
      return sourceOk && dateOk && (!q || text.indexOf(q) !== -1);
    });
    ['Semua','Menunggu','Dikonfirmasi','Hadir','Selesai','Dibatalkan'].forEach(function (status) {
      const n = status === 'Semua' ? base.length : base.filter(function (r) { return r.status === status; }).length;
      $('[data-res-count="' + status + '"]').text(n);
    });
  }

  function renderReservationPage() {
    renderReservationStats();
    renderReservationAgenda();
    renderReservationCounts();
    const data = filteredReservations();
    const $wrap = $('#reservation-rows').empty();
    if (!data.length) {
      $wrap.html('<div class="reservation-empty"><i data-lucide="calendar-x" class="u-size-5"></i><p class="u-text-sm fw-medium u-text-ink">Reservasi tidak ditemukan</p><p class="u-text-xs ink60">Coba ubah pencarian atau filter.</p></div>');
    } else {
      $.each(data, function (_, r) {
        $('<div>', { class:'reservation-row', tabindex:'0', role:'button', 'data-reservation-id':r.id })
          .html(
            '<p class="u-text-sm fw-medium u-text-ink">' + resEsc(r.id) + '</p>' +
            '<div><p class="u-text-sm u-text-ink">' + resEsc(r.customer) + '</p><p class="u-text-xs ink40">' + resEsc(r.phone) + '</p></div>' +
            '<div><p class="u-text-sm u-text-ink">' + resEsc(formatReservationDate(r.date,true)) + ' · ' + resEsc(r.time) + '</p><p class="u-text-xs ink40">' + resEsc(r.occasion || 'Reservasi meja') + '</p></div>' +
            '<p class="u-text-sm u-text-ink">' + r.pax + ' pax</p>' +
            '<div><p class="u-text-sm u-text-ink">' + resEsc(r.table || 'Belum ditentukan') + '</p><p class="u-text-xs ink40">' + resEsc(r.area) + '</p></div>' +
            '<span class="reservation-source-badge"><i data-lucide="' + (r.source === 'Website' ? 'globe-2' : r.source === 'WhatsApp' ? 'message-circle' : r.source === 'Telepon' ? 'phone' : 'user-round-cog') + '" class="u-size-3"></i>' + resEsc(r.source) + '</span>' +
            '<div>' + reservationBadge(r.status) + '</div>' +
            '<button class="order-row-menu" aria-label="Buka detail ' + resEsc(r.id) + '"><i data-lucide="more-horizontal" class="u-size-4"></i></button>'
          ).appendTo($wrap);
      });
    }
    $('#reservation-count').text('Menampilkan ' + data.length + ' dari ' + RESERVATION_DATA.length + ' reservasi');
    $('#reservation-tabs .reservation-tab').removeClass('is-active').filter('[data-status="' + state.reservationFilters.status + '"]').addClass('is-active');
    lucide.createIcons();
  }

  function getReservation(id) { return RESERVATION_DATA.find(function (r) { return r.id === id; }); }

  function renderReservationDetail(r) {
    if (!r) return;
    $('#reservation-detail-id').text(r.id);
    $('#reservation-detail-body').html(
      '<div class="d-flex flex-column u-gap-4">' +
        '<div class="d-flex align-items-start justify-content-between u-gap-3"><div><p class="u-text-base fw-semibold u-text-ink">' + resEsc(r.customer) + '</p><p class="u-text-sm ink60">' + resEsc(r.phone) + '</p></div>' + reservationBadge(r.status) + '</div>' +
        '<div class="reservation-detail-grid"><div><span>JADWAL</span><strong>' + resEsc(formatReservationDate(r.date,false)) + ' · ' + resEsc(r.time) + '</strong></div><div><span>JUMLAH TAMU</span><strong>' + r.pax + ' pax</strong></div><div><span>MEJA</span><strong>' + resEsc(r.table || 'Belum ditentukan') + '</strong></div><div><span>AREA</span><strong>' + resEsc(r.area) + '</strong></div></div>' +
        '<div class="detail-card d-flex flex-column u-gap-3"><div class="d-flex justify-content-between u-gap-3"><div><p class="detail-label">SUMBER</p><p class="detail-value">' + resEsc(r.source) + '</p></div><div class="text-end"><p class="detail-label">DIBUAT</p><p class="detail-value">' + resEsc(r.createdAt) + '</p></div></div><div><p class="detail-label">ACARA / KEPERLUAN</p><p class="detail-value">' + resEsc(r.occasion || '—') + '</p></div></div>' +
        '<div><p class="detail-label">CATATAN</p><div class="reservation-note-box">' + resEsc(r.note || 'Tidak ada catatan.') + '</div></div>' +
        '<button data-reservation-edit class="reservation-edit-link" type="button"><i data-lucide="pencil" class="u-size-4"></i> Edit detail reservasi</button>' +
      '</div>'
    );
    let actions = '';
    if (r.status === 'Menunggu') actions = '<button id="btn-cancel-reservation" class="drawer-btn drawer-btn-secondary">Batalkan</button><button id="btn-advance-reservation" class="drawer-btn drawer-btn-primary"><i data-lucide="check" class="u-size-4"></i> Konfirmasi</button>';
    else if (r.status === 'Dikonfirmasi') actions = '<button id="btn-cancel-reservation" class="drawer-btn drawer-btn-secondary">Batalkan</button><button id="btn-advance-reservation" class="drawer-btn drawer-btn-primary"><i data-lucide="log-in" class="u-size-4"></i> Tandai Hadir</button>';
    else if (r.status === 'Hadir') actions = '<button data-reservation-edit class="drawer-btn drawer-btn-secondary">Edit</button><button id="btn-advance-reservation" class="drawer-btn drawer-btn-primary"><i data-lucide="check-circle-2" class="u-size-4"></i> Selesaikan</button>';
    else actions = '<button id="btn-close-reservation" class="drawer-btn drawer-btn-primary">Tutup</button>';
    $('#reservation-detail-actions').html(actions);
    lucide.createIcons();
  }

  function openReservationDetail(id) {
    const r = getReservation(id); if (!r) return;
    $('#reservation-detail').data('reservation-id', id).removeClass('hidden-page');
    renderReservationDetail(r);
    const $panel = $('#reservation-detail-panel').removeClass('anim-slide'); void $panel[0].offsetWidth; $panel.addClass('anim-slide');
  }
  function closeReservationDetail() { $('#reservation-detail').addClass('hidden-page'); }

  function openReservationEditor(id) {
    const r = id ? getReservation(id) : null;
    $('#reservation-editor-title').text(r ? 'Edit Reservasi' : 'Reservasi Baru');
    $('#reservation-form-id').val(r ? r.id : '');
    $('#reservation-form-name').val(r ? r.customer : '');
    $('#reservation-form-phone').val(r ? r.phone : '');
    $('#reservation-form-date').val(r ? r.date : RESERVATION_TODAY);
    $('#reservation-form-time').val(r ? r.time : '12:00');
    $('#reservation-form-pax').val(r ? r.pax : 2);
    $('#reservation-form-table').val(r ? r.table : '');
    $('#reservation-form-area').val(r ? r.area : 'Ruang Utama');
    $('#reservation-form-source').val(r ? r.source : 'Admin');
    $('#reservation-form-occasion').val(r ? r.occasion : '');
    $('#reservation-form-status').val(r ? r.status : 'Menunggu');
    $('#reservation-form-note').val(r ? r.note : '');
    $('#reservation-note-count').text((r ? r.note : '').length);
    syncAllUnifiedSelects();
    $('#reservation-editor').removeClass('hidden-page');
    const $panel = $('#reservation-editor-panel').removeClass('anim-slide'); void $panel[0].offsetWidth; $panel.addClass('anim-slide');
    lucide.createIcons();
  }
  function closeReservationEditor() { $('#reservation-editor').addClass('hidden-page'); }

  function reservationHoursValid(dateIso, time) {
    const p = dateIso.split('-').map(Number);
    const d = new Date(p[0], p[1]-1, p[2]);
    const weekend = d.getDay() === 0 || d.getDay() === 6;
    const open = weekend ? SETTINGS_DATA.weekendOpen : SETTINGS_DATA.weekdayOpen;
    const close = weekend ? SETTINGS_DATA.weekendClose : SETTINGS_DATA.weekdayClose;
    return time >= open && time <= close;
  }

  function saveReservationEditor() {
    const customer = $('#reservation-form-name').val().trim();
    const phone = $('#reservation-form-phone').val().trim();
    const date = $('#reservation-form-date').val();
    const time = $('#reservation-form-time').val();
    const pax = Number($('#reservation-form-pax').val());
    if (!customer || !phone || !date || !time || !pax) { showToast('Nama, nomor WhatsApp, tanggal, waktu, dan jumlah tamu wajib diisi.'); return; }
    if (!reservationHoursValid(date,time)) { showToast('Waktu reservasi berada di luar jam buka Lamak Bana.'); return; }
    const id = $('#reservation-form-id').val();
    const payload = {
      customer:customer, phone:phone, date:date, time:time, pax:pax,
      table:$('#reservation-form-table').val().trim(), area:$('#reservation-form-area').val(), source:$('#reservation-form-source').val(),
      status:$('#reservation-form-status').val(), occasion:$('#reservation-form-occasion').val().trim(), note:$('#reservation-form-note').val().trim() || 'Tidak ada catatan khusus.'
    };
    if (id) {
      const r = getReservation(id); if (!r) return;
      Object.assign(r,payload);
      showToast(r.id + ' berhasil diperbarui.');
    } else {
      const max = RESERVATION_DATA.reduce(function (n,r) { const x=Number((r.id.match(/(\d+)$/)||[])[1])||0; return Math.max(n,x); },0);
      const newId = '#RS-2609-' + String(max+1).padStart(3,'0');
      RESERVATION_DATA.push(Object.assign({ id:newId, createdAt:'28 Sep 2026 · sekarang' },payload));
      showToast(newId + ' berhasil dibuat.');
    }
    saveReservationData(); renderReservationPage(); renderMenus(); closeReservationEditor();
  }

  function advanceReservation(r) {
    if (!r) return;
    const next = { Menunggu:'Dikonfirmasi', Dikonfirmasi:'Hadir', Hadir:'Selesai' }[r.status];
    if (!next) return;
    r.status = next;
    saveReservationData(); renderReservationPage(); renderReservationDetail(r);
    showToast(r.id + ' diperbarui menjadi ' + next + '.');
  }

  function cancelReservation(r) {
    if (!r) return;
    r.status = 'Dibatalkan';
    saveReservationData(); renderReservationPage(); renderReservationDetail(r);
    showToast(r.id + ' dibatalkan.');
  }



  /* ---------------- Render: catering ---------------- */
  function saveCateringData() {
    try { localStorage.setItem('lamak-bana-catering-data', JSON.stringify(CATERING_DATA)); } catch (e) {}
  }

  function cateringBadge(status) {
    const s = CATERING_STATUS_STYLE[status] || CATERING_STATUS_STYLE.Menunggu;
    return '<span class="reservation-status-badge" style="background:' + s.bg + ';color:' + s.color + '">' + resEsc(status) + '</span>';
  }

  function cateringRupiah(value, compact) {
    const n = Number(value || 0);
    if (compact && n >= 1000000) return 'Rp' + (n/1000000).toLocaleString('id-ID',{maximumFractionDigits:1}) + ' jt';
    if (compact && n >= 1000) return 'Rp' + Math.round(n/1000).toLocaleString('id-ID') + ' rb';
    return 'Rp' + n.toLocaleString('id-ID');
  }

  function cateringMatchesDate(c, filter) {
    if (filter === 'Semua Tanggal') return true;
    if (filter === 'Hari ini') return c.date === CATERING_TODAY;
    if (filter === '7 hari') return c.date >= CATERING_TODAY && c.date <= isoShift(CATERING_TODAY, 6);
    if (filter === 'Bulan ini') return String(c.date).slice(0,7) === String(CATERING_TODAY).slice(0,7);
    return true;
  }

  function filteredCatering() {
    const f = state.cateringFilters;
    const q = (f.search || '').trim().toLowerCase();
    return CATERING_DATA.filter(function (c) {
      const statusOk = f.status === 'Semua' || c.status === f.status;
      const serviceOk = f.service === 'Semua' || c.service === f.service;
      const dateOk = cateringMatchesDate(c, f.date);
      const text = [c.id,c.customer,c.pic,c.phone,c.event,c.service,c.package,c.address,c.source].join(' ').toLowerCase();
      return statusOk && serviceOk && dateOk && (!q || text.indexOf(q) !== -1);
    }).sort(function (a,b) { return (a.date+a.time).localeCompare(b.date+b.time); });
  }

  function activeCatering() {
    return CATERING_DATA.filter(function (c) { return c.status !== 'Dibatalkan' && c.status !== 'Selesai'; });
  }

  function renderCateringStats() {
    const upcoming = activeCatering().filter(function (c) { return c.date >= CATERING_TODAY; });
    const pending = upcoming.filter(function (c) { return c.status === 'Menunggu' || c.status === 'Penawaran'; });
    const week = upcoming.filter(function (c) { return c.date <= isoShift(CATERING_TODAY,6); });
    const pax = week.reduce(function (sum,c) { return sum + Number(c.pax || 0); },0);
    const value = upcoming.reduce(function (sum,c) { return sum + Number(c.total || 0); },0);
    $('#catering-stat-upcoming').text(upcoming.length);
    $('#catering-stat-pending').text(pending.length);
    $('#catering-stat-pax').text(pax.toLocaleString('id-ID'));
    $('#catering-stat-value').text(cateringRupiah(value,true));
  }

  function renderCateringOverview() {
    const upcoming = activeCatering().filter(function (c) { return c.date >= CATERING_TODAY; }).sort(function(a,b){ return (a.date+a.time).localeCompare(b.date+b.time); });
    $('#catering-agenda-count').text(upcoming.length + ' agenda');
    const $wrap = $('#catering-agenda').empty();
    if (!upcoming.length) $wrap.html('<div class="reservation-empty-small">Belum ada agenda katering mendatang.</div>');
    else $.each(upcoming.slice(0,5), function (_,c) {
      $('<button>', { class:'catering-agenda-item', type:'button', 'data-catering-id':c.id }).html(
        '<span class="catering-agenda-date"><strong>' + resEsc(formatReservationDate(c.date,true)) + '</strong><small>' + resEsc(c.time) + '</small></span>' +
        '<span class="catering-agenda-line"><i></i></span>' +
        '<span class="catering-agenda-copy"><strong>' + resEsc(c.customer) + '</strong><small>' + resEsc(c.service) + ' · ' + c.pax + ' pax · ' + resEsc(c.event) + '</small></span>' +
        cateringBadge(c.status)
      ).appendTo($wrap);
    });
    const active = activeCatering();
    const box = active.filter(function(c){ return c.service === 'Nasi Kotak'; }).length;
    const buffet = active.filter(function(c){ return c.service === 'Prasmanan'; }).length;
    const total = active.reduce(function(sum,c){ return sum + Number(c.total||0); },0);
    const dp = active.reduce(function(sum,c){ return sum + Number(c.dp||0); },0);
    const pct = total ? Math.min(100,Math.round(dp/total*100)) : 0;
    $('#catering-service-box').text(box + ' order');
    $('#catering-service-buffet').text(buffet + ' order');
    $('#catering-dp-received').text(cateringRupiah(dp,true));
    $('#catering-payment-progress').css('width',pct+'%');
    $('#catering-payment-caption').text(pct + '% dari nilai pesanan aktif');
  }

  function renderCateringCounts() {
    const f = state.cateringFilters;
    const q = (f.search || '').trim().toLowerCase();
    const base = CATERING_DATA.filter(function (c) {
      const serviceOk = f.service === 'Semua' || c.service === f.service;
      const dateOk = cateringMatchesDate(c,f.date);
      const text = [c.id,c.customer,c.pic,c.phone,c.event,c.service,c.package,c.address,c.source].join(' ').toLowerCase();
      return serviceOk && dateOk && (!q || text.indexOf(q) !== -1);
    });
    ['Semua','Menunggu','Penawaran','Dikonfirmasi','Produksi','Selesai','Dibatalkan'].forEach(function(status){
      const n = status === 'Semua' ? base.length : base.filter(function(c){ return c.status === status; }).length;
      $('[data-cat-count="'+status+'"]').text(n);
    });
  }

  function renderCateringPage() {
    renderCateringStats(); renderCateringOverview(); renderCateringCounts();
    const data = filteredCatering();
    const $wrap = $('#catering-rows').empty();
    if (!data.length) {
      $wrap.html('<div class="reservation-empty"><i data-lucide="package-x" class="u-size-5"></i><p class="u-text-sm fw-medium u-text-ink">Pesanan katering tidak ditemukan</p><p class="u-text-xs ink60">Coba ubah pencarian atau filter.</p></div>');
    } else {
      $.each(data,function(_,c){
        const unpaid = Math.max(0,Number(c.total||0)-Number(c.dp||0));
        $('<div>', { class:'catering-row', tabindex:'0', role:'button', 'data-catering-id':c.id }).html(
          '<p class="u-text-sm fw-medium u-text-ink">' + resEsc(c.id) + '</p>' +
          '<div><p class="u-text-sm u-text-ink">' + resEsc(c.customer) + '</p><p class="u-text-xs ink40">PIC: ' + resEsc(c.pic) + '</p></div>' +
          '<div><p class="u-text-sm u-text-ink">' + resEsc(c.event) + '</p><p class="u-text-xs ink40">' + resEsc(c.package) + '</p></div>' +
          '<div><p class="u-text-sm u-text-ink">' + resEsc(formatReservationDate(c.date,true)) + ' · ' + resEsc(c.time) + '</p><p class="u-text-xs ink40">' + resEsc(c.address) + '</p></div>' +
          '<p class="u-text-sm u-text-ink">' + c.pax + ' pax</p>' +
          '<span class="catering-service-badge"><i data-lucide="' + (c.service === 'Prasmanan' ? 'concierge-bell' : 'package') + '" class="u-size-3"></i>' + resEsc(c.service) + '</span>' +
          '<div><p class="u-text-sm fw-medium u-text-ink">' + cateringRupiah(c.total,false) + '</p><p class="u-text-xs ' + (unpaid ? 'u-text-maroon' : 'u-text-leaf') + '">' + (unpaid ? 'Sisa ' + cateringRupiah(unpaid,false) : 'Lunas') + '</p></div>' +
          '<div>' + cateringBadge(c.status) + '</div>' +
          '<button class="order-row-menu" aria-label="Buka detail ' + resEsc(c.id) + '"><i data-lucide="more-horizontal" class="u-size-4"></i></button>'
        ).appendTo($wrap);
      });
    }
    $('#catering-count').text('Menampilkan ' + data.length + ' dari ' + CATERING_DATA.length + ' pesanan katering');
    $('#catering-tabs .catering-tab').removeClass('is-active').filter('[data-status="'+state.cateringFilters.status+'"]').addClass('is-active');
    lucide.createIcons();
  }

  function getCatering(id) { return CATERING_DATA.find(function(c){ return c.id === id; }); }

  function renderCateringDetail(c) {
    if (!c) return;
    const balance=Math.max(0,Number(c.total||0)-Number(c.dp||0));
    const pct=Number(c.total||0) ? Math.min(100,Math.round(Number(c.dp||0)/Number(c.total||0)*100)) : 0;
    $('#catering-detail-id').text(c.id);
    $('#catering-detail-body').html(
      '<div class="d-flex flex-column u-gap-4">' +
        '<div class="d-flex align-items-start justify-content-between u-gap-3"><div><p class="u-text-base fw-semibold u-text-ink">'+resEsc(c.customer)+'</p><p class="u-text-sm ink60">PIC '+resEsc(c.pic)+' · '+resEsc(c.phone)+'</p></div>'+cateringBadge(c.status)+'</div>' +
        '<div class="reservation-detail-grid"><div><span>JADWAL</span><strong>'+resEsc(formatReservationDate(c.date,false))+' · '+resEsc(c.time)+'</strong></div><div><span>JUMLAH</span><strong>'+c.pax+' pax</strong></div><div><span>ACARA</span><strong>'+resEsc(c.event)+'</strong></div><div><span>LAYANAN</span><strong>'+resEsc(c.service)+'</strong></div></div>' +
        '<div class="detail-card d-flex flex-column u-gap-3"><div><p class="detail-label">PAKET / MENU</p><p class="detail-value">'+resEsc(c.package)+'</p></div><div><p class="detail-label">LOKASI</p><p class="detail-value">'+resEsc(c.address || '—')+'</p></div><div class="d-flex justify-content-between u-gap-3"><div><p class="detail-label">SUMBER</p><p class="detail-value">'+resEsc(c.source)+'</p></div><div class="text-end"><p class="detail-label">DIBUAT</p><p class="detail-value">'+resEsc(c.createdAt)+'</p></div></div></div>' +
        '<div class="catering-payment-card"><div class="d-flex align-items-start justify-content-between"><div><p class="detail-label">PEMBAYARAN</p><p class="catering-payment-total">'+cateringRupiah(c.total,false)+'</p></div><span>'+pct+'%</span></div><div class="catering-progress"><i style="width:'+pct+'%"></i></div><div class="catering-payment-meta"><span>DP '+cateringRupiah(c.dp,false)+'</span><strong>'+(balance ? 'Sisa '+cateringRupiah(balance,false) : 'LUNAS')+'</strong></div></div>' +
        '<div><p class="detail-label">CATATAN</p><div class="reservation-note-box">'+resEsc(c.note || 'Tidak ada catatan.')+'</div></div>' +
        '<button data-catering-edit class="reservation-edit-link" type="button"><i data-lucide="pencil" class="u-size-4"></i> Edit detail katering</button>' +
      '</div>'
    );
    const nextLabel={Menunggu:'Buat Penawaran',Penawaran:'Konfirmasi Pesanan',Dikonfirmasi:'Mulai Produksi',Produksi:'Selesaikan'}[c.status];
    let actions='';
    if (nextLabel) actions='<button id="btn-cancel-catering" class="drawer-btn drawer-btn-secondary">Batalkan</button><button id="btn-advance-catering" class="drawer-btn drawer-btn-primary"><i data-lucide="arrow-right" class="u-size-4"></i>'+nextLabel+'</button>';
    else actions='<button id="btn-close-catering" class="drawer-btn drawer-btn-primary">Tutup</button>';
    $('#catering-detail-actions').html(actions); lucide.createIcons();
  }

  function openCateringDetail(id) {
    const c=getCatering(id); if(!c) return;
    $('#catering-detail').data('catering-id',id).removeClass('hidden-page'); renderCateringDetail(c);
    const $panel=$('#catering-detail-panel').removeClass('anim-slide'); void $panel[0].offsetWidth; $panel.addClass('anim-slide');
  }
  function closeCateringDetail(){ $('#catering-detail').addClass('hidden-page'); }

  function openCateringEditor(id) {
    const c=id?getCatering(id):null;
    $('#catering-editor-title').text(c?'Edit Katering':'Katering Baru');
    $('#catering-form-id').val(c?c.id:''); $('#catering-form-customer').val(c?c.customer:''); $('#catering-form-pic').val(c?c.pic:''); $('#catering-form-phone').val(c?c.phone:'');
    $('#catering-form-source').val(c?c.source:'Admin'); $('#catering-form-date').val(c?c.date:CATERING_TODAY); $('#catering-form-time').val(c?c.time:'12:00');
    $('#catering-form-event').val(c?c.event:'Acara Kantor'); $('#catering-form-service').val(c?c.service:'Nasi Kotak'); $('#catering-form-pax').val(c?c.pax:20); $('#catering-form-status').val(c?c.status:'Menunggu');
    $('#catering-form-package').val(c?c.package:''); $('#catering-form-address').val(c?c.address:''); $('#catering-form-total').val(c?c.total:''); $('#catering-form-dp').val(c?c.dp:0); $('#catering-form-note').val(c?c.note:''); $('#catering-note-count').text((c?c.note:'').length);
    syncAllUnifiedSelects();
    $('#catering-editor').removeClass('hidden-page'); const $panel=$('#catering-editor-panel').removeClass('anim-slide'); void $panel[0].offsetWidth; $panel.addClass('anim-slide'); lucide.createIcons();
  }
  function closeCateringEditor(){ $('#catering-editor').addClass('hidden-page'); }

  function saveCateringEditor() {
    const customer=$('#catering-form-customer').val().trim(), pic=$('#catering-form-pic').val().trim(), phone=$('#catering-form-phone').val().trim(), date=$('#catering-form-date').val(), time=$('#catering-form-time').val(), pax=Number($('#catering-form-pax').val()), total=Number($('#catering-form-total').val()), dp=Number($('#catering-form-dp').val()||0), pack=$('#catering-form-package').val().trim();
    if(!customer||!pic||!phone||!date||!time||!pax||!pack||!total){ showToast('Nama/perusahaan, PIC, kontak, jadwal, pax, paket, dan total pesanan wajib diisi.'); return; }
    if(dp>total){ showToast('Nilai DP tidak boleh lebih besar dari total pesanan.'); return; }
    const payload={customer:customer,pic:pic,phone:phone,date:date,time:time,pax:pax,event:$('#catering-form-event').val(),service:$('#catering-form-service').val(),package:pack,address:$('#catering-form-address').val().trim(),total:total,dp:dp,source:$('#catering-form-source').val(),status:$('#catering-form-status').val(),note:$('#catering-form-note').val().trim()||'Tidak ada catatan khusus.'};
    const id=$('#catering-form-id').val();
    if(id){ const c=getCatering(id); if(!c) return; Object.assign(c,payload); showToast(c.id+' berhasil diperbarui.'); }
    else { const max=CATERING_DATA.reduce(function(n,c){const x=Number((c.id.match(/(\d+)$/)||[])[1])||0;return Math.max(n,x);},0); const newId='#KT-2609-'+String(max+1).padStart(3,'0'); CATERING_DATA.push(Object.assign({id:newId,createdAt:'28 Sep 2026 · sekarang'},payload)); showToast(newId+' berhasil dibuat.'); }
    saveCateringData(); renderCateringPage(); renderMenus(); closeCateringEditor();
  }

  function advanceCatering(c) {
    if(!c) return; const next={Menunggu:'Penawaran',Penawaran:'Dikonfirmasi',Dikonfirmasi:'Produksi',Produksi:'Selesai'}[c.status]; if(!next) return;
    c.status=next; saveCateringData(); renderCateringPage(); renderCateringDetail(c); showToast(c.id+' diperbarui menjadi '+next+'.');
  }

  function cancelCatering(c) {
    if(!c) return; c.status='Dibatalkan'; saveCateringData(); renderCateringPage(); renderCateringDetail(c); showToast(c.id+' dibatalkan.');
  }

  /* ---------------- Laporan ---------------- */
  const REPORT_BASE = {
    revenue: 89400000,
    orders: 1248,
    completion: .92,
    channels: [
      { name:'Makan di Tempat', revenue:48200000, orders:648, color:'#8b1e1e' },
      { name:'Ojek Online', revenue:26700000, orders:424, color:'#d69223' },
      { name:'Katering', revenue:14500000, orders:176, color:'#2f5d3a' },
    ],
    statuses: [
      { name:'Selesai', count:1148, color:'#2f5d3a' },
      { name:'Diproses', count:46, color:'#d69223' },
      { name:'Baru', count:22, color:'#8b1e1e' },
      { name:'Siap', count:12, color:'#265f87' },
      { name:'Dibatalkan', count:20, color:'#a45a5a' },
    ],
    menus: [
      { name:'Rendang Daging', qty:312, revenue:8736000 },
      { name:'Ayam Pop', qty:246, revenue:6150000 },
      { name:'Dendeng Batokok', qty:198, revenue:5940000 },
      { name:'Gulai Tunjang', qty:174, revenue:4698000 },
      { name:'Telur Balado', qty:151, revenue:2265000 },
    ],
    daily: [
      { date:'22 Sep', orders:39, revenue:2740000 },
      { date:'23 Sep', orders:43, revenue:3180000 },
      { date:'24 Sep', orders:36, revenue:2510000 },
      { date:'25 Sep', orders:48, revenue:3520000 },
      { date:'26 Sep', orders:45, revenue:3270000 },
      { date:'27 Sep', orders:51, revenue:3890000 },
      { date:'28 Sep', orders:57, revenue:4260000 },
    ]
  };

  function reportPeriodFactor() {
    const p = state.reportFilters.period;
    if (p === '7 hari terakhir') return 7 / 28;
    if (p === 'Tahun ini') return 8.65;
    if (p === 'Rentang tanggal') {
      const a = new Date(state.reportFilters.dateFrom + 'T00:00:00');
      const b = new Date(state.reportFilters.dateTo + 'T00:00:00');
      if (isNaN(a) || isNaN(b) || b < a) return 1;
      return Math.max(1, Math.round((b - a) / 86400000) + 1) / 28;
    }
    return 1;
  }

  function reportChannelFactor() {
    const ch = state.reportFilters.channel;
    if (ch === 'Makan di Tempat') return 48200000 / REPORT_BASE.revenue;
    if (ch === 'Ojek Online') return 26700000 / REPORT_BASE.revenue;
    if (ch === 'Katering') return 14500000 / REPORT_BASE.revenue;
    return 1;
  }

  function reportMetrics() {
    const pf = reportPeriodFactor(), cf = reportChannelFactor();
    const revenue = Math.max(0, Math.round(REPORT_BASE.revenue * pf * cf));
    const orders = Math.max(1, Math.round(REPORT_BASE.orders * pf * (state.reportFilters.channel === 'Semua' ? 1 : cf * 1.06)));
    const aov = Math.round(revenue / Math.max(orders, 1));
    const completion = state.reportFilters.channel === 'Katering' ? .89 : state.reportFilters.channel === 'Ojek Online' ? .91 : .92;
    return { revenue:revenue, orders:orders, aov:aov, completion:completion, completed:Math.round(orders * completion), pf:pf, cf:cf };
  }

  function reportRupiah(v, compact) {
    v = Number(v || 0);
    if (compact) {
      if (v >= 1000000000) return 'Rp' + (v/1000000000).toLocaleString('id-ID',{maximumFractionDigits:1}) + ' M';
      if (v >= 1000000) return 'Rp' + (v/1000000).toLocaleString('id-ID',{maximumFractionDigits:1}) + ' jt';
      if (v >= 1000) return 'Rp' + (v/1000).toLocaleString('id-ID',{maximumFractionDigits:1}) + ' rb';
    }
    return 'Rp' + Math.round(v).toLocaleString('id-ID');
  }

  function reportPeriodText() {
    if (state.reportFilters.period === 'Rentang tanggal') {
      const fmt = function (d) { const x=new Date(d+'T00:00:00'); return isNaN(x) ? d : x.toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}); };
      return fmt(state.reportFilters.dateFrom) + ' – ' + fmt(state.reportFilters.dateTo);
    }
    if (state.reportFilters.period === '7 hari terakhir') return '22–28 Sep 2026';
    if (state.reportFilters.period === 'Tahun ini') return 'Jan–Sep 2026';
    return 'September 2026';
  }

  function renderReportPage() {
    const m = reportMetrics();
    $('#report-kpi-revenue').text(reportRupiah(m.revenue, true));
    $('#report-kpi-orders').text(m.orders.toLocaleString('id-ID'));
    $('#report-kpi-aov').text(reportRupiah(m.aov, true));
    $('#report-kpi-completion').text(Math.round(m.completion*100) + '%');
    $('#report-kpi-completion-note').text(m.completed.toLocaleString('id-ID') + ' pesanan selesai');
    $('#report-chart-subtitle').text(reportPeriodText() + ' · ' + dropdownLabel('report-channel', state.reportFilters.channel));
    $('#report-custom-range').toggleClass('hidden-page', state.reportFilters.period !== 'Rentang tanggal');
    $('#report-date-from').val(state.reportFilters.dateFrom); $('#report-date-to').val(state.reportFilters.dateTo);

    const $channels=$('#report-channel-breakdown').empty();
    const selected=state.reportFilters.channel;
    $.each(REPORT_BASE.channels,function(_,c){
      const scaledRevenue=Math.round(c.revenue*m.pf);
      const pct=Math.round(c.revenue/REPORT_BASE.revenue*100);
      const dim=selected !== 'Semua' && selected !== c.name;
      $('<div>',{class:'report-channel-row'}).css('opacity', dim ? .42 : 1).html(
        '<div class="report-channel-name"><span class="report-channel-dot" style="background:'+c.color+'"></span><span>'+c.name+'</span></div>'+
        '<div class="report-channel-bar"><i style="width:'+pct+'%;background:'+c.color+'"></i></div>'+
        '<div class="report-channel-value"><strong>'+reportRupiah(scaledRevenue,true)+'</strong><small>'+pct+'%</small></div>'
      ).appendTo($channels);
    });
    $('#report-channel-total').text(reportRupiah(REPORT_BASE.revenue*m.pf,true));

    const $statuses=$('#report-status-breakdown').empty();
    const totalBase=REPORT_BASE.statuses.reduce(function(a,b){return a+b.count;},0);
    $.each(REPORT_BASE.statuses,function(_,st){
      const count=Math.max(0,Math.round(st.count*m.pf*(state.reportFilters.channel==='Semua'?1:m.cf*1.06)));
      const pct=Math.round(st.count/totalBase*100);
      $('<div>',{class:'report-status-row'}).html('<div class="report-status-label"><span class="report-status-badge-dot" style="background:'+st.color+'"></span>'+st.name+'</div><div class="report-status-bar"><i style="width:'+pct+'%;background:'+st.color+'"></i></div><div class="report-status-count">'+count.toLocaleString('id-ID')+' · '+pct+'%</div>').appendTo($statuses);
    });
    $('#report-status-total').text(m.orders.toLocaleString('id-ID')+' pesanan');

    const $menus=$('#report-top-menu').empty();
    $.each(REPORT_BASE.menus,function(i,item){
      const qty=Math.max(1,Math.round(item.qty*m.pf*(state.reportFilters.channel==='Semua'?1:m.cf*1.08)));
      const rev=Math.round(item.revenue*m.pf*(state.reportFilters.channel==='Semua'?1:m.cf));
      $('<div>',{class:'report-menu-item'}).html('<div class="report-rank">'+(i+1)+'</div><div class="report-menu-name"><strong>'+item.name+'</strong><small>'+qty.toLocaleString('id-ID')+' porsi terjual</small></div><div class="report-menu-sales"><strong>'+reportRupiah(rev,true)+'</strong><small>pendapatan</small></div>').appendTo($menus);
    });

    const $daily=$('#report-daily-rows').empty();
    $.each(REPORT_BASE.daily,function(_,d){
      const orders=Math.max(1,Math.round(d.orders*(state.reportFilters.channel==='Semua'?1:m.cf*1.06)));
      const rev=Math.round(d.revenue*(state.reportFilters.channel==='Semua'?1:m.cf));
      $('<tr>').html('<td>'+d.date+' 2026</td><td>'+orders.toLocaleString('id-ID')+'</td><td>'+reportRupiah(rev,false)+'</td><td>'+reportRupiah(rev/orders,true)+'</td>').appendTo($daily);
    });

    if (state.page === 'Laporan') requestAnimationFrame(function(){ buildLineChart('#linechart'); });
    lucide.createIcons();
  }

  function exportReportExcel() {
    const m=reportMetrics();
    let rows=[['Laporan Penjualan Lamak Bana'],['Periode',reportPeriodText()],['Kanal',dropdownLabel('report-channel',state.reportFilters.channel)],[],['Ringkasan','Nilai'],['Total Pendapatan',reportRupiah(m.revenue,false)],['Total Pesanan',m.orders],['Rata-rata Transaksi',reportRupiah(m.aov,false)],['Pesanan Selesai',Math.round(m.completion*100)+'%'],[],['Tanggal','Pesanan','Pendapatan','Rata-rata']];
    REPORT_BASE.daily.forEach(function(d){const o=Math.max(1,Math.round(d.orders*(state.reportFilters.channel==='Semua'?1:m.cf*1.06)));const r=Math.round(d.revenue*(state.reportFilters.channel==='Semua'?1:m.cf));rows.push([d.date+' 2026',o,reportRupiah(r,false),reportRupiah(r/o,false)]);});
    const html='<html><head><meta charset="UTF-8"></head><body><table>'+rows.map(function(r){return '<tr>'+r.map(function(c){return '<td>'+String(c==null?'':c).replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</td>';}).join('')+'</tr>';}).join('')+'</table></body></html>';
    const blob=new Blob(['\ufeff'+html],{type:'application/vnd.ms-excel'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='Laporan-Penjualan-Lamak-Bana-'+new Date().toISOString().slice(0,10)+'.xls';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1000);showToast('Laporan Excel berhasil dibuat.');
  }


  /* ---------------- Render: Promo ---------------- */
  function savePromoData() {
    try { localStorage.setItem('lamak-bana-promo-data', JSON.stringify(PROMO_DATA)); } catch (e) {}
  }

  function promoStatus(p) {
    if (!p.active) return 'Nonaktif';
    if (p.start > PROMO_TODAY) return 'Terjadwal';
    if (p.end < PROMO_TODAY) return 'Nonaktif';
    return 'Aktif';
  }

  function promoDate(iso) {
    const parts=String(iso||'').split('-').map(Number);
    if(parts.length!==3) return iso || '—';
    const d=new Date(parts[0],parts[1]-1,parts[2]);
    return new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'short',year:'numeric'}).format(d);
  }

  function getPromo(id) { return PROMO_DATA.find(function (p) { return p.id === id; }); }

  function renderPromoPage() {
    const statuses = PROMO_DATA.map(promoStatus);
    $('#promo-stat-active').text(statuses.filter(function (x) { return x === 'Aktif'; }).length);
    $('#promo-stat-scheduled').text(statuses.filter(function (x) { return x === 'Terjadwal'; }).length);
    $('#promo-stat-off').text(statuses.filter(function (x) { return x === 'Nonaktif'; }).length);

    $('#promo-tabs .promo-tab').each(function () {
      $(this).toggleClass('is-active', $(this).attr('data-promo-status') === state.promoFilters.status);
    });

    const data = PROMO_DATA.filter(function (p) {
      return state.promoFilters.status === 'Semua' || promoStatus(p) === state.promoFilters.status;
    });
    const $list=$('#promo-list').empty();
    if(!data.length){$list.html('<div class="promo-empty">Belum ada promo pada kategori ini.</div>');return;}

    $.each(data,function(_,p){
      const status=promoStatus(p);
      const cls=status==='Aktif'?'active':(status==='Terjadwal'?'scheduled':'off');
      $('<div>',{class:'promo-row','data-promo-id':p.id}).html(
        '<div><p class="promo-row-title">'+resEsc(p.name)+'</p><p class="promo-row-desc">'+resEsc(p.desc||'Tidak ada deskripsi.')+'</p></div>'+
        '<div><p class="promo-meta-label">Tipe</p><p class="promo-meta-value">'+resEsc(p.type)+'</p></div>'+
        '<div><p class="promo-meta-label">Periode</p><p class="promo-meta-value">'+promoDate(p.start)+' – '+promoDate(p.end)+'</p></div>'+
        '<div><span class="promo-value-pill">'+resEsc(p.value||'—')+'</span><div style="margin-top:7px"><span class="promo-status '+cls+'">'+status+'</span></div></div>'+
        '<div class="promo-website-wrap"><button type="button" class="mini-switch '+(p.website?'is-on':'')+'" role="switch" aria-checked="'+(p.website?'true':'false')+'" data-promo-toggle-web="'+p.id+'"><span></span></button><small>Website</small></div>'+
        '<button type="button" class="promo-edit-btn" data-promo-edit="'+p.id+'" aria-label="Edit promo"><i data-lucide="pencil" class="u-size-4"></i></button>'
      ).appendTo($list);
    });
    lucide.createIcons();
  }

  function openPromoEditor(id) {
    const isNew=!id;
    const p=isNew?{id:'',name:'',type:'Diskon Persen',value:'',start:PROMO_TODAY,end:'2026-10-05',active:true,website:true,desc:''}:getPromo(id);
    if(!p) return;
    $('#promo-editor-title').text(isNew?'Tambah Promo':'Edit Promo');
    $('#promo-form-id').val(p.id);
    $('#promo-form-name').val(p.name);
    $('#promo-form-type').val(p.type);
    $('#promo-form-value').val(p.value);
    $('#promo-form-start').val(p.start);
    $('#promo-form-end').val(p.end);
    $('#promo-form-desc').val(p.desc||'');
    $('#promo-desc-count').text((p.desc||'').length);
    syncAllUnifiedSelects();
    $('#promo-form-active').prop('checked',!!p.active);
    $('#promo-form-website').prop('checked',!!p.website);
    $('#promo-delete').toggleClass('hidden-page',isNew);
    $('#promo-editor').removeClass('hidden-page');
    const $panel=$('#promo-editor-panel').removeClass('anim-slide');void $panel[0].offsetWidth;$panel.addClass('anim-slide');
    lucide.createIcons();
  }

  function closePromoEditor(){ $('#promo-editor').addClass('hidden-page'); }

  function savePromoEditor(){
    const name=$('#promo-form-name').val().trim(), start=$('#promo-form-start').val(), end=$('#promo-form-end').val();
    if(!name||!start||!end){showToast('Nama promo dan periode wajib diisi.');return;}
    if(end<start){showToast('Tanggal berakhir tidak boleh sebelum tanggal mulai.');return;}
    const payload={
      name:name,type:$('#promo-form-type').val(),value:$('#promo-form-value').val().trim(),start:start,end:end,
      active:$('#promo-form-active').is(':checked'),website:$('#promo-form-website').is(':checked'),desc:$('#promo-form-desc').val().trim()
    };
    const id=$('#promo-form-id').val();
    if(id){const p=getPromo(id);if(!p)return;Object.assign(p,payload);showToast('Promo berhasil diperbarui.');}
    else{const next=PROMO_DATA.reduce(function(max,p){return Math.max(max,Number(p.id.replace(/\D/g,''))||0);},0)+1;PROMO_DATA.push(Object.assign({id:'PR-'+String(next).padStart(3,'0')},payload));showToast('Promo baru berhasil ditambahkan.');}
    savePromoData();renderPromoPage();closePromoEditor();
  }

  function deletePromoEditor(){
    const id=$('#promo-form-id').val(),p=getPromo(id);if(!p)return;
    PROMO_DATA=PROMO_DATA.filter(function(x){return x.id!==id;});savePromoData();renderPromoPage();closePromoEditor();showToast('Promo dihapus.');
  }


  /* ---------------- Unified form selects ---------------- */
  function unifiedSelectValueLabel($select) {
    const $opt = $select.find('option:selected');
    return $opt.length ? $opt.text() : '';
  }

  function syncUnifiedSelect($select) {
    if (!$select || !$select.length) return;
    const $wrap = $select.closest('.unified-select');
    if (!$wrap.length) return;
    const value = String($select.val() == null ? '' : $select.val());
    const label = unifiedSelectValueLabel($select);
    const $label = $wrap.find('.unified-select-label');
    $label.text(label || 'Pilih opsi').toggleClass('unified-select-placeholder', !value);
    $wrap.find('.unified-select-option').each(function () {
      const active = String($(this).attr('data-value')) === value;
      $(this).toggleClass('is-active', active).attr('aria-selected', active ? 'true' : 'false');
      $(this).find('.unified-select-check').toggleClass('hidden-page', !active);
    });
  }

  function syncAllUnifiedSelects() {
    $('select.unified-native').each(function () { syncUnifiedSelect($(this)); });
  }

  function closeUnifiedSelects(except) {
    $('.unified-select.is-open').each(function () {
      if (except && this === except) return;
      $(this).removeClass('is-open');
      $(this).find('.unified-select-trigger').attr('aria-expanded', 'false');
    });
  }

  function initUnifiedSelects() {
    $('select').each(function () {
      const $select = $(this);
      if ($select.hasClass('unified-native') || $select.closest('.unified-select').length) return;

      // Semua select yang tersisa adalah select di form/editor. Filter utama sudah
      // menggunakan komponen custom data-dropdown sendiri.
      const wasRequired = $select.is('[required]');
      if (wasRequired) $select.attr('data-was-required', 'true').removeAttr('required');
      $select.addClass('unified-native').attr({'tabindex':'-1','aria-hidden':'true'});

      $select.wrap('<div class="unified-select"></div>');
      const $wrap = $select.parent();
      const uid = ($select.attr('id') || ('select-' + Math.random().toString(36).slice(2,8))) + '-listbox';
      const $trigger = $('<button>', {
        type:'button',
        class:'unified-select-trigger',
        'aria-haspopup':'listbox',
        'aria-expanded':'false',
        'aria-controls':uid
      }).append('<span class="unified-select-label"></span><i data-lucide="chevron-down" class="unified-select-chevron"></i>');
      const $menu = $('<div>', {id:uid,class:'unified-select-menu',role:'listbox'});

      $select.find('option').each(function () {
        const value = String($(this).attr('value') == null ? $(this).text() : $(this).attr('value'));
        const text = $(this).text();
        $('<button>', {
          type:'button',
          class:'unified-select-option',
          role:'option',
          'data-value':value,
          'aria-selected':'false'
        }).append($('<span>').text(text)).append('<span class="unified-select-check hidden-page">✓</span>').appendTo($menu);
      });

      $select.after($trigger, $menu);
      syncUnifiedSelect($select);

      $trigger.on('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        const willOpen = !$wrap.hasClass('is-open');
        closeUnifiedSelects($wrap[0]);
        $wrap.toggleClass('is-open', willOpen);
        $trigger.attr('aria-expanded', willOpen ? 'true' : 'false');
        if (willOpen) {
          const $active = $menu.find('.unified-select-option.is-active').first();
          ($active.length ? $active : $menu.find('.unified-select-option').first()).trigger('focus');
        }
      });

      $menu.on('click', '.unified-select-option', function (e) {
        e.preventDefault(); e.stopPropagation();
        const value = String($(this).attr('data-value'));
        $select.val(value).trigger('change');
        syncUnifiedSelect($select);
        $wrap.removeClass('is-open');
        $trigger.attr('aria-expanded','false').trigger('focus');
      });

      $menu.on('keydown', '.unified-select-option', function (e) {
        const $opts = $menu.find('.unified-select-option');
        const idx = $opts.index(this);
        if (e.key === 'ArrowDown') { e.preventDefault(); $opts.eq((idx + 1) % $opts.length).trigger('focus'); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); $opts.eq((idx - 1 + $opts.length) % $opts.length).trigger('focus'); }
        else if (e.key === 'Escape') { e.preventDefault(); $wrap.removeClass('is-open'); $trigger.attr('aria-expanded','false').trigger('focus'); }
        else if (e.key === 'Tab') { $wrap.removeClass('is-open'); $trigger.attr('aria-expanded','false'); }
      });
    });

    $(document).on('click.unifiedSelect', function () { closeUnifiedSelects(); });
    $(document).on('keydown.unifiedSelect', function (e) { if (e.key === 'Escape') closeUnifiedSelects(); });
    if (window.lucide) lucide.createIcons();
  }

  /* ---------------- Render: dropdown menus ---------------- */
  function renderMenus() {
    $.each(DROPDOWN_OPTIONS, function (key, options) {
      const config = DROPDOWN_CONFIG[key];
      const $menu = $('[data-menu="' + key + '"]').empty();
      if (!config || !$menu.length) return;

      const currentValue = state[config.scope][config.field];
      $.each(options, function (_, opt) {
        const active = currentValue === opt;
        $('<button>', {
          class: 'menu-opt d-flex w-100 align-items-center justify-content-between u-rounded-lg u-px-3 u-py-2 text-start u-text-sm' + (active ? ' is-active' : ''),
          type: 'button',
          role: 'menuitemradio',
          'aria-checked': active ? 'true' : 'false'
        })
          .css({ color: active ? '#8b1e1e' : '#3b1f14', fontWeight: active ? '500' : '400', background: active ? 'rgba(139,30,30,.08)' : 'transparent' })
          .html('<span>' + dropdownLabel(key, opt) + '</span>' + (active ? '<span class="menu-check">✓</span>' : ''))
          .on('click', function (e) {
            e.stopPropagation();
            const changed = state[config.scope][config.field] !== opt;
            state[config.scope][config.field] = opt;
            swapLabel($('[data-label="' + key + '"]'), dropdownLabel(key, opt));

            if (changed && key === 'tahun') setChartYear(opt);
            if (changed && config.scope === 'orderFilters') renderFullOrders();
            if (changed && config.scope === 'menuFilters') renderMenuPage();
            if (changed && config.scope === 'reservationFilters') renderReservationPage();
            if (changed && config.scope === 'cateringFilters') renderCateringPage();
            if (changed && config.scope === 'reportFilters') renderReportPage();

            closeDropdown();
            renderMenus();
          })
          .appendTo($menu);
      });
    });
  }

  /* ---------------- Dropdown logic ---------------- */
  function openDropdown(key) {
    closeDropdown();
    state.openDropdown = key;
    const $menu = $('[data-menu="' + key + '"]').removeClass('closing').addClass('open');
    // Angkat kartu induk di atas backdrop z-40 supaya z-50 menu bekerja.
    $menu.closest('.reveal').addClass('menu-host-active');
    $('#overlay').removeClass('hidden-page').addClass('anim-fade');
  }
  function closeDropdown() {
    state.openDropdown = null;
    $('#overlay').addClass('hidden-page');
    const $open = $('[data-menu].open').first();
    if (!$open.length) { $('.menu-host-active').removeClass('menu-host-active'); return; }
    const $host = $open.closest('.reveal');
    const finish = function () {
      if ($open.hasClass('open')) return; // dibuka lagi saat exit — biarkan
      $open.removeClass('closing');
      if ($host.length && !$('[data-menu].open').length) $host.removeClass('menu-host-active');
    };
    $open.removeClass('open');
    if (reduceMotion) { finish(); return; }
    $open.addClass('closing').one('animationend', finish); // closing menjaga display:block selama animasi keluar
  }

  /* ---------------- Notification modal ---------------- */
  function renderNotif() {
    const $list = $('#notif-list').empty();
    $.each(NOTIFICATIONS, function (_, n) {
      $('<div>', { class: 'd-flex u-cursor-pointer u-gap-3 u-rounded-xl u-border u-border-solid u-p-3 u-transition-colors u-hover-bg-cream' })
        .css('borderColor', 'rgba(59,31,20,.08)')
        .html(
          '<span class="u-mt-1 u-size-2 flex-shrink-0 rounded-pill" style="background:' + n[3] + '"></span>' +
          '<div class="d-flex u-flex-1 flex-column u-gap-0-5">' +
            '<p class="u-text-sm fw-medium u-leading-5 u-text-ink">' + n[0] + '</p>' +
            '<p class="u-text-xs u-leading-4 ink60">' + n[1] + '</p>' +
            '<p class="u-mt-0-5 u-text-xs u-leading-4 ink40">' + n[2] + '</p>' +
          '</div>'
        )
        .appendTo($list);
    });
  }
  function openNotif() {
    $('#notif').removeClass('hidden-page');
    const $panel = $('#notif-panel').removeClass('anim-slide'); // ulangi slide drawer tiap dibuka
    void $panel[0].offsetWidth; // reflow
    $panel.addClass('anim-slide');
  }
  function closeNotif() { $('#notif').addClass('hidden-page'); }


  /* ---------------- Pengaturan ---------------- */
  function settingsInitials(name) {
    const parts=String(name||'Admin Utama').trim().split(/\s+/).filter(Boolean);
    return (parts.slice(0,2).map(function(x){return x.charAt(0);}).join('')||'AU').toUpperCase();
  }
  function saveSettingsData(){
    try { localStorage.setItem('lamak-bana-settings',JSON.stringify(SETTINGS_DATA)); } catch(e) {}
  }
  function applySettingsToShell(){
    $('#sidebar-admin-name').text(SETTINGS_DATA.adminName||'Admin Utama');
    $('#sidebar-admin-role').text(SETTINGS_DATA.adminRole||'Super Admin');
    $('#sidebar-admin-initials').text(settingsInitials(SETTINGS_DATA.adminName));
  }
  function renderSettingsPage(){
    $('#settings-admin-name').val(SETTINGS_DATA.adminName);
    $('#settings-admin-role').val(SETTINGS_DATA.adminRole);
    $('#settings-admin-email').val(SETTINGS_DATA.adminEmail);
    $('#settings-store-name').val(SETTINGS_DATA.storeName);
    $('#settings-store-phone').val(SETTINGS_DATA.storePhone);
    $('#settings-store-city').val(SETTINGS_DATA.storeCity);
    $('#settings-store-address').val(SETTINGS_DATA.storeAddress);
    $('#settings-weekday-open').val(SETTINGS_DATA.weekdayOpen);
    $('#settings-weekday-close').val(SETTINGS_DATA.weekdayClose);
    $('#settings-weekend-open').val(SETTINGS_DATA.weekendOpen);
    $('#settings-weekend-close').val(SETTINGS_DATA.weekendClose);
    $('#settings-notif-order').prop('checked',!!SETTINGS_DATA.notifOrder);
    $('#settings-notif-reservation').prop('checked',!!SETTINGS_DATA.notifReservation);
    $('#settings-notif-catering').prop('checked',!!SETTINGS_DATA.notifCatering);
    $('#settings-notif-stock').prop('checked',!!SETTINGS_DATA.notifStock);
    const initials=settingsInitials(SETTINGS_DATA.adminName);
    $('#settings-avatar').text(initials);
    $('#settings-preview-name').text(SETTINGS_DATA.adminName||'Admin Utama');
    $('#settings-preview-role').text(SETTINGS_DATA.adminRole||'Super Admin');
    syncAllUnifiedSelects();
    applySettingsToShell();
  }
  function collectSettings(){
    const name=$('#settings-admin-name').val().trim();
    const store=$('#settings-store-name').val().trim();
    const wo=$('#settings-weekday-open').val(), wc=$('#settings-weekday-close').val();
    const eo=$('#settings-weekend-open').val(), ec=$('#settings-weekend-close').val();
    if(!name || !store){ showToast('Nama admin dan nama restoran wajib diisi.'); return false; }
    if(!wo||!wc||!eo||!ec){ showToast('Lengkapi jam operasional.'); return false; }
    if(wc<=wo || ec<=eo){ showToast('Jam tutup harus lebih akhir dari jam buka.'); return false; }
    SETTINGS_DATA={
      adminName:name, adminRole:$('#settings-admin-role').val(), adminEmail:$('#settings-admin-email').val().trim(),
      storeName:store, storePhone:$('#settings-store-phone').val().trim(), storeCity:$('#settings-store-city').val().trim(), storeAddress:$('#settings-store-address').val().trim(),
      weekdayOpen:wo, weekdayClose:wc, weekendOpen:eo, weekendClose:ec,
      notifOrder:$('#settings-notif-order').is(':checked'), notifReservation:$('#settings-notif-reservation').is(':checked'),
      notifCatering:$('#settings-notif-catering').is(':checked'), notifStock:$('#settings-notif-stock').is(':checked')
    };
    saveSettingsData(); applySettingsToShell(); renderSettingsPage();
    showToast('Pengaturan berhasil disimpan.');
    return true;
  }

  /* ---------------- Navigation ---------------- */
  function navigate(page) {
    state.page = page;
    closeDropdown();
    $('#page-title').text(page.toUpperCase());
    const isDash = page === 'Dashboard';
    const isOrders = page === 'Pesanan';
    const isMenu = page === 'Menu Makanan';
    const isReservation = page === 'Reservasi';
    const isCatering = page === 'Katering';
    const isLap = page === 'Laporan';
    const isPromo = page === 'Promo';
    const isHelp = page === 'Bantuan';
    const isSettings = page === 'Pengaturan';
    $('#page-dashboard').toggleClass('hidden-page', !isDash);
    $('#page-pesanan').toggleClass('hidden-page', !isOrders);
    $('#page-menu').toggleClass('hidden-page', !isMenu);
    $('#page-reservasi').toggleClass('hidden-page', !isReservation);
    $('#page-katering').toggleClass('hidden-page', !isCatering);
    $('#page-laporan').toggleClass('hidden-page', !isLap);
    $('#page-promo').toggleClass('hidden-page', !isPromo);
    $('#page-bantuan').toggleClass('hidden-page', !isHelp);
    $('#page-settings').toggleClass('hidden-page', !isSettings);
    $('#page-placeholder').toggleClass('hidden-page', isDash || isOrders || isMenu || isReservation || isCatering || isLap || isPromo || isHelp || isSettings);
    $('#dashboard-quick-actions').toggleClass('hidden-page', !isDash);
    if (isDash) requestAnimationFrame(function () { buildLineChart('#linechart-dash'); });
    if (isOrders) renderFullOrders();
    if (isMenu) renderMenuPage();
    if (isReservation) renderReservationPage();
    if (isCatering) renderCateringPage();
    if (isLap) renderReportPage();
    if (isPromo) renderPromoPage();
    if (isSettings) renderSettingsPage();
    if (!isDash && !isOrders && !isMenu && !isReservation && !isCatering && !isLap && !isPromo && !isHelp && !isSettings) {
      $('#placeholder-title').text(page.toUpperCase());
      $('#placeholder-sub').text('Halaman ' + page + ' — pilih “Dashboard” di sidebar untuk kembali ke beranda.');
    }
    renderSidebar();
    lucide.createIcons();
  }

  /* ---------------- Wiring ---------------- */
  function wire() {
    // Sidebar + ikon pengaturan (delegasi event)
    $('body').on('click', '[data-nav]', function () { navigate($(this).attr('data-nav')); });
    // Tombol dropdown
    $('[data-dropdown]').on('click', function (e) {
      e.stopPropagation();
      const key = $(this).attr('data-dropdown');
      if (state.openDropdown === key) closeDropdown();
      else openDropdown(key);
    });
    // Overlay menutup dropdown
    $('#overlay').on('click', closeDropdown);
    // Notifikasi
    $('#btn-notif').on('click', openNotif);
    $('#notif-close').on('click', closeNotif);
    $('#notif').on('click', function (e) { if (e.target.id === 'notif') closeNotif(); });
    // Dashboard operasional
    $('#page-dashboard').on('click', '.dash-status-item, .ops-metric[data-dashboard-status]', function () {
      const status = $(this).attr('data-dashboard-status');
      state.orderFilters.status = status;
      renderFullOrders();
      renderMenus();
      navigate('Pesanan');
    });
    $('#page-dashboard').on('click', '.attention-item, [data-attention-nav]', function () {
      const target = $(this).attr('data-attention-nav');
      const status = $(this).attr('data-attention-status');
      if (status) {
        state.orderFilters.status = status;
        renderFullOrders();
        renderMenus();
      }
      if (target) navigate(target);
    });
    $('[data-quick-action]').on('click', function (e) {
      e.stopPropagation();
      const target = $(this).attr('data-quick-action');
      closeDropdown();
      if (target === 'Pesanan') {
        navigate('Pesanan');
        openOrderEditor();
      } else if (target === 'Reservasi') {
        navigate('Reservasi');
        openReservationEditor();
      } else if (target === 'Katering') {
        navigate('Katering');
        openCateringEditor();
      } else {
        navigate(target);
      }
    });

    // Halaman Pesanan
    $('#order-search').on('input', function () {
      state.orderFilters.search = $(this).val();
      renderFullOrders();
    });
    $('#order-tabs').on('click', '.order-tab', function () {
      state.orderFilters.status = $(this).attr('data-status');
      renderFullOrders();
    });
    $('#page-pesanan').on('click', '.order-stat-card', function () {
      state.orderFilters.status = $(this).attr('data-order-status');
      renderFullOrders();
      document.getElementById('orders-full').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block:'start' });
    });
    $('#order-reset').on('click', function () {
      state.orderFilters = { status:'Semua', channel:'Semua', date:'Hari ini', search:'' };
      $('#order-search').val('');
      swapLabel($('[data-label="order-channel"]'), dropdownLabel('order-channel', 'Semua'));
      swapLabel($('[data-label="order-date"]'), dropdownLabel('order-date', 'Hari ini'));
      renderFullOrders();
      renderMenus();
    });
    $('#orders-full').on('click', '.order-full-row', function (e) {
      openOrderDetail($(this).attr('data-order-id'));
    }).on('keydown', '.order-full-row', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openOrderDetail($(this).attr('data-order-id')); }
    });
    $('#order-detail-close').on('click', closeOrderDetail);
    $('#order-detail').on('click', function (e) { if (e.target.id === 'order-detail') closeOrderDetail(); });
    $('#order-detail-actions').on('click', '#btn-advance-order', function () {
      const order = getOrder($('#order-detail').data('order-id'));
      advanceOrder(order);
    }).on('click', '#btn-cancel-order', function () {
      const order = getOrder($('#order-detail').data('order-id'));
      if (!order) return;
      order.status = 'Dibatalkan';
      order.timeline.push([new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}).replace('.',':'), 'Pesanan dibatalkan']);
      saveOrderData();
      renderOrders();
      renderFullOrders();
      renderOrderDetail(order);
      showToast(order.id + ' dibatalkan.');
    }).on('click', '#btn-close-completed', closeOrderDetail);
    $('#btn-new-order').on('click', function () {
      openOrderEditor();
    });
    $('body').on('click', '.order-create-close', function () { closeOrderEditor(); });
    $('body').on('click', '#order-create-modal', function (e) { if (e.target.id === 'order-create-modal') closeOrderEditor(); });
    $('body').on('click', '#order-add-item', function () { addOrderEditorItem(); });
    $('body').on('click', '.order-editor-item-remove', function () {
      const $rows = $('#order-editor-items .order-editor-item');
      if ($rows.length <= 1) { showToast('Minimal satu baris menu harus tersedia.'); return; }
      $(this).closest('.order-editor-item').remove();
      updateOrderEditorTotal();
    });
    $('body').on('change input', '.order-editor-item-menu, .order-editor-item-qty', function () { updateOrderEditorTotal(); });
    $('body').on('submit', '#order-create-form', function (e) { e.preventDefault(); saveNewOrder(); });


    // Halaman Reservasi
    $('#reservation-search').on('input', function () { state.reservationFilters.search = $(this).val(); renderReservationPage(); });
    $('#reservation-tabs').on('click', '.reservation-tab', function () { state.reservationFilters.status = $(this).attr('data-status'); renderReservationPage(); });
    $('#page-reservasi').on('click', '.reservation-stat-card', function () {
      state.reservationFilters.status = $(this).attr('data-reservation-status') || 'Semua';
      state.reservationFilters.date = 'Hari ini';
      swapLabel($('[data-label="reservation-date"]'), 'Hari ini');
      renderReservationPage(); renderMenus();
      document.getElementById('reservation-rows').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block:'center' });
    });
    $('#reservation-reset').on('click', function () {
      state.reservationFilters = { status:'Semua', source:'Semua', date:'Hari ini', search:'' };
      $('#reservation-search').val('');
      swapLabel($('[data-label="reservation-source"]'), 'Semua Sumber');
      swapLabel($('[data-label="reservation-date"]'), 'Hari ini');
      renderReservationPage(); renderMenus();
    });
    $('#reservation-rows, #reservation-agenda').on('click', '[data-reservation-id]', function () { openReservationDetail($(this).attr('data-reservation-id')); });
    $('#reservation-rows').on('keydown', '.reservation-row', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openReservationDetail($(this).attr('data-reservation-id')); } });
    $('#btn-add-reservation').on('click', function () { openReservationEditor(); });
    $('#reservation-detail-close').on('click', closeReservationDetail);
    $('#reservation-detail').on('click', function (e) { if (e.target.id === 'reservation-detail') closeReservationDetail(); });
    $('#reservation-detail-body, #reservation-detail-actions').on('click', '[data-reservation-edit]', function () {
      const id = $('#reservation-detail').data('reservation-id'); closeReservationDetail(); openReservationEditor(id);
    });
    $('#reservation-detail-actions').on('click', '#btn-advance-reservation', function () { advanceReservation(getReservation($('#reservation-detail').data('reservation-id'))); })
      .on('click', '#btn-cancel-reservation', function () { cancelReservation(getReservation($('#reservation-detail').data('reservation-id'))); })
      .on('click', '#btn-close-reservation', closeReservationDetail);
    $('#reservation-editor-close, #reservation-editor-cancel').on('click', closeReservationEditor);
    $('#reservation-editor').on('click', function (e) { if (e.target.id === 'reservation-editor') closeReservationEditor(); });
    $('#reservation-save').on('click', saveReservationEditor);
    $('#reservation-form-note').on('input', function () { $('#reservation-note-count').text($(this).val().length); });




    // Halaman Katering
    $('#catering-search').on('input', function () { state.cateringFilters.search = $(this).val(); renderCateringPage(); });
    $('#catering-tabs').on('click', '.catering-tab', function () { state.cateringFilters.status = $(this).attr('data-status'); renderCateringPage(); });
    $('#page-katering').on('click', '.catering-stat-card', function () {
      const status=$(this).attr('data-catering-status')||'Semua';
      state.cateringFilters.status=status;
      state.cateringFilters.date='7 hari';
      swapLabel($('[data-label="catering-date"]'),'7 hari ke depan');
      renderCateringPage(); renderMenus();
      document.getElementById('catering-rows').scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'center'});
    });
    $('#catering-reset').on('click', function () {
      state.cateringFilters={status:'Semua',service:'Semua',date:'7 hari',search:''}; $('#catering-search').val('');
      swapLabel($('[data-label="catering-service"]'),'Semua Layanan'); swapLabel($('[data-label="catering-date"]'),'7 hari ke depan'); renderCateringPage(); renderMenus();
    });
    $('#catering-rows, #catering-agenda').on('click','[data-catering-id]',function(){ openCateringDetail($(this).attr('data-catering-id')); });
    $('#catering-rows').on('keydown','.catering-row',function(e){ if(e.key==='Enter'||e.key===' '){e.preventDefault();openCateringDetail($(this).attr('data-catering-id'));} });
    $('#btn-add-catering').on('click',function(){ openCateringEditor(); });
    $('#catering-detail-close').on('click',closeCateringDetail);
    $('#catering-detail').on('click',function(e){ if(e.target.id==='catering-detail') closeCateringDetail(); });
    $('#catering-detail-body, #catering-detail-actions').on('click','[data-catering-edit]',function(){ const id=$('#catering-detail').data('catering-id'); closeCateringDetail(); openCateringEditor(id); });
    $('#catering-detail-actions').on('click','#btn-advance-catering',function(){ advanceCatering(getCatering($('#catering-detail').data('catering-id'))); })
      .on('click','#btn-cancel-catering',function(){ cancelCatering(getCatering($('#catering-detail').data('catering-id'))); })
      .on('click','#btn-close-catering',closeCateringDetail);
    $('#catering-editor-close, #catering-editor-cancel').on('click',closeCateringEditor);
    $('#catering-editor').on('click',function(e){ if(e.target.id==='catering-editor') closeCateringEditor(); });
    $('#catering-save').on('click',saveCateringEditor);
    $('#catering-form-note').on('input',function(){ $('#catering-note-count').text($(this).val().length); });


    // Halaman Pengaturan
    $('#settings-save').on('click', collectSettings);
    $('#settings-reset').on('click', function(){
      SETTINGS_DATA=Object.assign({},SETTINGS_DEFAULT); saveSettingsData(); renderSettingsPage(); showToast('Pengaturan dikembalikan ke default.');
    });
    $('#settings-admin-name, #settings-admin-role').on('input change', function(){
      const n=$('#settings-admin-name').val().trim()||'Admin Utama';
      $('#settings-avatar').text(settingsInitials(n)); $('#settings-preview-name').text(n); $('#settings-preview-role').text($('#settings-admin-role').val());
    });

    // Halaman Bantuan
    $('#help-faq').on('click', '.help-faq-question', function () {
      const $item=$(this).closest('.help-faq-item');
      const willOpen=!$item.hasClass('is-open');
      $('#help-faq .help-faq-item').removeClass('is-open').find('.help-faq-question').attr('aria-expanded','false');
      if(willOpen){$item.addClass('is-open');$(this).attr('aria-expanded','true');}
    });
    $('#help-search').on('input', function () {
      const q=$(this).val().trim().toLowerCase();
      let visibleFaq=0;
      $('#help-guide-grid .help-guide-card').each(function(){
        const text=($(this).text()+' '+($(this).attr('data-help-keywords')||'')).toLowerCase();
        $(this).toggleClass('hidden-help', !!q && text.indexOf(q)===-1);
      });
      $('#help-faq .help-faq-item').each(function(){
        const text=($(this).text()+' '+($(this).attr('data-help-keywords')||'')).toLowerCase();
        const show=!q || text.indexOf(q)!==-1;
        $(this).toggleClass('hidden-help', !show);
        if(show) visibleFaq++;
      });
      $('#help-no-result').toggleClass('hidden-page', visibleFaq>0 || !q);
    });
    $('#help-message').on('input', function(){ $('#help-message-count').text($(this).val().length); });
    $('#help-form').on('submit', function(e){
      e.preventDefault();
      if(!$('#help-category').val() || !$('#help-subject').val().trim() || !$('#help-message').val().trim()){
        showToast('Lengkapi kategori, judul, dan detail kendala.'); return;
      }
      showToast('Pertanyaan berhasil dicatat pada prototype.');
      this.reset(); syncAllUnifiedSelects(); $('#help-message-count').text('0');
    });

    // Halaman Laporan
    $('#report-apply-range').on('click', function () {
      const from=$('#report-date-from').val(), to=$('#report-date-to').val();
      if(!from||!to){showToast('Pilih tanggal awal dan akhir laporan.');return;}
      if(new Date(to+'T00:00:00')<new Date(from+'T00:00:00')){showToast('Tanggal akhir tidak boleh lebih awal dari tanggal mulai.');return;}
      state.reportFilters.dateFrom=from;state.reportFilters.dateTo=to;renderReportPage();showToast('Rentang laporan diperbarui.');
    });
    $('#report-export-excel').on('click', exportReportExcel);
    $('#report-print').on('click', function(){ window.print(); });


    // Halaman Promo
    $('#btn-add-promo').on('click',function(){openPromoEditor();});
    $('#promo-tabs').on('click','.promo-tab',function(){state.promoFilters.status=$(this).attr('data-promo-status');renderPromoPage();});
    $('#promo-list').on('click','[data-promo-edit]',function(){openPromoEditor($(this).attr('data-promo-edit'));})
      .on('click','[data-promo-toggle-web]',function(e){e.stopPropagation();const p=getPromo($(this).attr('data-promo-toggle-web'));if(!p)return;p.website=!p.website;savePromoData();renderPromoPage();showToast(p.website?'Promo ditampilkan di website.':'Promo disembunyikan dari website.');});
    $('#promo-editor-close').on('click',closePromoEditor);
    $('#promo-editor').on('click',function(e){if(e.target.id==='promo-editor')closePromoEditor();});
    $('#promo-save').on('click',savePromoEditor);
    $('#promo-delete').on('click',deletePromoEditor);
    $('#promo-form-desc').on('input',function(){$('#promo-desc-count').text($(this).val().length);});


    // Halaman Menu Makanan
    $('#menu-search').on('input', function () { state.menuFilters.search = $(this).val(); renderMenuPage(); });
    $('#menu-reset').on('click', function () {
      state.menuFilters = { category:'Semua', search:'' };
      $('#menu-search').val('');
      swapLabel($('[data-label="menu-category"]'), 'Semua Kategori');
      renderMenuPage(); renderMenus();
    });
    $('#btn-add-menu').on('click', function () { openMenuEditor(); });
    $('#btn-preview-menu').on('click', openMenuPreview);
    $('#menu-catalog').on('click', '[data-menu-edit]', function (e) { e.stopPropagation(); openMenuEditor($(this).attr('data-menu-edit')); });
    $('#menu-catalog').on('click', '[data-menu-toggle-available]', function () {
      const m = getMenuItem($(this).attr('data-menu-toggle-available')); if (!m) return;
      m.available = !m.available; if (m.available && m.stock === 0) m.stock = 1;
      saveMenuData(); renderMenuPage(); showToast(m.name + (m.available ? ' tersedia.' : ' ditandai tidak tersedia.'));
    });
    $('#menu-catalog').on('click', '[data-menu-toggle-web]', function () {
      const m = getMenuItem($(this).attr('data-menu-toggle-web')); if (!m) return;
      m.website = !m.website; saveMenuData(); renderMenuPage();
      showToast(m.name + (m.website ? ' ditampilkan di website.' : ' disembunyikan dari website.'));
    });
    $('#menu-editor-close').on('click', closeMenuEditor);
    $('#menu-editor').on('click', function (e) { if (e.target.id === 'menu-editor') closeMenuEditor(); });
    $('#menu-save').on('click', saveMenuEditor);
    $('#menu-delete').on('click', deleteMenuEditor);
    $('#menu-form-desc').on('input', function () { $('#menu-desc-count').text($(this).val().length); });
    $('#btn-menu-photo').on('click', function () { showToast('Upload foto siap dihubungkan ke penyimpanan backend pada tahap integrasi website.'); });
    $('#menu-preview-close').on('click', closeMenuPreview);
    $('#menu-preview').on('click', function (e) { if (e.target.id === 'menu-preview') closeMenuPreview(); });

    // Escape
    $(window).on('keydown', function (e) {
      if (e.key === 'Escape') { closeDropdown(); closeNotif(); closeOrderDetail(); closeMenuEditor(); closeMenuPreview(); closeReservationDetail(); closeReservationEditor(); closeCateringDetail(); closeCateringEditor(); }
    });
  }

  /* ---------------- Line Chart ---------------- */
  const LC = {
    // 30 titik harian — Seri 1 (utama) & Seri 2 (pembanding)
    main: [1000,1250,1180,1600,1720,1420,1620,1980,1880,2100,1600,1720,1400,1900,1650,1720,1480,1880,1950,2280,2500,2000,2250,2000,2250,1900,2100,1950,2280,2500],
    comp: [ 500, 560, 480, 620, 560, 700, 820, 760, 950, 760, 640, 720, 500, 700, 620, 900, 720, 840, 700, 980,1200,1150,1300,1250,1350,1150,1300,1200,1450,1500],
    MAX: 3000,
  };

  // Dataset per tahun diturunkan dari kurva dasar (ganti Tahun = ganti data).
  const YEAR_BASE = { main: LC.main.slice(), comp: LC.comp.slice() };
  const YEAR_FACTOR = { '2026': 1, '2025': 0.88, '2024': 0.76, '2023': 0.64 };
  function dataForYear(year) {
    const f = YEAR_FACTOR[year] || 1;
    const ph = Number(year) % 7;
    const clamp = function (v) { return Math.max(0, Math.min(LC.MAX, Math.round(v))); };
    return {
      main: YEAR_BASE.main.map(function (v, i) { return clamp(v * f + Math.sin(i * 0.6 + ph) * 90); }),
      comp: YEAR_BASE.comp.map(function (v, i) { return clamp(v * f * 0.95 + Math.cos(i * 0.5 + ph) * 60); }),
    };
  }

  // Morph grafik yang terlihat dari data sekarang ke data tahun target.
  let lcTween = null;
  function setChartYear(year) {
    const target = dataForYear(year);
    const mounts = $.map(['#linechart-dash', '#linechart'], function (s) {
      const $m = $(s);
      return $m.length && $m.data('lc') ? $m : null;
    });
    const commit = function () { $.each(mounts, function (_, $m) { $m.data('lc').apply(LC.main, LC.comp); }); };
    if (reduceMotion || !mounts.length) {
      LC.main = target.main; LC.comp = target.comp; commit(); return;
    }
    const from = { main: LC.main.slice(), comp: LC.comp.slice() };
    if (lcTween) cancelAnimationFrame(lcTween);
    const D = 560, t0 = performance.now();
    const ease = function (t) { return 1 - Math.pow(1 - t, 3); }; // cubic ease-out
    (function step(now) {
      const e = ease(Math.min(1, (now - t0) / D));
      LC.main = from.main.map(function (v, i) { return Math.round(v + (target.main[i] - v) * e); });
      LC.comp = from.comp.map(function (v, i) { return Math.round(v + (target.comp[i] - v) * e); });
      commit();
      lcTween = (now - t0) < D ? requestAnimationFrame(step) : null;
    })(t0);
  }

  function fmtVal(v) { return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function fmtDate(mon, day) { return mon + ' ' + day + ', 2018 12:00'; }

  function buildLineChart(sel) {
    const $mount = $(sel);
    if (!$mount.length) return;
    const W = $mount[0].clientWidth || 900;
    const reportScale = sel === '#linechart' ? reportChannelFactor() : 1;
    const chartMain = LC.main.map(function(v){ return Math.round(v * reportScale); });
    const chartComp = LC.comp.map(function(v){ return Math.round(v * reportScale); });
    let H = Math.round($mount[0].clientHeight);
    if (!H || H < 80) H = 460; // fallback (kartu Laporan tinggi tetap)
    const N = chartMain.length;
    const padL = 56, padR = 24, padT = 24, padB = 40;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    const SVGNS = 'http://www.w3.org/2000/svg';

    const xFor = function (i) { return padL + (i / (N - 1)) * plotW; };
    const yFor = function (v) { return padT + (1 - v / LC.MAX) * plotH; };

    // elemen SVG harus dibuat dengan namespace SVG, lalu dibungkus jQuery
    const mk = function (tag, attrs, cls) {
      const $el = $(document.createElementNS(SVGNS, tag));
      if (cls) $el.attr('class', cls);
      return $el.attr(attrs || {});
    };

    $mount.empty();
    const $svg = mk('svg', { viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'none' }, 'lc-svg');

    // gradient di bawah garis utama
    mk('defs').html(
      '<linearGradient id="lcFill" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#111" stop-opacity="0.08"/>' +
      '<stop offset="100%" stop-color="#111" stop-opacity="0"/></linearGradient>'
    ).appendTo($svg);

    // grid horizontal + label y (0..3000 step 500)
    for (let v = 0; v <= LC.MAX; v += 500) {
      const y = yFor(v);
      $svg.append(mk('line', { x1: padL, y1: y, x2: W - padR, y2: y }, 'lc-grid'));
      $svg.append(mk('text', { x: padL - 12, y: y + 4, 'text-anchor': 'end' }, 'lc-ylabel').text(v.toLocaleString('en-US')));
    }
    // label x pada hari 01,03,06,09,...,30
    $.each([0, 2, 5, 8, 11, 14, 17, 20, 23, 26, 29], function (_, i) {
      $svg.append(mk('text', { x: xFor(i), y: H - 14, 'text-anchor': 'middle' }, 'lc-xlabel').text(String(i + 1).padStart(2, '0')));
    });

    const ptsMain = chartMain.map(function (v, i) { return xFor(i) + ',' + yFor(v); });
    const ptsComp = chartComp.map(function (v, i) { return xFor(i) + ',' + yFor(v); });

    // area fill (utama)
    const $area = mk('path', {
      d: 'M ' + xFor(0) + ',' + yFor(chartMain[0]) + ' L ' + ptsMain.join(' L ') + ' L ' + xFor(N - 1) + ',' + yFor(0) + ' L ' + xFor(0) + ',' + yFor(0) + ' Z',
      fill: 'url(#lcFill)', stroke: 'none',
    }).appendTo($svg);

    const $lineComp = mk('polyline', { points: ptsComp.join(' ') }, 'lc-line-comp').appendTo($svg); // putus-putus abu
    const $lineMain = mk('polyline', { points: ptsMain.join(' ') }, 'lc-line-main').appendTo($svg); // hitam solid

    // crosshair + titik aktif
    const $cross = mk('line', { x1: 0, y1: padT, x2: 0, y2: H - padB }, 'lc-crosshair').appendTo($svg);
    const $dotComp = mk('circle', { r: 4.5, fill: '#8f8f8f', stroke: '#fff', 'stroke-width': 2 }, 'lc-dot').appendTo($svg);
    const $dotMain = mk('circle', { r: 4.5, fill: '#111', stroke: '#fff', 'stroke-width': 2 }, 'lc-dot').appendTo($svg);

    // lapisan penangkap pointer
    const $hit = mk('rect', { x: padL, y: padT, width: plotW, height: plotH, fill: 'transparent' }).css('cursor', 'crosshair').appendTo($svg);

    $mount.append($svg);

    // tooltip HTML
    const $tipMain = $('<div>', { class: 'lc-tip lc-tip-main' }).appendTo($mount);
    const $tipComp = $('<div>', { class: 'lc-tip lc-tip-comp' }).appendTo($mount);

    // animasi garis tergambar saat masuk
    if (!reduceMotion) {
      $.each([$lineMain, $lineComp], function (_, $ln) {
        const len = $ln[0].getTotalLength();
        $ln.css('strokeDasharray', $ln === $lineComp ? '5 5' : String(len));
        if ($ln === $lineMain) {
          $ln.css({ strokeDashoffset: String(len), transition: 'stroke-dashoffset 900ms var(--ease-out)' });
          requestAnimationFrame(function () { $ln.css('strokeDashoffset', '0'); });
        } else {
          $ln.css({ opacity: '0', transition: 'opacity 600ms var(--ease-out) 250ms' });
          requestAnimationFrame(function () { $ln.css('opacity', '1'); });
        }
      });
    }

    /* ---- hover mengikuti dengan spring-lerp ---- */
    let targetIdx = -1;
    const cur = { x: xFor(0), ym: yFor(chartMain[0]), yc: yFor(chartComp[0]) };
    let raf = null, active = false;

    function placeTip($tip, x, y) {
      const tw = $tip[0].offsetWidth, th = $tip[0].offsetHeight;
      let left = x + 16;
      if (left + tw > W) left = x - 16 - tw;
      let top = y - th / 2;
      top = Math.max(4, Math.min(H - th - 4, top));
      $tip.css({ left: left + 'px', top: top + 'px' });
    }
    function paint() {
      $cross.attr({ x1: cur.x, x2: cur.x });
      $dotMain.attr({ cx: cur.x, cy: cur.ym });
      $dotComp.attr({ cx: cur.x, cy: cur.yc });
      placeTip($tipMain, cur.x, cur.ym);
      placeTip($tipComp, cur.x, cur.yc);
    }
    function frame() {
      const tx = xFor(targetIdx), tym = yFor(chartMain[targetIdx]), tyc = yFor(chartComp[targetIdx]);
      const k = 0.22; // kekakuan spring
      cur.x += (tx - cur.x) * k;
      cur.ym += (tym - cur.ym) * k;
      cur.yc += (tyc - cur.yc) * k;
      paint();
      const settled = Math.abs(tx - cur.x) < 0.4 && Math.abs(tym - cur.ym) < 0.4 && Math.abs(tyc - cur.yc) < 0.4;
      if (!settled && active) raf = requestAnimationFrame(frame);
      else raf = null;
    }
    function setIndex(i) {
      if (i === targetIdx) return;
      targetIdx = i;
      const day = i + 1;
      $tipMain.html('<div class="lc-tip-time">' + fmtDate('Feb', day) + '</div><div class="lc-tip-val">' + fmtVal(chartMain[i]) + '</div>');
      $tipComp.html('<div class="lc-tip-time">' + fmtDate('Jan', day) + '</div><div class="lc-tip-val">' + fmtVal(chartComp[i]) + '</div>');
      if (reduceMotion) {
        cur.x = xFor(i); cur.ym = yFor(LC.main[i]); cur.yc = yFor(LC.comp[i]);
        paint();
        return;
      }
      if (!raf) raf = requestAnimationFrame(frame);
    }
    function idxFromEvent(e) {
      const r = $svg[0].getBoundingClientRect();
      const px = (e.clientX - r.left) * (W / r.width);
      const i = Math.round(((px - padL) / plotW) * (N - 1));
      return Math.max(0, Math.min(N - 1, i));
    }
    function onMove(e) { active = true; $mount.addClass('lc-hot'); setIndex(idxFromEvent(e)); }
    function onLeave() { active = false; $mount.removeClass('lc-hot'); if (raf) { cancelAnimationFrame(raf); raf = null; } }
    $hit.on('pointermove pointerenter', onMove).on('pointerleave', onLeave);

    // Pembaruan data saja (tanpa render ulang) supaya perubahan tahun mulus.
    $mount.data('lc', {
      apply: function (mainArr, compArr) {
        if (sel === '#linechart') {
          mainArr = mainArr.map(function(v){ return Math.round(v * reportScale); });
          compArr = compArr.map(function(v){ return Math.round(v * reportScale); });
        }
        for (let i=0;i<mainArr.length;i++) chartMain[i]=mainArr[i];
        for (let i=0;i<compArr.length;i++) chartComp[i]=compArr[i];
        const pm = mainArr.map(function (v, i) { return xFor(i) + ',' + yFor(v); });
        const pc = compArr.map(function (v, i) { return xFor(i) + ',' + yFor(v); });
        $lineMain.css('strokeDasharray', 'none'); // lepas mask dash animasi masuk
        $lineMain.attr('points', pm.join(' '));
        $lineComp.attr('points', pc.join(' '));
        $area.attr('d', 'M ' + xFor(0) + ',' + yFor(mainArr[0]) + ' L ' + pm.join(' L ') + ' L ' + xFor(N - 1) + ',' + yFor(0) + ' L ' + xFor(0) + ',' + yFor(0) + ' Z');
        if (targetIdx >= 0) { // sinkronkan nilai tooltip yang sedang terbuka
          $tipMain.find('.lc-tip-val').text(fmtVal(mainArr[targetIdx]));
          $tipComp.find('.lc-tip-val').text(fmtVal(compArr[targetIdx]));
        }
      },
    });
  }

  // render ulang grafik yang sedang terlihat saat ukuran jendela berubah
  let lcResizeTimer = null;
  $(window).on('resize', function () {
    clearTimeout(lcResizeTimer);
    lcResizeTimer = setTimeout(function () {
      if (state.page === 'Dashboard') buildLineChart('#linechart-dash');
      else if (state.page === 'Laporan') buildLineChart('#linechart');
    }, 150);
  });

  /* ---------------- Init ---------------- */
  (function initYearData() {
    const d = dataForYear(state.filters.tahun);
    LC.main = d.main; LC.comp = d.comp;
  })();
  applySettingsToShell();
  initUnifiedSelects();
  renderSidebar();

  renderMenuPage();
  renderReservationPage();
  renderCateringPage();
  renderReportPage();
  renderPromoPage();
  renderMenus();
  renderNotif();

  wire();

  lucide.createIcons();
  requestAnimationFrame(function () { buildLineChart('#linechart-dash'); });

});


// UX Final Polish
(function(){
  const toast = (msg)=>{
    const el=document.getElementById('ux-toast');
    if(!el) return;
    el.textContent=msg;
    el.classList.add('show');
    setTimeout(()=>el.classList.remove('show'),2200);
  };
  window.showUXToast=toast;

  document.querySelectorAll('[data-action]').forEach(btn=>{
    btn.addEventListener('click',()=>toast(btn.dataset.action+' siap dibuat'));
  });

  // confirm destructive actions
  document.addEventListener('click',e=>{
    const t=e.target.closest('[data-danger-action]');
    if(t && !confirm('Apakah Anda yakin ingin melanjutkan tindakan ini?')) e.preventDefault();
  });

  // better save feedback
  document.querySelectorAll('button').forEach(btn=>{
    if(!btn.dataset.feedback && /simpan|save|tambah/i.test(btn.textContent)){
      btn.dataset.feedback='1';
      btn.addEventListener('click',()=>toast('Perubahan berhasil disimpan'));
    }
  });
})();

