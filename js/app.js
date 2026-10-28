/**
 * SMART GROCERY & BUDGET SAFETY TRACKER (TroliRantau)
 * Architecture: Mobile PWA, Ergonomic Touch UI, Realtime Reactive State
 * Multi-Device Sync: Cloud Firestore via onSnapshot() with LocalStorage Fallback
 */

import { 
  listenToActiveSession, 
  saveActiveSessionToFirestore, 
  archiveSessionToFirestore 
} from './firebase-service.js';

let isReceivingRemoteUpdate = false;
let cloudSyncTimeout = null;

// ===================================================================
// CONSTANTS & INITIAL BENCHMARK SEEDS
// ===================================================================

const DEFAULT_BENCHMARK_CATALOG = [
  { id: 'cat-1', name: 'Beras Rojolele', category: 'Bahan Pokok', unit: 'karung/5kg', price: 68000 },
  { id: 'cat-2', name: 'Beras 5kg', category: 'Bahan Pokok', unit: 'kg', price: 68000 },
  { id: 'cat-3', name: 'Telur 1kg', category: 'Bahan Pokok', unit: 'kg', price: 32000 },
  { id: 'cat-4', name: 'Telur Ayam 1kg', category: 'Bahan Pokok', unit: 'kg', price: 32000 },
  { id: 'cat-5', name: 'Garam 500g', category: 'Bahan Pokok', unit: 'pack', price: 5000 },
  { id: 'cat-6', name: 'Minyak Goreng 2L', category: 'Bahan Pokok', unit: 'liter', price: 43000 },
  { id: 'cat-7', name: 'Sabun Cuci', category: 'Kebersihan', unit: 'pack', price: 20000 },
  { id: 'cat-8', name: 'Indomie 5x', category: 'Makanan', unit: 'pack', price: 15000 },
  { id: 'cat-9', name: 'Indomie Goreng (5 pcs)', category: 'Makanan', unit: 'pack', price: 15000 },
  { id: 'cat-10', name: 'Kopi Kapal Api 10x', category: 'Minuman', unit: 'pack', price: 13000 },
  { id: 'cat-11', name: 'Bawang Merah 250g', category: 'Bumbu', unit: 'pack', price: 12000 },
  { id: 'cat-12', name: 'Kecap Manis Bango 520ml', category: 'Bumbu', unit: 'botol', price: 24000 }
];

export const MASTER_PRODUCTS_CATALOG = [
  // 1. BAHAN POKOK (8 Produk)
  {
    id: 'prod-bp-1',
    nama: 'Beras Rojolele Super 5kg',
    kategori: 'Bahan Pokok',
    harga: 74000,
    hargaPromo: 68000,
    isPromo: true,
    isRecommended: true,
    satuan: '@kg'
  },
  {
    id: 'prod-bp-2',
    nama: 'Minyak Goreng Sania 2L',
    kategori: 'Bahan Pokok',
    harga: 43000,
    hargaPromo: 34500,
    isPromo: true,
    isRecommended: true,
    satuan: '@liter'
  },
  {
    id: 'prod-bp-3',
    nama: 'Telur Ayam Negeri 1kg',
    kategori: 'Bahan Pokok',
    harga: 32000,
    hargaPromo: 28000,
    isPromo: true,
    isRecommended: true,
    satuan: '@kg'
  },
  {
    id: 'prod-bp-4',
    nama: 'Gula Pasir Gulaku Premium 1kg',
    kategori: 'Bahan Pokok',
    harga: 18500,
    hargaPromo: null,
    isPromo: false,
    isRecommended: false,
    satuan: '@kg'
  },
  {
    id: 'prod-bp-5',
    nama: 'Tepung Terigu Segitiga Biru 1kg',
    kategori: 'Bahan Pokok',
    harga: 14500,
    hargaPromo: 12500,
    isPromo: true,
    isRecommended: false,
    satuan: '@kg'
  },
  {
    id: 'prod-bp-6',
    nama: 'Minyak Goreng Tropical 2L',
    kategori: 'Bahan Pokok',
    harga: 41000,
    hargaPromo: null,
    isPromo: false,
    isRecommended: false,
    satuan: '@liter'
  },
  {
    id: 'prod-bp-7',
    nama: 'Beras Merah Organik 2kg',
    kategori: 'Bahan Pokok',
    harga: 45000,
    hargaPromo: 39000,
    isPromo: true,
    isRecommended: false,
    satuan: '@pack'
  },
  {
    id: 'prod-bp-8',
    nama: 'Garam Dapur Beriodium Dolpin 500g',
    kategori: 'Bahan Pokok',
    harga: 6500,
    hargaPromo: 5000,
    isPromo: true,
    isRecommended: false,
    satuan: '@pack'
  },

  // 2. MAKANAN (8 Produk)
  {
    id: 'prod-mk-1',
    nama: 'Indomie Goreng Spesial (5 pcs)',
    kategori: 'Makanan',
    harga: 16500,
    hargaPromo: 14500,
    isPromo: true,
    isRecommended: true,
    satuan: '@pack'
  },
  {
    id: 'prod-mk-2',
    nama: 'Indomie Kuah Ayam Bawang (5 pcs)',
    kategori: 'Makanan',
    harga: 15500,
    hargaPromo: null,
    isPromo: false,
    isRecommended: true,
    satuan: '@pack'
  },
  {
    id: 'prod-mk-3',
    nama: 'Sarden ABC Saus Tomat 425g',
    kategori: 'Makanan',
    harga: 26000,
    hargaPromo: 22000,
    isPromo: true,
    isRecommended: false,
    satuan: '@pcs'
  },
  {
    id: 'prod-mk-4',
    nama: 'Kornet Sapi Pronas 198g',
    kategori: 'Makanan',
    harga: 24500,
    hargaPromo: 20000,
    isPromo: true,
    isRecommended: true,
    satuan: '@pcs'
  },
  {
    id: 'prod-mk-5',
    nama: 'Roti Tawar Sari Roti Spesial',
    kategori: 'Makanan',
    harga: 16000,
    hargaPromo: null,
    isPromo: false,
    isRecommended: false,
    satuan: '@pack'
  },
  {
    id: 'prod-mk-6',
    nama: 'Biskuit Roma Kelapa 300g',
    kategori: 'Makanan',
    harga: 12500,
    hargaPromo: 10500,
    isPromo: true,
    isRecommended: false,
    satuan: '@pack'
  },
  {
    id: 'prod-mk-7',
    nama: 'Oatmeal Quaker Instant Merah 800g',
    kategori: 'Makanan',
    harga: 48000,
    hargaPromo: 41500,
    isPromo: true,
    isRecommended: false,
    satuan: '@pack'
  },
  {
    id: 'prod-mk-8',
    nama: 'Nugget Fiesta Crispy 500g',
    kategori: 'Makanan',
    harga: 55000,
    hargaPromo: 47000,
    isPromo: true,
    isRecommended: false,
    satuan: '@pack'
  },

  // 3. MINUMAN (8 Produk)
  {
    id: 'prod-mn-1',
    nama: 'Kopi Kapal Api Spesial Mix (10 sachet)',
    kategori: 'Minuman',
    harga: 15000,
    hargaPromo: 13000,
    isPromo: true,
    isRecommended: true,
    satuan: '@pack'
  },
  {
    id: 'prod-mn-2',
    nama: 'Teh Celup Sosro Isi 30',
    kategori: 'Minuman',
    harga: 8500,
    hargaPromo: 7000,
    isPromo: true,
    isRecommended: true,
    satuan: '@pack'
  },
  {
    id: 'prod-mn-3',
    nama: 'Susu UHT Ultra Milk Full Cream 1L',
    kategori: 'Minuman',
    harga: 21500,
    hargaPromo: 18500,
    isPromo: true,
    isRecommended: true,
    satuan: '@liter'
  },
  {
    id: 'prod-mn-4',
    nama: 'Air Mineral Aqua Galon 19L',
    kategori: 'Minuman',
    harga: 22000,
    hargaPromo: null,
    isPromo: false,
    isRecommended: false,
    satuan: '@pcs'
  },
  {
    id: 'prod-mn-5',
    nama: 'Susu Kental Manis Frisian Flag 370g',
    kategori: 'Minuman',
    harga: 13500,
    hargaPromo: 11800,
    isPromo: true,
    isRecommended: false,
    satuan: '@pcs'
  },
  {
    id: 'prod-mn-6',
    nama: 'Sirup Marjan Cocopandan 460ml',
    kategori: 'Minuman',
    harga: 25000,
    hargaPromo: 21000,
    isPromo: true,
    isRecommended: false,
    satuan: '@pcs'
  },
  {
    id: 'prod-mn-7',
    nama: 'Pocari Sweat Botol 500ml',
    kategori: 'Minuman',
    harga: 8500,
    hargaPromo: null,
    isPromo: false,
    isRecommended: false,
    satuan: '@pcs'
  },
  {
    id: 'prod-mn-8',
    nama: 'Kopi Good Day Cappuccino (10 sachet)',
    kategori: 'Minuman',
    harga: 22000,
    hargaPromo: 19000,
    isPromo: true,
    isRecommended: false,
    satuan: '@pack'
  },

  // 4. KEBERSIHAN (8 Produk)
  {
    id: 'prod-kb-1',
    nama: 'Deterjen Rinso Molto Anti Noda 770g',
    kategori: 'Kebersihan',
    harga: 26000,
    hargaPromo: 21500,
    isPromo: true,
    isRecommended: true,
    satuan: '@pack'
  },
  {
    id: 'prod-kb-2',
    nama: 'Sabun Cuci Piring Sunlight 750ml',
    kategori: 'Kebersihan',
    harga: 17500,
    hargaPromo: 14000,
    isPromo: true,
    isRecommended: true,
    satuan: '@pack'
  },
  {
    id: 'prod-kb-3',
    nama: 'Pasta Gigi Pepsodent 190g',
    kategori: 'Kebersihan',
    harga: 16000,
    hargaPromo: 13000,
    isPromo: true,
    isRecommended: false,
    satuan: '@pcs'
  },
  {
    id: 'prod-kb-4',
    nama: 'Sabun Mandi Lifebuoy Cair 450ml',
    kategori: 'Kebersihan',
    harga: 28000,
    hargaPromo: 23500,
    isPromo: true,
    isRecommended: true,
    satuan: '@pack'
  },
  {
    id: 'prod-kb-5',
    nama: 'Sampo Pantene Anti Dandruff 160ml',
    kategori: 'Kebersihan',
    harga: 29000,
    hargaPromo: null,
    isPromo: false,
    isRecommended: false,
    satuan: '@pcs'
  },
  {
    id: 'prod-kb-6',
    nama: 'Pembersih Lantai So Klin Refill 780ml',
    kategori: 'Kebersihan',
    harga: 13500,
    hargaPromo: 11000,
    isPromo: true,
    isRecommended: false,
    satuan: '@pack'
  },
  {
    id: 'prod-kb-7',
    nama: 'Tisu Wajah Paseo 250 sheets',
    kategori: 'Kebersihan',
    harga: 18000,
    hargaPromo: 15500,
    isPromo: true,
    isRecommended: false,
    satuan: '@pack'
  },
  {
    id: 'prod-kb-8',
    nama: 'Pewangi Pakaian Molto Blue 720ml',
    kategori: 'Kebersihan',
    harga: 22000,
    hargaPromo: 18500,
    isPromo: true,
    isRecommended: false,
    satuan: '@pack'
  },

  // 5. BUMBU (8 Produk)
  {
    id: 'prod-bm-1',
    nama: 'Kecap Manis Bango 520ml Refill',
    kategori: 'Bumbu',
    harga: 26500,
    hargaPromo: 23000,
    isPromo: true,
    isRecommended: true,
    satuan: '@pack'
  },
  {
    id: 'prod-bm-2',
    nama: 'Bawang Merah Brebes 250g',
    kategori: 'Bumbu',
    harga: 16000,
    hargaPromo: 13500,
    isPromo: true,
    isRecommended: true,
    satuan: '@pack'
  },
  {
    id: 'prod-bm-3',
    nama: 'Bawang Putih Kating 250g',
    kategori: 'Bumbu',
    harga: 15000,
    hargaPromo: null,
    isPromo: false,
    isRecommended: false,
    satuan: '@pack'
  },
  {
    id: 'prod-bm-4',
    nama: 'Saus Sambal ABC Extra Pedas 335ml',
    kategori: 'Bumbu',
    harga: 16500,
    hargaPromo: 14000,
    isPromo: true,
    isRecommended: false,
    satuan: '@pcs'
  },
  {
    id: 'prod-bm-5',
    nama: 'Penyedap Rasa Royco Ayam 230g',
    kategori: 'Bumbu',
    harga: 11000,
    hargaPromo: 9500,
    isPromo: true,
    isRecommended: true,
    satuan: '@pack'
  },
  {
    id: 'prod-bm-6',
    nama: 'Minyak Wijen Lee Kum Kee 115ml',
    kategori: 'Bumbu',
    harga: 38000,
    hargaPromo: null,
    isPromo: false,
    isRecommended: false,
    satuan: '@pcs'
  },
  {
    id: 'prod-bm-7',
    nama: 'Merica Bubuk Ladaku (12 sachet)',
    kategori: 'Bumbu',
    harga: 12000,
    hargaPromo: 10000,
    isPromo: true,
    isRecommended: false,
    satuan: '@pack'
  },
  {
    id: 'prod-bm-8',
    nama: 'Cabai Merah Keriting 250g',
    kategori: 'Bumbu',
    harga: 20000,
    hargaPromo: 17000,
    isPromo: true,
    isRecommended: false,
    satuan: '@pack'
  }
];

const INITIAL_DEMO_GROCERY_ITEMS = [
  {
    id: 'demo-1',
    name: 'Beras Rojolele',
    category: 'Bahan Pokok',
    unit: 'karung/5kg',
    qty: 1,
    unitPrice: 74000,
    discountMode: 'NONE',
    discountSingle: 0,
    discountTier1: 0,
    discountTier2: 0,
    discountNominal: 0,
    isChecked: false,
    addedAt: new Date().toISOString()
  },
  {
    id: 'demo-2',
    name: 'Minyak Goreng 2L',
    category: 'Bahan Pokok',
    unit: 'liter',
    qty: 1,
    unitPrice: 43000,
    discountMode: 'NONE',
    discountSingle: 0,
    discountTier1: 0,
    discountTier2: 0,
    discountNominal: 0,
    isChecked: false,
    addedAt: new Date().toISOString()
  }
];

const INITIAL_DEMO_HISTORY = [
  {
    id: 'hist-prev-month',
    date: '26 September 2026',
    storeLocation: 'Lotte Mart Grocery - Puri Indah',
    itemCount: 4,
    totalSpent: 148000,
    totalSaved: 0,
    budgetLimit: 150000,
    itemsPreview: [
      { name: 'Beras Rojolele', qty: 1, price: 68000, unitPrice: 68000 },
      { name: 'Telur Ayam 1kg', qty: 1, price: 32000, unitPrice: 32000 },
      { name: 'Garam 500g', qty: 1, price: 5000, unitPrice: 5000 },
      { name: 'Minyak Goreng 2L', qty: 1, price: 43000, unitPrice: 43000 }
    ]
  }
];

// ===================================================================
// APP STATE MANAGEMENT
// ===================================================================

const state = {
  budgetLimit: 150000,
  storeLocation: 'Lotte Mart Grocery - Puri Indah',
  shoppingDate: '2026-10-26',
  groceryItems: [],
  benchmarkCatalog: [],
  historySessions: [],
  activeTab: 'tab-belanja',
  filterCategory: 'ALL',
  searchQuery: '',
  formDiscountMode: 'NONE'
};

// ===================================================================
// STORAGE & REALTIME CLOUD HELPERS
// ===================================================================

function loadStateFromStorage() {
  try {
    const savedLimit = localStorage.getItem('tr_budget_limit');
    if (savedLimit) state.budgetLimit = parseInt(savedLimit, 10);

    const savedStore = localStorage.getItem('tr_store_location');
    if (savedStore) state.storeLocation = savedStore;

    const savedDate = localStorage.getItem('tr_shopping_date');
    if (savedDate) state.shoppingDate = savedDate;

    const savedCatalog = localStorage.getItem('tr_benchmark_catalog');
    state.benchmarkCatalog = savedCatalog ? JSON.parse(savedCatalog) : DEFAULT_BENCHMARK_CATALOG;

    const savedItems = localStorage.getItem('tr_grocery_items');
    state.groceryItems = savedItems ? JSON.parse(savedItems) : INITIAL_DEMO_GROCERY_ITEMS;

    const savedHistory = localStorage.getItem('tr_history_sessions');
    state.historySessions = savedHistory ? JSON.parse(savedHistory) : INITIAL_DEMO_HISTORY;
  } catch (e) {
    console.error('Error loading state from storage:', e);
    state.benchmarkCatalog = DEFAULT_BENCHMARK_CATALOG;
    state.groceryItems = INITIAL_DEMO_GROCERY_ITEMS;
    state.historySessions = INITIAL_DEMO_HISTORY;
  }
}

function persistState(immediate = false) {
  try {
    localStorage.setItem('tr_budget_limit', state.budgetLimit.toString());
    localStorage.setItem('tr_store_location', state.storeLocation);
    localStorage.setItem('tr_shopping_date', state.shoppingDate);
    localStorage.setItem('tr_benchmark_catalog', JSON.stringify(state.benchmarkCatalog));
    localStorage.setItem('tr_grocery_items', JSON.stringify(state.groceryItems));
    localStorage.setItem('tr_history_sessions', JSON.stringify(state.historySessions));
  } catch (e) {
    console.error('Error saving state:', e);
  }

  // Sinkronkan ke Cloud Firestore secara realtime jika bukan dari update remote
  if (!isReceivingRemoteUpdate) {
    triggerCloudSync(immediate);
  }
}

function updateSyncStatusUI(status, label) {
  const badge = document.getElementById('syncStatusBadge');
  const dot = document.getElementById('syncStatusDot');
  const text = document.getElementById('syncStatusText');

  if (!badge || !dot || !text) return;

  badge.className = `sync-status-badge ${status}`;
  dot.className = `sync-dot ${status}`;
  text.textContent = label;
}

function triggerCloudSync(immediate = false) {
  if (isReceivingRemoteUpdate) return;
  if (cloudSyncTimeout) clearTimeout(cloudSyncTimeout);
  
  updateSyncStatusUI('syncing', 'Menyinkron...');

  const performSync = async () => {
    let totalSpent = 0;
    let totalSavings = 0;

    state.groceryItems.forEach(item => {
      const calc = calculateItemPrice(item);
      totalSpent += calc.lineSubtotal;
      totalSavings += calc.lineSavings;
    });

    const payload = {
      storeLocation: state.storeLocation || 'Supermarket',
      shoppingDate: state.shoppingDate || new Date().toISOString().split('T')[0],
      walletLimit: Number(state.budgetLimit || 750000),
      items: state.groceryItems,
      totalSpent: totalSpent,
      totalSavings: totalSavings
    };

    const res = await saveActiveSessionToFirestore(payload);
    if (res && res.success) {
      updateSyncStatusUI('live', 'Realtime Sync');
    } else {
      updateSyncStatusUI('offline', 'Offline (Lokal)');
    }
  };

  if (immediate) {
    performSync();
  } else {
    cloudSyncTimeout = setTimeout(performSync, 80);
  }
}

function syncMetaControls() {
  const inputStore = document.getElementById('inputStoreLocation');
  const inputDate = document.getElementById('inputShoppingDate');

  if (inputStore && document.activeElement !== inputStore) {
    inputStore.value = state.storeLocation || 'Supermarket';
  }

  if (inputDate && document.activeElement !== inputDate) {
    inputDate.value = state.shoppingDate || new Date().toISOString().split('T')[0];
  }
}

// ===================================================================
// NON-BLOCKING TOAST & CONFIRMATION MODAL (UX COMPLIANCE)
// ===================================================================

let toastTimeout = null;

function showToast(message, type = 'info') {
  const toast = document.getElementById('appToast');
  const toastMsg = document.getElementById('toastMessage');
  const toastIcon = document.getElementById('toastIcon');

  if (!toast || !toastMsg) return;

  if (toastTimeout) clearTimeout(toastTimeout);

  toast.className = `toast-notification ${type} show`;
  toastMsg.textContent = message;

  if (toastIcon) {
    if (type === 'success') toastIcon.setAttribute('data-lucide', 'check-circle-2');
    else if (type === 'warning') toastIcon.setAttribute('data-lucide', 'alert-triangle');
    else if (type === 'danger') toastIcon.setAttribute('data-lucide', 'alert-circle');
    else toastIcon.setAttribute('data-lucide', 'info');
    refreshIcons();
  }

  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

let activeConfirmCallback = null;

function openConfirmModal({ title = 'Konfirmasi Hapus', message = 'Apakah Anda yakin?', onConfirm }) {
  const modal = document.getElementById('confirmDeleteModal');
  const titleEl = document.getElementById('confirmModalTitle');
  const descEl = document.getElementById('confirmModalDesc');
  const btnExecute = document.getElementById('btnExecuteConfirm');
  const btnCancel = document.getElementById('btnCancelConfirm');

  if (!modal) return;

  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = message;

  activeConfirmCallback = onConfirm;
  modal.classList.add('active');

  btnExecute.onclick = () => {
    modal.classList.remove('active');
    if (typeof activeConfirmCallback === 'function') {
      activeConfirmCallback();
      activeConfirmCallback = null;
    }
  };

  btnCancel.onclick = () => {
    modal.classList.remove('active');
    activeConfirmCallback = null;
  };
}

function requestClearCart() {
  if (state.groceryItems.length === 0) {
    showToast('Keranjang troli sudah kosong.', 'info');
    return;
  }

  openConfirmModal({
    title: 'Kosongkan Seluruh Keranjang?',
    message: 'Semua daftar belanjaan aktif akan dihapus permanen. Aksi ini aman dan dapat diisi kembali kapan saja.',
    onConfirm: () => {
      state.groceryItems = [];
      persistState();
      renderGroceryList();
      showToast('Seluruh isi keranjang belanja berhasil dikosongkan.', 'info');
    }
  });
}

// ===================================================================
// FORMATTING HELPERS
// ===================================================================

function formatRupiah(num) {
  if (isNaN(num)) return 'Rp 0';
  return 'Rp ' + Math.round(num).toLocaleString('id-ID');
}

function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

// ===================================================================
// MATHEMATICAL DISCOUNT ENGINE (SRS COMPLIANT)
// ===================================================================

/**
 * Calculates discount per item and clean unit price.
 * Stacked formula: Price * (1 - d1/100) * (1 - d2/100)
 */
function calculateItemPrice(item) {
  const basePrice = Number(item.unitPrice) || 0;
  const qty = Number(item.qty) || 1;
  let cleanUnitPrice = basePrice;
  let discountPerUnit = 0;
  let effectivePercent = 0;
  let discountDescription = '';

  const mode = item.discountMode || 'NONE';

  if (mode === 'SINGLE') {
    const p = Math.min(100, Math.max(0, Number(item.discountSingle) || 0));
    discountPerUnit = basePrice * (p / 100);
    cleanUnitPrice = Math.max(0, basePrice - discountPerUnit);
    effectivePercent = p;
    discountDescription = `Diskon ${p}%`;
  } else if (mode === 'STACKED') {
    const t1 = Math.min(100, Math.max(0, Number(item.discountTier1) || 0));
    const t2 = Math.min(100, Math.max(0, Number(item.discountTier2) || 0));
    
    // Tier 1 calculation
    const cut1 = basePrice * (t1 / 100);
    const priceAfterT1 = basePrice - cut1;
    // Tier 2 applied on remaining price
    const cut2 = priceAfterT1 * (t2 / 100);
    
    cleanUnitPrice = Math.max(0, priceAfterT1 - cut2);
    discountPerUnit = cut1 + cut2;
    effectivePercent = basePrice > 0 ? (discountPerUnit / basePrice) * 100 : 0;
    discountDescription = `Promo ${t1}% + ${t2}% (Efektif ${effectivePercent.toFixed(0)}% off)`;
  } else if (mode === 'NOMINAL') {
    const cutNominal = Math.max(0, Number(item.discountNominal) || 0);
    discountPerUnit = Math.min(basePrice, cutNominal);
    cleanUnitPrice = Math.max(0, basePrice - discountPerUnit);
    effectivePercent = basePrice > 0 ? (discountPerUnit / basePrice) * 100 : 0;
    discountDescription = `Potongan ${formatRupiah(cutNominal)}`;
  }

  const lineSubtotal = cleanUnitPrice * qty;
  const lineSavings = discountPerUnit * qty;
  const originalLineTotal = basePrice * qty;

  return {
    basePrice,
    cleanUnitPrice,
    discountPerUnit,
    effectivePercent,
    discountDescription,
    qty,
    lineSubtotal,
    lineSavings,
    originalLineTotal
  };
}

// ===================================================================
// REALTIME PRICE COMPARATOR (VS LAST MONTH BENCHMARK)
// ===================================================================

function compareWithLastMonth(productName, currentUnitPrice) {
  if (!productName || !currentUnitPrice) {
    return { status: 'NONE' };
  }

  const cleanName = productName.trim().toLowerCase();
  const match = state.benchmarkCatalog.find(c => 
    c.name.trim().toLowerCase() === cleanName ||
    cleanName.includes(c.name.trim().toLowerCase()) ||
    c.name.trim().toLowerCase().includes(cleanName)
  );

  if (!match) {
    return {
      status: 'NEW',
      label: 'Item Baru',
      text: '🆕 Item baru (Belum ada di data bulan lalu)',
      refPrice: null
    };
  }

  const refPrice = match.price;
  const curr = Number(currentUnitPrice);

  if (curr > refPrice) {
    const diff = curr - refPrice;
    const pct = ((diff / refPrice) * 100).toFixed(1);
    return {
      status: 'UP',
      label: `↑ +${formatRupiah(diff)} (+${pct}%)`,
      text: `↑ Naik ${formatRupiah(diff)} (+${pct}%) vs bln lalu (${formatRupiah(refPrice)})`,
      diff,
      pct,
      refPrice
    };
  } else if (curr < refPrice) {
    const diff = refPrice - curr;
    const pct = ((diff / refPrice) * 100).toFixed(1);
    return {
      status: 'DOWN',
      label: `↓ -${formatRupiah(diff)} (-${pct}%)`,
      text: `↓ Turun ${formatRupiah(diff)} (-${pct}%) vs bln lalu (${formatRupiah(refPrice)})`,
      diff,
      pct,
      refPrice
    };
  } else {
    return {
      status: 'EQUAL',
      label: `= Stabil (${formatRupiah(refPrice)})`,
      text: `= Harga stabil (Sama dengan bulan lalu)`,
      diff: 0,
      pct: 0,
      refPrice
    };
  }
}

// ===================================================================
// REALTIME SAFETY CAP / BUDGET CALCULATOR & CONTROLLER
// ===================================================================

function updateSafetyBudgetBar() {
  let totalSpent = 0;
  let totalSavings = 0;
  let checkedCount = 0;

  state.groceryItems.forEach(item => {
    const calc = calculateItemPrice(item);
    totalSpent += calc.lineSubtotal;
    totalSavings += calc.lineSavings;
    if (item.isChecked) checkedCount++;
  });

  const limit = state.budgetLimit;
  const remaining = limit - totalSpent;
  const percentage = limit > 0 ? (totalSpent / limit) * 100 : 0;

  // DOM Elements
  const lblSpent = document.getElementById('lblTotalSpent');
  const lblLimit = document.getElementById('lblBudgetLimit');
  const lblRemaining = document.getElementById('lblRemainingBudget');
  const lblPercent = document.getElementById('lblPercentageUsed');
  const fillBar = document.getElementById('safetyProgressFill');
  const safetyCard = document.getElementById('safetyCapCard');
  const safetyBadge = document.getElementById('safetyBadge');
  const lblAdvice = document.getElementById('lblSafetyAdvice');

  // Strip summary
  const stripTotalItems = document.getElementById('stripTotalItems');
  const stripCheckedRatio = document.getElementById('stripCheckedRatio');
  const stripSavings = document.getElementById('stripTotalSavings');
  const stripSavingsPct = document.getElementById('stripSavingsPercent');
  const navCartCount = document.getElementById('navCartCount');

  // Update text
  lblSpent.textContent = formatRupiah(totalSpent);
  lblLimit.textContent = formatRupiah(limit);
  lblPercent.textContent = `${Math.min(999, Math.round(percentage))}%`;

  if (remaining >= 0) {
    lblRemaining.textContent = formatRupiah(remaining);
  } else {
    lblRemaining.textContent = `-${formatRupiah(Math.abs(remaining))}`;
  }

  // Width capped to 100%
  fillBar.style.width = `${Math.min(100, Math.max(0, percentage))}%`;

  // Status Classes & Warnings (SRS F-05 Compliance)
  safetyCard.classList.remove('state-safe', 'state-warning', 'state-danger');

  if (percentage < 90) {
    safetyCard.classList.add('state-safe');
    safetyBadge.className = 'safety-badge badge-safe';
    safetyBadge.innerHTML = '<i data-lucide="shield-check" style="width:12px;height:12px;"></i> Aman';
    lblAdvice.textContent = 'Keranjang masih santai 👍';
    lblRemaining.style.color = 'var(--primary)';
  } else if (percentage <= 100) {
    safetyCard.classList.add('state-warning');
    safetyBadge.className = 'safety-badge badge-warning';
    safetyBadge.innerHTML = '<i data-lucide="alert-triangle" style="width:12px;height:12px;"></i> Peringatan Waspada';
    lblAdvice.textContent = 'Mendekati batas saldo dompet! (≥ 90%) ⚠️';
    lblRemaining.style.color = 'var(--accent-amber)';
  } else {
    safetyCard.classList.add('state-danger');
    safetyBadge.className = 'safety-badge badge-danger';
    safetyBadge.innerHTML = '<i data-lucide="siren" style="width:12px;height:12px;"></i> Over Budget!';
    lblAdvice.textContent = 'Total belanja melebihi batas saldo dompet! Kurangi kuantitas atau batalkan barang sekunder.';
    lblRemaining.style.color = 'var(--accent-rose)';

    // Trigger haptic vibration if supported (useful on real phones)
    if (navigator.vibrate) {
      navigator.vibrate([80, 40, 80]);
    }
  }

  // Update strip metrics
  stripTotalItems.textContent = `${state.groceryItems.length} Barang`;
  stripCheckedRatio.textContent = `${checkedCount} dari ${state.groceryItems.length} di troli`;
  stripSavings.textContent = formatRupiah(totalSavings);
  const totalBase = totalSpent + totalSavings;
  const overallDiscountRate = totalBase > 0 ? ((totalSavings / totalBase) * 100).toFixed(0) : 0;
  stripSavingsPct.textContent = `${overallDiscountRate}% hemat promo`;

  // Bottom nav badge
  if (state.groceryItems.length > 0) {
    navCartCount.style.display = 'flex';
    navCartCount.textContent = state.groceryItems.length;
  } else {
    navCartCount.style.display = 'none';
  }

  refreshIcons();
}

// ===================================================================
// SHOPEE-STYLE CATALOG & CART RENDER HELPERS
// ===================================================================

function addCatalogProductToCart(productId) {
  const prod = MASTER_PRODUCTS_CATALOG.find(p => p.id === productId);
  if (!prod) return;

  const existing = state.groceryItems.find(i => i.name.toLowerCase() === prod.nama.toLowerCase());
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
    showToast(`Tambah 1x "${prod.nama}" (${existing.qty}x di troli)`, 'success');
  } else {
    let unitPrice = prod.harga;
    let discountMode = 'NONE';
    let discountNominal = 0;

    if (prod.hargaPromo && prod.hargaPromo < prod.harga) {
      discountMode = 'NOMINAL';
      discountNominal = prod.harga - prod.hargaPromo;
    }

    state.groceryItems.unshift({
      id: 'item-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      name: prod.nama,
      category: prod.kategori,
      unit: prod.satuan.replace('@', ''),
      qty: 1,
      unitPrice: unitPrice,
      discountMode: discountMode,
      discountSingle: 0,
      discountTier1: 0,
      discountTier2: 0,
      discountNominal: discountNominal,
      isChecked: false,
      addedAt: new Date().toISOString()
    });
    showToast(`✅ "${prod.nama}" dimasukkan ke troli!`, 'success');
  }

  persistState();
  renderGroceryList();
}

function changeCatalogProductQty(productId, delta) {
  const prod = MASTER_PRODUCTS_CATALOG.find(p => p.id === productId);
  if (!prod) return;

  const existing = state.groceryItems.find(i => i.name.toLowerCase() === prod.nama.toLowerCase());
  if (existing) {
    changeItemQty(existing.id, delta);
  } else if (delta > 0) {
    addCatalogProductToCart(productId);
  }
}

function renderShopeePromoCard(prod) {
  const cartItem = state.groceryItems.find(i => i.name.toLowerCase() === prod.nama.toLowerCase());
  const hasPromo = prod.isPromo && prod.hargaPromo && prod.hargaPromo < prod.harga;
  const displayPrice = hasPromo ? prod.hargaPromo : prod.harga;
  const originalPriceHtml = hasPromo ? `<div class="shopee-original-price">${formatRupiah(prod.harga)}</div>` : '';
  const badgeHtml = hasPromo
    ? `<span class="shopee-badge-promo">🔥 PROMO</span>`
    : (prod.isRecommended ? `<span class="shopee-badge-rec">⭐ REKOMENDASI</span>` : '');

  let actionHtml = '';
  if (cartItem) {
    actionHtml = `
      <div class="shopee-card-stepper">
        <button class="btn-stepper btn-stepper-minus" onclick="changeItemQty('${cartItem.id}', -1)" title="Kurangi">-</button>
        <span class="stepper-value">${cartItem.qty}</span>
        <button class="btn-stepper btn-stepper-plus" onclick="changeItemQty('${cartItem.id}', 1)" title="Tambah">+</button>
      </div>
    `;
  } else {
    actionHtml = `
      <button class="btn-shopee-add" onclick="addCatalogProductToCart('${prod.id}')">
        <i data-lucide="plus" style="width:14px;height:14px;"></i> Keranjang
      </button>
    `;
  }

  return `
    <div class="shopee-promo-card">
      ${badgeHtml}
      <div class="shopee-card-name" title="${prod.nama}">${prod.nama}</div>
      <div class="shopee-card-meta">${prod.kategori} • ${prod.satuan}</div>
      <div class="shopee-card-price-row">
        ${originalPriceHtml}
        <div class="shopee-promo-price">${formatRupiah(displayPrice)}</div>
      </div>
      ${actionHtml}
    </div>
  `;
}

function renderShopeeCatalogItem(prod) {
  const cartItem = state.groceryItems.find(i => i.name.toLowerCase() === prod.nama.toLowerCase());
  const hasPromo = prod.isPromo && prod.hargaPromo && prod.hargaPromo < prod.harga;
  const displayPrice = hasPromo ? prod.hargaPromo : prod.harga;
  const originalPriceHtml = hasPromo ? `<span class="price-original-striked" style="font-size:0.7rem;margin-right:4px;">${formatRupiah(prod.harga)}</span>` : '';
  const badgeTag = hasPromo 
    ? `<span style="font-size:0.62rem;background:rgba(239,68,68,0.2);color:#ef4444;padding:1px 5px;border-radius:4px;font-weight:700;">Hemat ${formatRupiah(prod.harga - prod.hargaPromo)}</span>`
    : (prod.isRecommended ? `<span style="font-size:0.62rem;background:rgba(16,185,129,0.2);color:var(--primary);padding:1px 5px;border-radius:4px;font-weight:700;">Rekomendasi</span>` : '');

  let actionHtml = '';
  if (cartItem) {
    actionHtml = `
      <div class="stepper-container" style="padding:1px;">
        <button class="btn-stepper btn-stepper-minus" onclick="changeItemQty('${cartItem.id}', -1)" style="width:36px;height:36px;min-width:36px;min-height:36px;font-size:1.1rem;">-</button>
        <span class="stepper-value" style="min-width:32px;font-size:0.9rem;">${cartItem.qty}</span>
        <button class="btn-stepper btn-stepper-plus" onclick="changeItemQty('${cartItem.id}', 1)" style="width:36px;height:36px;min-width:36px;min-height:36px;font-size:1.1rem;">+</button>
      </div>
    `;
  } else {
    actionHtml = `
      <button class="btn-shopee-add" onclick="addCatalogProductToCart('${prod.id}')" style="width:auto;padding:0 14px;height:36px;">
        <i data-lucide="plus" style="width:14px;height:14px;"></i> Tambah
      </button>
    `;
  }

  return `
    <div class="shopee-catalog-item">
      <div class="shopee-catalog-info">
        <div class="shopee-catalog-title">${prod.nama}</div>
        <div class="shopee-catalog-sub">
          <span>${prod.kategori}</span>
          <span>•</span>
          <span>${prod.satuan}</span>
          ${badgeTag}
        </div>
        <div>
          ${originalPriceHtml}
          <span style="font-size:0.9rem;font-weight:800;color:var(--primary);">${formatRupiah(displayPrice)}</span>
        </div>
      </div>
      <div class="shopee-catalog-action">
        ${actionHtml}
      </div>
    </div>
  `;
}

function renderCartGroceryItem(item) {
  const calc = calculateItemPrice(item);
  const comp = compareWithLastMonth(item.name, item.unitPrice);

  let compHtml = '';
  if (comp.status === 'UP') {
    compHtml = `<div class="comparator-tag comp-up"><i data-lucide="trending-up" style="width:12px;height:12px;"></i> ${comp.label} vs bln lalu</div>`;
  } else if (comp.status === 'DOWN') {
    compHtml = `<div class="comparator-tag comp-down"><i data-lucide="trending-down" style="width:12px;height:12px;"></i> ${comp.label} vs bln lalu</div>`;
  } else if (comp.status === 'EQUAL') {
    compHtml = `<div class="comparator-tag comp-equal"><i data-lucide="minus" style="width:12px;height:12px;"></i> ${comp.label}</div>`;
  } else if (comp.status === 'NEW') {
    compHtml = `<div class="comparator-tag comp-new"><i data-lucide="sparkles" style="width:12px;height:12px;"></i> Item Baru</div>`;
  }

  let discountHtml = '';
  if (calc.discountPerUnit > 0) {
    discountHtml = `<div class="discount-tag"><i data-lucide="tag" style="width:12px;height:12px;"></i> ${calc.discountDescription} (Hemat ${formatRupiah(calc.lineSavings)})</div>`;
  }

  let originalStriked = '';
  if (calc.lineSavings > 0) {
    originalStriked = `<span class="price-original-striked">${formatRupiah(calc.originalLineTotal)}</span>`;
  }

  return `
    <div class="grocery-card ${item.isChecked ? 'checked' : ''}" id="item-${item.id}">
      <div class="grocery-card-top">
        <button class="trolley-check-btn" onclick="toggleItemCheck('${item.id}')" title="Tandai Sudah di Troli">
          <i data-lucide="check"></i>
        </button>

        <div class="item-core-details">
          <div class="item-header-meta">
            <span class="badge-category">${item.category}</span>
            <span class="item-unit-badge">@${item.unit}</span>
          </div>
          <div class="item-name">${item.name}</div>
          ${compHtml}
          ${discountHtml}
        </div>

        <div class="item-actions-top">
          <button class="btn-card-action" onclick="openEditItemModal('${item.id}')" title="Edit Item">
            <i data-lucide="edit-3" style="width:16px;height:16px;"></i>
          </button>
          <button class="btn-card-action btn-del" onclick="deleteGroceryItem('${item.id}')" title="Hapus Item">
            <i data-lucide="trash-2" style="width:16px;height:16px;"></i>
          </button>
        </div>
      </div>

      <div class="grocery-card-bottom">
        <div class="stepper-container">
          <button class="btn-stepper btn-stepper-minus" onclick="changeItemQty('${item.id}', -1)" title="Kurangi">-</button>
          <input type="number" inputmode="numeric" min="1" max="999" class="stepper-value-input" value="${item.qty}" onchange="setItemQtyDirect('${item.id}', this.value)" oninput="setItemQtyDirect('${item.id}', this.value)" title="Ketik kuantitas langsung">
          <button class="btn-stepper btn-stepper-plus" onclick="changeItemQty('${item.id}', 1)" title="Tambah">+</button>
        </div>

        <div class="price-box">
          <div class="price-unit-desc">
            ${formatRupiah(calc.cleanUnitPrice)} / ${item.unit}
          </div>
          <div class="price-subtotal">
            ${originalStriked}${formatRupiah(calc.lineSubtotal)}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ===================================================================
// RENDER GROCERY LIST (TAB 1)
// ===================================================================

function renderGroceryList() {
  const container = document.getElementById('groceryListContainer');
  const finishBox = document.getElementById('trolleyFinishBox');
  const searchQ = state.searchQuery.toLowerCase().trim();
  const filterCat = state.filterCategory;

  let html = '';

  // Case 1: SEARCH ACTIVE
  if (searchQ.length > 0) {
    const matchingCatalog = MASTER_PRODUCTS_CATALOG.filter(p => 
      p.nama.toLowerCase().includes(searchQ) || 
      p.kategori.toLowerCase().includes(searchQ)
    );
    const matchingCart = state.groceryItems.filter(i => 
      i.name.toLowerCase().includes(searchQ) || 
      i.category.toLowerCase().includes(searchQ)
    );

    if (matchingCatalog.length === 0 && matchingCart.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon-wrap">
            <i data-lucide="search-x" style="width:30px;height:30px;"></i>
          </div>
          <h3>Produk Tidak Ditemukan</h3>
          <p>Tidak ada produk yang cocok dengan "<strong>${state.searchQuery}</strong>". Coba kata kunci lain (misal: mie, minyak, kopi, telur).</p>
        </div>
      `;
      if (finishBox) finishBox.style.display = state.groceryItems.length > 0 ? 'flex' : 'none';
      refreshIcons();
      updateSafetyBudgetBar();
      return;
    }

    if (matchingCatalog.length > 0) {
      html += `
        <div class="shopee-section">
          <div class="shopee-section-title">
            <div class="shopee-title-text">
              <i data-lucide="search" style="color:var(--primary);width:16px;height:16px;"></i>
              Hasil Pencarian Katalog (${matchingCatalog.length})
            </div>
            <span class="shopee-title-badge">Katalog Produk</span>
          </div>
          <div class="shopee-catalog-grid">
            ${matchingCatalog.map(renderShopeeCatalogItem).join('')}
          </div>
        </div>
      `;
    }

    if (matchingCart.length > 0) {
      html += `
        <div class="shopee-section" style="margin-top: 18px;">
          <div class="shopee-section-title">
            <div class="shopee-title-text">
              <i data-lucide="shopping-cart" style="color:var(--accent-amber);width:16px;height:16px;"></i>
              Barang di Keranjang (${matchingCart.length})
            </div>
          </div>
          ${matchingCart.map(renderCartGroceryItem).join('')}
        </div>
      `;
    }

    container.innerHTML = html;
    if (finishBox) finishBox.style.display = state.groceryItems.length > 0 ? 'flex' : 'none';
    refreshIcons();
    updateSafetyBudgetBar();
    return;
  }

  // Case 2: TAB "SEMUA"
  if (filterCat === 'ALL') {
    const promoItems = MASTER_PRODUCTS_CATALOG.filter(p => p.isPromo || p.isRecommended);

    html += `
      <div class="shopee-section">
        <div class="shopee-section-title">
          <div class="shopee-title-text">
            <i data-lucide="flame" style="color:#ef4444;width:18px;height:18px;"></i>
            Rekomendasi & Promo Spesial
          </div>
          <span class="shopee-title-badge">${promoItems.length} Promo Aktif</span>
        </div>
        <div class="shopee-promo-slider">
          ${promoItems.map(renderShopeePromoCard).join('')}
        </div>
      </div>

      <div class="shopee-section">
        <div class="shopee-section-title">
          <div class="shopee-title-text">
            <i data-lucide="shopping-cart" style="color:var(--primary);width:18px;height:18px;"></i>
            Daftar Barang di Keranjang (${state.groceryItems.length})
          </div>
        </div>
        ${state.groceryItems.length === 0 ? `
          <div class="empty-state">
            <div class="empty-icon-wrap">
              <i data-lucide="shopping-bag" style="width:30px;height:30px;"></i>
            </div>
            <h3>Keranjang Belanja Masih Kosong</h3>
            <p>Pilih produk promo di atas, ketik di pencarian, atau gunakan tombol "+ Tambah Item" untuk mulai belanja.</p>
          </div>
        ` : state.groceryItems.map(renderCartGroceryItem).join('')}
      </div>
    `;

    container.innerHTML = html;
    if (finishBox) finishBox.style.display = state.groceryItems.length > 0 ? 'flex' : 'none';
    refreshIcons();
    updateSafetyBudgetBar();
    return;
  }

  // Case 3: SPECIFIC CATEGORY TAB (Bahan Pokok, Makanan, Minuman, Kebersihan, Bumbu)
  const catProducts = MASTER_PRODUCTS_CATALOG.filter(p => p.kategori === filterCat);
  const catPromo = catProducts.filter(p => p.isPromo || p.isRecommended);

  if (catPromo.length > 0) {
    html += `
      <div class="shopee-section">
        <div class="shopee-section-title">
          <div class="shopee-title-text">
            <i data-lucide="zap" style="color:var(--accent-amber);width:18px;height:18px;"></i>
            Promo & Rekomendasi ${filterCat}
          </div>
          <span class="shopee-title-badge">${catPromo.length} Pilihan</span>
        </div>
        <div class="shopee-promo-slider">
          ${catPromo.map(renderShopeePromoCard).join('')}
        </div>
      </div>
    `;
  }

  html += `
    <div class="shopee-section">
      <div class="shopee-section-title">
        <div class="shopee-title-text">
          <i data-lucide="layers" style="color:var(--primary);width:18px;height:18px;"></i>
          Katalog Lengkap ${filterCat}
        </div>
        <span class="shopee-title-badge">${catProducts.length} Produk</span>
      </div>
      <div class="shopee-catalog-grid">
        ${catProducts.map(renderShopeeCatalogItem).join('')}
      </div>
    </div>
  `;

  container.innerHTML = html;
  if (finishBox) finishBox.style.display = state.groceryItems.length > 0 ? 'flex' : 'none';
  refreshIcons();
  updateSafetyBudgetBar();
}

// ===================================================================
// ITEM INTERACTION HANDLERS (STEPPER, DIRECT QTY, CHECK, DELETE)
// ===================================================================

function changeItemQty(itemId, delta) {
  const item = state.groceryItems.find(i => i.id === itemId);
  if (!item) return;

  const newQty = (item.qty || 1) + delta;
  if (newQty <= 0) {
    // Auto-remove item when reduced to 0
    state.groceryItems = state.groceryItems.filter(i => i.id !== itemId);
    persistState();
    renderGroceryList();
    showToast(`"${item.name}" dihapus dari keranjang.`, 'info');
    return;
  }

  item.qty = newQty;
  persistState();
  renderGroceryList();
}

function setItemQtyDirect(itemId, value) {
  const item = state.groceryItems.find(i => i.id === itemId);
  if (!item) return;

  const parsed = parseInt(value, 10);
  if (!isNaN(parsed) && parsed > 0) {
    item.qty = parsed;
    persistState();
    renderGroceryList();
  }
}

function toggleItemCheck(itemId) {
  const item = state.groceryItems.find(i => i.id === itemId);
  if (!item) return;

  item.isChecked = !item.isChecked;
  persistState();
  renderGroceryList();
}

function deleteGroceryItem(itemId) {
  const item = state.groceryItems.find(i => i.id === itemId);
  if (!item) return;

  const itemName = item.name;
  openConfirmModal({
    title: 'Hapus Barang?',
    message: `Hapus "${itemName}" dari daftar keranjang belanja?`,
    onConfirm: () => {
      state.groceryItems = state.groceryItems.filter(i => i.id !== itemId);
      persistState();
      renderGroceryList();
      showToast(`"${itemName}" dihapus dari keranjang.`, 'info');
    }
  });
}

// Quick Add Anak Rantau Presets
function quickAddPreset(name, category, unit, qty, price, refPrice, discountTag = '') {
  // Check if benchmark already has reference
  if (refPrice) {
    const existingRef = state.benchmarkCatalog.find(b => b.name === name);
    if (!existingRef) {
      state.benchmarkCatalog.push({
        id: 'cat-' + Date.now(),
        name,
        category,
        unit,
        price: refPrice
      });
    }
  }

  let discountMode = 'NONE';
  let dSingle = 0;
  let t1 = 0;
  let t2 = 0;

  if (discountTag === '25') {
    discountMode = 'SINGLE';
    dSingle = 25;
  } else if (discountTag === '50+20') {
    discountMode = 'STACKED';
    t1 = 50;
    t2 = 20;
  }

  // Check if item already exists in current active cart
  const existing = state.groceryItems.find(i => i.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    existing.qty += qty;
  } else {
    state.groceryItems.unshift({
      id: 'item-' + Date.now(),
      name,
      category,
      unit,
      qty,
      unitPrice: price,
      discountMode,
      discountSingle: dSingle,
      discountTier1: t1,
      discountTier2: t2,
      discountNominal: 0,
      isChecked: false,
      addedAt: new Date().toISOString()
    });
  }

  persistState();
  renderGroceryList();
  highlightNewlyAddedItem(name);
  showToast(`"${name}" berhasil ditambahkan ke troli!`, 'success');
}

function highlightNewlyAddedItem(name) {
  // Little vibration & scroll feedback
  if (navigator.vibrate) navigator.vibrate(40);
}

// ===================================================================
// BOTTOM SHEET MODAL (TAMBAH / EDIT ITEM)
// ===================================================================

const itemModalOverlay = document.getElementById('itemModalOverlay');
const sheetTitleText = document.getElementById('sheetTitleText');
const editItemIdInput = document.getElementById('editItemId');
const inputItemName = document.getElementById('inputItemName');
const selectCategory = document.getElementById('selectCategory');
const selectUnit = document.getElementById('selectUnit');
const inputUnitPrice = document.getElementById('inputUnitPrice');
const inputFormQty = document.getElementById('inputFormQty');
const formComparatorFeedback = document.getElementById('formComparatorFeedback');
const lblRefPriceHint = document.getElementById('lblRefPriceHint');

// Discount Elements
const paneDiscSingle = document.getElementById('paneDiscSingle');
const paneDiscStacked = document.getElementById('paneDiscStacked');
const paneDiscNominal = document.getElementById('paneDiscNominal');
const inputDiscSingle = document.getElementById('inputDiscSingle');
const inputDiscTier1 = document.getElementById('inputDiscTier1');
const inputDiscTier2 = document.getElementById('inputDiscTier2');
const inputDiscNominal = document.getElementById('inputDiscNominal');
const discountMathPreview = document.getElementById('discountMathPreview');
const lblFormLiveSubtotal = document.getElementById('lblFormLiveSubtotal');
const lblFormLiveStrikedPrice = document.getElementById('lblFormLiveStrikedPrice');
const lblDiscountSummaryPill = document.getElementById('lblDiscountSummaryPill');

function openAddItemModal() {
  sheetTitleText.textContent = 'Tambah Item Belanja';
  editItemIdInput.value = '';
  inputItemName.value = '';
  selectCategory.value = 'Bahan Pokok';
  selectUnit.value = 'pcs';
  inputUnitPrice.value = '';
  inputFormQty.value = '1';

  // Reset discounts
  selectDiscountMode('NONE');
  inputDiscSingle.value = '';
  inputDiscTier1.value = '';
  inputDiscTier2.value = '';
  inputDiscNominal.value = '';

  updateFormLiveCalculation();
  itemModalOverlay.classList.add('active');
  inputItemName.focus();
}

function openEditItemModal(itemId) {
  const item = state.groceryItems.find(i => i.id === itemId);
  if (!item) return;

  sheetTitleText.textContent = 'Edit Item Belanja';
  editItemIdInput.value = item.id;
  inputItemName.value = item.name;
  selectCategory.value = item.category;
  selectUnit.value = item.unit;
  inputUnitPrice.value = item.unitPrice;
  inputFormQty.value = item.qty;

  selectDiscountMode(item.discountMode || 'NONE');
  inputDiscSingle.value = item.discountSingle || '';
  inputDiscTier1.value = item.discountTier1 || '';
  inputDiscTier2.value = item.discountTier2 || '';
  inputDiscNominal.value = item.discountNominal || '';

  updateFormLiveCalculation();
  itemModalOverlay.classList.add('active');
}

function closeItemModal() {
  itemModalOverlay.classList.remove('active');
}

function selectDiscountMode(mode) {
  state.formDiscountMode = mode;

  // Update tabs active styling
  document.querySelectorAll('.btn-disc-tab').forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('data-mode') === mode);
  });

  if (paneDiscSingle) paneDiscSingle.style.display = mode === 'SINGLE' ? 'block' : 'none';
  if (paneDiscStacked) paneDiscStacked.style.display = mode === 'STACKED' ? 'block' : 'none';
  if (paneDiscNominal) paneDiscNominal.style.display = mode === 'NOMINAL' ? 'block' : 'none';

  // Berikan nilai default promo jika input kosong agar langsung memberikan efek kalkulasi seketika
  if (mode === 'SINGLE') {
    if (!inputDiscSingle.value || Number(inputDiscSingle.value) === 0) {
      inputDiscSingle.value = '20';
    }
  } else if (mode === 'STACKED') {
    if (!inputDiscTier1.value || Number(inputDiscTier1.value) === 0) {
      inputDiscTier1.value = '50';
    }
    if (!inputDiscTier2.value || Number(inputDiscTier2.value) === 0) {
      inputDiscTier2.value = '20';
    }
  } else if (mode === 'NOMINAL') {
    if (!inputDiscNominal.value || Number(inputDiscNominal.value) === 0) {
      const base = Number(inputUnitPrice.value) || 0;
      inputDiscNominal.value = base >= 20000 ? '5000' : '2000';
    }
  }

  updateFormLiveCalculation();
}
window.selectDiscountMode = selectDiscountMode;

function addNominalToPrice(amount) {
  const current = Number(inputUnitPrice.value) || 0;
  inputUnitPrice.value = Math.max(0, current + Number(amount));
  updateFormLiveCalculation();
}
window.addNominalToPrice = addNominalToPrice;

function setFormQty(qty) {
  inputFormQty.value = Math.max(1, Number(qty) || 1);
  updateFormLiveCalculation();
}
window.setFormQty = setFormQty;

// Realtime calculation & comparator preview inside form
function updateFormLiveCalculation() {
  const name = inputItemName ? inputItemName.value : '';
  const basePrice = Number(inputUnitPrice ? inputUnitPrice.value : 0) || 0;
  const qty = Math.max(1, Number(inputFormQty ? inputFormQty.value : 1) || 1);
  const mode = state.formDiscountMode || 'NONE';

  // Comparator vs last month
  const comp = compareWithLastMonth(name, basePrice);
  if (basePrice > 0 && formComparatorFeedback) {
    formComparatorFeedback.className = 'form-comparator-feedback show';
    if (comp.status === 'UP') {
      formComparatorFeedback.style.background = 'rgba(239, 68, 68, 0.15)';
      formComparatorFeedback.style.color = '#f87171';
      formComparatorFeedback.innerHTML = `<i data-lucide="trending-up" style="width:16px;height:16px;"></i> ${comp.text}`;
    } else if (comp.status === 'DOWN') {
      formComparatorFeedback.style.background = 'rgba(16, 185, 129, 0.15)';
      formComparatorFeedback.style.color = '#34d399';
      formComparatorFeedback.innerHTML = `<i data-lucide="trending-down" style="width:16px;height:16px;"></i> ${comp.text}`;
    } else if (comp.status === 'EQUAL') {
      formComparatorFeedback.style.background = 'rgba(148, 163, 184, 0.15)';
      formComparatorFeedback.style.color = '#cbd5e1';
      formComparatorFeedback.innerHTML = `<i data-lucide="minus" style="width:16px;height:16px;"></i> ${comp.text}`;
    } else {
      formComparatorFeedback.style.background = 'rgba(6, 182, 212, 0.15)';
      formComparatorFeedback.style.color = '#38bdf8';
      formComparatorFeedback.innerHTML = `<i data-lucide="sparkles" style="width:16px;height:16px;"></i> ${comp.text}`;
    }
  } else if (formComparatorFeedback) {
    formComparatorFeedback.className = 'form-comparator-feedback';
    formComparatorFeedback.innerHTML = '';
  }

  // Math calculation
  const mockItem = {
    unitPrice: basePrice,
    qty,
    discountMode: mode,
    discountSingle: Number(inputDiscSingle ? inputDiscSingle.value : 0) || 0,
    discountTier1: Number(inputDiscTier1 ? inputDiscTier1.value : 0) || 0,
    discountTier2: Number(inputDiscTier2 ? inputDiscTier2.value : 0) || 0,
    discountNominal: Number(inputDiscNominal ? inputDiscNominal.value : 0) || 0
  };

  const calc = calculateItemPrice(mockItem);

  // Discount Pill & Math Walkthrough Explanation
  if (lblDiscountSummaryPill && discountMathPreview) {
    if (mode === 'NONE') {
      lblDiscountSummaryPill.textContent = 'Tanpa Diskon';
      discountMathPreview.style.display = 'none';
    } else if (mode === 'SINGLE') {
      lblDiscountSummaryPill.textContent = `Diskon ${mockItem.discountSingle}%`;
      discountMathPreview.style.display = 'block';
      discountMathPreview.innerHTML = `
        <div><strong>Rumus Diskon Tunggal (${mockItem.discountSingle}%):</strong></div>
        <div>${formatRupiah(basePrice)} - ${mockItem.discountSingle}% = <strong>${formatRupiah(calc.cleanUnitPrice)}</strong> per ${selectUnit ? selectUnit.value : 'item'}</div>
        <div style="color:var(--primary);margin-top:2px;">Hemat Rp ${Math.round(calc.lineSavings).toLocaleString('id-ID')} untuk ${qty} item</div>
      `;
    } else if (mode === 'STACKED') {
      lblDiscountSummaryPill.textContent = `Diskon ${mockItem.discountTier1}% + ${mockItem.discountTier2}%`;
      discountMathPreview.style.display = 'block';

      const cut1 = basePrice * (mockItem.discountTier1 / 100);
      const p1 = basePrice - cut1;
      const cut2 = p1 * (mockItem.discountTier2 / 100);

      discountMathPreview.innerHTML = `
        <div><strong>Rumus Diskon Bertumpuk Supermarket:</strong></div>
        <div>1. Diskon ke-1 (${mockItem.discountTier1}%): ${formatRupiah(basePrice)} → ${formatRupiah(p1)}</div>
        <div>2. Diskon ke-2 (${mockItem.discountTier2}% dari sisa): ${formatRupiah(p1)} → <strong>${formatRupiah(calc.cleanUnitPrice)}</strong></div>
        <div style="color:#fbbf24;margin-top:2px;">
          💡 Diskon Efektif: <strong>${calc.effectivePercent.toFixed(1)}% off</strong> (Bukan ${mockItem.discountTier1 + mockItem.discountTier2}%). Hemat <strong>${formatRupiah(calc.lineSavings)}</strong>!
        </div>
      `;
    } else if (mode === 'NOMINAL') {
      lblDiscountSummaryPill.textContent = `Potongan ${formatRupiah(mockItem.discountNominal)}`;
      discountMathPreview.style.display = 'block';
      discountMathPreview.innerHTML = `
        <div><strong>Potongan Langsung:</strong></div>
        <div>${formatRupiah(basePrice)} - ${formatRupiah(mockItem.discountNominal)} = <strong>${formatRupiah(calc.cleanUnitPrice)}</strong> per ${selectUnit ? selectUnit.value : 'item'}</div>
      `;
    }
  }

  // Live subtotal display
  if (lblFormLiveSubtotal) {
    lblFormLiveSubtotal.textContent = formatRupiah(calc.lineSubtotal);
  }

  if (lblFormLiveStrikedPrice) {
    if (calc.lineSavings > 0) {
      lblFormLiveStrikedPrice.style.display = 'block';
      lblFormLiveStrikedPrice.textContent = formatRupiah(calc.originalLineTotal);
    } else {
      lblFormLiveStrikedPrice.style.display = 'none';
    }
  }

  refreshIcons();
}

function saveGroceryItem(e) {
  if (e && typeof e.preventDefault === 'function') {
    e.preventDefault();
  }

  const name = inputItemName ? inputItemName.value.trim() : '';
  const category = selectCategory ? selectCategory.value : 'Bahan Pokok';
  const unit = selectUnit ? selectUnit.value : 'pcs';
  const unitPrice = Number(inputUnitPrice ? inputUnitPrice.value : 0);
  const qty = Math.max(1, Number(inputFormQty ? inputFormQty.value : 1) || 1);
  const editId = editItemIdInput ? editItemIdInput.value : '';

  if (!name) {
    showToast('Nama barang belanjaan wajib diisi!', 'warning');
    if (inputItemName) inputItemName.focus();
    return false;
  }

  if (isNaN(unitPrice) || unitPrice <= 0) {
    showToast('Harga satuan harus berupa angka positif lebih dari Rp 0 (tidak boleh minus)!', 'warning');
    if (inputUnitPrice) inputUnitPrice.focus();
    return false;
  }

  if (isNaN(qty) || qty <= 0) {
    showToast('Kuantitas beli minimal 1!', 'warning');
    if (inputFormQty) inputFormQty.focus();
    return false;
  }

  const discountMode = state.formDiscountMode || 'NONE';
  const discountSingle = Number(inputDiscSingle ? inputDiscSingle.value : 0) || 0;
  const discountTier1 = Number(inputDiscTier1 ? inputDiscTier1.value : 0) || 0;
  const discountTier2 = Number(inputDiscTier2 ? inputDiscTier2.value : 0) || 0;
  const discountNominal = Number(inputDiscNominal ? inputDiscNominal.value : 0) || 0;

  // Kalkulasi subtotal akhir
  const calc = calculateItemPrice({
    unitPrice,
    qty,
    discountMode,
    discountSingle,
    discountTier1,
    discountTier2,
    discountNominal
  });

  const itemPayload = {
    id: editId || ('item-' + Date.now()),
    name,
    category,
    unit,
    qty,
    unitPrice,
    discountMode,
    discountSingle,
    discountTier1,
    discountTier2,
    discountNominal,
    cleanUnitPrice: calc.cleanUnitPrice,
    lineSubtotal: calc.lineSubtotal,
    lineSavings: calc.lineSavings,
    isChecked: false,
    addedAt: new Date().toISOString()
  };

  if (editId) {
    // Update existing item
    const idx = state.groceryItems.findIndex(i => i.id === editId);
    if (idx !== -1) {
      itemPayload.isChecked = state.groceryItems[idx].isChecked || false;
      itemPayload.addedAt = state.groceryItems[idx].addedAt || itemPayload.addedAt;
      state.groceryItems[idx] = itemPayload;
    } else {
      state.groceryItems.unshift(itemPayload);
    }
  } else {
    // Add new item to trolley
    state.groceryItems.unshift(itemPayload);
  }

  // Update benchmark catalog with this item if not exists
  const existingBench = state.benchmarkCatalog.find(b => b.name.toLowerCase() === name.toLowerCase());
  if (!existingBench) {
    state.benchmarkCatalog.push({
      id: 'cat-' + Date.now(),
      name,
      category,
      unit,
      price: unitPrice
    });
  }

  // Simpan ke storage dan database Firestore
  persistState();

  // Reset input form
  if (inputItemName) inputItemName.value = '';
  if (inputUnitPrice) inputUnitPrice.value = '';
  if (inputFormQty) inputFormQty.value = '1';
  if (editItemIdInput) editItemIdInput.value = '';
  selectDiscountMode('NONE');

  // Tutup modal
  closeItemModal();

  // Re-render keranjang belanja & safety cap meter
  renderGroceryList();
  updateSafetyBudgetBar();

  showToast(`"${name}" (${qty} ${unit}) berhasil disimpan ke troli!`, 'success');
  return true;
}
window.saveGroceryItem = saveGroceryItem;

// ===================================================================
// TAB 2: RIWAYAT & DATABASE BELANJA
// ===================================================================

function finishShoppingSession() {
  if (state.groceryItems.length === 0) {
    showToast('Keranjang troli masih kosong!', 'warning');
    return;
  }

  let totalSpent = 0;
  let totalSaved = 0;
  const itemsSnapshot = [];

  state.groceryItems.forEach(item => {
    const calc = calculateItemPrice(item);
    totalSpent += calc.lineSubtotal;
    totalSaved += calc.lineSavings;
    itemsSnapshot.push({
      name: item.name,
      category: item.category,
      qty: item.qty,
      unit: item.unit,
      unitPrice: item.unitPrice,
      price: calc.lineSubtotal
    });

    // Auto-update benchmark price for next month!
    const benchmarkIndex = state.benchmarkCatalog.findIndex(b => b.name.toLowerCase() === item.name.toLowerCase());
    if (benchmarkIndex >= 0) {
      state.benchmarkCatalog[benchmarkIndex].price = item.unitPrice;
    } else {
      state.benchmarkCatalog.push({
        id: 'cat-' + Date.now() + Math.random(),
        name: item.name,
        category: item.category,
        unit: item.unit,
        price: item.unitPrice
      });
    }
  });

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const newSession = {
    id: 'hist-' + Date.now(),
    date: dateFormatted,
    storeLocation: state.storeLocation || 'Supermarket',
    itemCount: state.groceryItems.length,
    totalSpent,
    totalSaved,
    budgetLimit: state.budgetLimit,
    itemsPreview: itemsSnapshot
  };

  state.historySessions.unshift(newSession);

  // Arsipkan ke Firestore
  archiveSessionToFirestore(newSession);

  // Clear current trolley & sync ke Firestore
  state.groceryItems = [];
  persistState();

  showToast(`🎉 Belanja Berhasil Disimpan! Total: ${formatRupiah(totalSpent)}`, 'success');

  renderGroceryList();
  renderHistoryView();
  switchTab('tab-riwayat');
}

function renderHistoryView() {
  const container = document.getElementById('historyListContainer');
  const lblTotalSessions = document.getElementById('lblHistoryTotalSessions');
  const lblAvgSpent = document.getElementById('lblHistoryAvgSpent');
  const lblTotalSaved = document.getElementById('lblHistoryTotalSaved');

  lblTotalSessions.textContent = `${state.historySessions.length} Sesi`;

  let sumSpent = 0;
  let sumSaved = 0;

  state.historySessions.forEach(h => {
    sumSpent += h.totalSpent || 0;
    sumSaved += h.totalSaved || 0;
  });

  const avgSpent = state.historySessions.length > 0 ? sumSpent / state.historySessions.length : 0;
  lblAvgSpent.textContent = `Rata-rata: ${formatRupiah(avgSpent)}`;
  lblTotalSaved.textContent = formatRupiah(sumSaved);

  if (state.historySessions.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon-wrap">
          <i data-lucide="receipt" style="width:30px;height:30px;"></i>
        </div>
        <h3>Belum Ada Riwayat Belanja</h3>
        <p>Selesaikan belanja di tab Troli untuk menyimpan riwayat belanja bulanan.</p>
      </div>
    `;
    refreshIcons();
    return;
  }

  let html = '';
  state.historySessions.forEach((session, idx) => {
    const isUnderBudget = session.totalSpent <= session.budgetLimit;
    const statusText = isUnderBudget ? 'Hemat Sesuai Target' : 'Over Limit';
    const statusClass = isUnderBudget ? 'badge-safe' : 'badge-danger';

    let itemsPreviewHtml = '';
    if (session.itemsPreview && session.itemsPreview.length > 0) {
      session.itemsPreview.slice(0, 4).forEach(it => {
        itemsPreviewHtml += `
          <div class="history-item-mini">
            <span>${it.name} (${it.qty} ${it.unit || 'pcs'})</span>
            <span>${formatRupiah(it.price)}</span>
          </div>
        `;
      });
      if (session.itemsPreview.length > 4) {
        itemsPreviewHtml += `
          <div style="font-size:0.68rem; color:var(--text-muted); text-align:center; padding-top:2px;">
            + ${session.itemsPreview.length - 4} barang lainnya
          </div>
        `;
      }
    }

    html += `
      <div class="history-card">
        <div class="history-card-header">
          <div>
            <div class="history-date">${session.date}</div>
            <div style="font-size:0.68rem; color:var(--text-muted);">${session.itemCount} Barang dibeli</div>
          </div>
          <span class="history-badge-status ${statusClass}">${statusText}</span>
        </div>

        <div class="history-items-preview">
          ${itemsPreviewHtml}
        </div>

        <div class="history-actions-row">
          <div>
            <span style="font-size:0.68rem; color:var(--text-secondary);">Total Bayar: </span>
            <strong style="color:var(--primary); font-size:0.95rem;">${formatRupiah(session.totalSpent)}</strong>
          </div>
          <button class="btn-history-ref" onclick="useHistoryAsCurrentBenchmark('${session.id}')">
            Jadikan Acuan Bulan Lalu
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  refreshIcons();
}

function useHistoryAsCurrentBenchmark(sessionId) {
  const session = state.historySessions.find(s => s.id === sessionId);
  if (!session || !session.itemsPreview) return;

  session.itemsPreview.forEach(it => {
    const existing = state.benchmarkCatalog.find(b => b.name.toLowerCase() === it.name.toLowerCase());
    const unitPrice = it.unitPrice || (it.price / (it.qty || 1));
    if (existing) {
      existing.price = unitPrice;
    } else {
      state.benchmarkCatalog.push({
        id: 'cat-' + Date.now() + Math.random(),
        name: it.name,
        category: it.category || 'Bahan Pokok',
        unit: it.unit || 'pcs',
        price: unitPrice
      });
    }
  });

  persistState();
  renderCatalogList();
  renderGroceryList();
  showToast(`✅ Sesi ${session.date} berhasil dijadikan acuan bulan lalu!`, 'success');
}

// ===================================================================
// TAB 3: ANGGARAN & DATABASE ACUAN BENCHMARK
// ===================================================================

function renderCatalogList() {
  const container = document.getElementById('catalogListContainer');
  if (!container) return;

  if (state.benchmarkCatalog.length === 0) {
    container.innerHTML = `<div style="font-size:0.75rem;color:var(--text-muted);text-align:center;padding:12px;">Database katalog kosong.</div>`;
    return;
  }

  let html = '';
  state.benchmarkCatalog.forEach(c => {
    html += `
      <div class="catalog-ref-item">
        <div>
          <div class="catalog-name">${c.name}</div>
          <div style="font-size:0.68rem; color:var(--text-secondary);">${c.category} • /${c.unit}</div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <div class="catalog-price">${formatRupiah(c.price)}</div>
          <button class="btn-card-action btn-del" onclick="deleteBenchmarkItem('${c.id}')">
            <i data-lucide="trash" style="width:14px;height:14px;"></i>
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  refreshIcons();

  // Populate datalist for input autocomplete
  const datalist = document.getElementById('presetCatalogSuggestions');
  if (datalist) {
    datalist.innerHTML = state.benchmarkCatalog.map(b => `<option value="${b.name}">`).join('');
  }
}

function deleteBenchmarkItem(id) {
  state.benchmarkCatalog = state.benchmarkCatalog.filter(c => c.id !== id);
  persistState();
  renderCatalogList();
  renderGroceryList();
}

// ===================================================================
// BUDGET & SAFETY CAP HELPERS
// ===================================================================

function parseBudgetInput(raw) {
  if (typeof raw === 'number') return isNaN(raw) ? 0 : raw;
  if (!raw) return 0;
  
  let str = String(raw).trim();
  // Remove currency signs & non-numeric chars except dot and comma
  str = str.replace(/[^0-9.,]/g, '');
  
  // Handle dot or comma thousand separators
  if (str.includes('.') && !str.includes(',')) {
    // e.g. "75.000" or "1.500.000"
    str = str.replace(/\./g, '');
  } else if (str.includes(',') && !str.includes('.')) {
    // e.g. "75,000"
    str = str.replace(/,/g, '');
  } else if (str.includes('.') && str.includes(',')) {
    // Indonesian format "75.000,00"
    str = str.replace(/\./g, '').replace(/,/g, '.');
  }
  
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : Math.round(parsed);
}

function updatePresetButtonsUI(currentVal) {
  const numericVal = parseBudgetInput(currentVal);
  document.querySelectorAll('.btn-budget-preset').forEach(btn => {
    const dataAmt = btn.getAttribute('data-amount');
    const btnAmount = dataAmt ? parseBudgetInput(dataAmt) : parseBudgetInput(btn.textContent);
    const isActive = numericVal > 0 && btnAmount === numericVal;
    btn.classList.toggle('active', isActive);
  });
}

function selectBudgetPreset(amount) {
  const numericAmount = parseBudgetInput(amount);
  if (!numericAmount || numericAmount <= 0) return;
  // Langsung perbarui state, simpan ke LocalStorage & Firebase Firestore (immediate sync)
  setBudgetAmount(numericAmount, true);
  showToast(`✅ Batas anggaran diatur ke ${formatRupiah(numericAmount)}`, 'info');
}

function saveBudgetSetting() {
  const input = document.getElementById('inputSettingBudget');
  if (!input) return;

  const rawVal = input.value;
  const parsed = parseBudgetInput(rawVal);

  if (parsed <= 0) {
    showToast('⚠️ Masukkan nominal batas dompet yang valid (misal: 750000)!', 'error');
    input.focus();
    return;
  }

  // 1. Simpan ke Global State, persist ke LocalStorage & Firebase Firestore (immediate sync)
  setBudgetAmount(parsed, true);

  // 2. Feedback visual ke user
  showToast(`✅ Batas anggaran berhasil disimpan: ${formatRupiah(parsed)}`, 'success');
}

function setBudgetAmount(amount, immediate = false) {
  const numericAmount = parseBudgetInput(amount);
  if (!numericAmount || numericAmount <= 0) return false;

  // 1. Update Global State
  state.budgetLimit = numericAmount;

  // 2. Persist to LocalStorage and Cloud Firestore (immediate if specified)
  persistState(immediate);

  // 3. Update input in Tab 3 (Settings) if present
  const settingInput = document.getElementById('inputSettingBudget');
  if (settingInput) {
    settingInput.value = numericAmount;
  }

  // 4. Update Quick Modal input if present
  const quickInput = document.getElementById('quickBudgetInput');
  if (quickInput) {
    quickInput.value = numericAmount;
  }

  // 5. Update visual active state of preset buttons in Tab 3
  updatePresetButtonsUI(numericAmount);

  // 6. Recalculate remaining budget & update all Home/Dashboard indicators in real-time
  updateSafetyBudgetBar();

  return true;
}

function resetDefaultCatalog() {
  openConfirmModal({
    title: 'Reset Database Acuan?',
    message: 'Kembalikan database harga acuan bulan lalu ke template default anak rantau DT2?',
    onConfirm: () => {
      state.benchmarkCatalog = JSON.parse(JSON.stringify(DEFAULT_BENCHMARK_CATALOG));
      persistState();
      renderCatalogList();
      renderGroceryList();
      showToast('✅ Database harga acuan telah direset.', 'success');
    }
  });
}

// Quick Budget Modal Functions
function openBudgetModal() {
  const input = document.getElementById('quickBudgetInput');
  const overlay = document.getElementById('budgetModalOverlay');
  if (input) {
    input.value = state.budgetLimit;
  }
  if (overlay) {
    overlay.classList.add('active');
  }
  if (input) {
    setTimeout(() => {
      input.focus();
      input.select();
    }, 50);
  }
}

function closeBudgetModal() {
  const overlay = document.getElementById('budgetModalOverlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

function saveQuickBudget() {
  const input = document.getElementById('quickBudgetInput');
  if (!input) return;

  const rawVal = input.value;
  const parsed = parseBudgetInput(rawVal);

  if (parsed <= 0) {
    showToast('⚠️ Masukkan nominal batas dompet yang valid (misal: 75000)!', 'error');
    input.focus();
    return;
  }

  // 1. Update Global State, persist & recalculate
  setBudgetAmount(parsed);

  // 2. UI feedback
  showToast(`✅ Limit dompet diubah: ${formatRupiah(parsed)}`, 'success');

  // 3. Otomatis tutup modal
  closeBudgetModal();
}

// ===================================================================
// TAB NAVIGATION CONTROLLER
// ===================================================================

function switchTab(tabId) {
  state.activeTab = tabId;

  // Toggle tab views
  document.querySelectorAll('.tab-view').forEach(view => {
    view.classList.toggle('active', view.id === tabId);
  });

  // Toggle bottom nav buttons
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
  });

  // Hide or show floating add button
  const floatingAddBtn = document.getElementById('btnOpenAddModal');
  if (floatingAddBtn) {
    floatingAddBtn.style.display = tabId === 'tab-belanja' ? 'flex' : 'none';
  }

  // Refresh tab-specific views
  if (tabId === 'tab-belanja') {
    renderGroceryList();
  } else if (tabId === 'tab-riwayat') {
    renderHistoryView();
  } else if (tabId === 'tab-anggaran') {
    const inputSetting = document.getElementById('inputSettingBudget');
    if (inputSetting) inputSetting.value = state.budgetLimit;
    updatePresetButtonsUI(state.budgetLimit);
    renderCatalogList();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===================================================================
// PWA INSTALLATION HELPER
// ===================================================================

let deferredInstallPrompt = null;
const btnInstallPwa = document.getElementById('btnInstallPwa');
const pwaToast = document.getElementById('pwaToast');
const btnAcceptInstall = document.getElementById('btnAcceptInstall');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  if (btnInstallPwa) btnInstallPwa.style.display = 'flex';
  if (pwaToast) pwaToast.classList.add('show');
});

if (btnAcceptInstall) {
  btnAcceptInstall.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      pwaToast.classList.remove('show');
      if (btnInstallPwa) btnInstallPwa.style.display = 'none';
    }
    deferredInstallPrompt = null;
  });
}

if (btnInstallPwa) {
  btnInstallPwa.addEventListener('click', async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
    } else {
      showToast('Buka menu browser Anda (titik 3/share) lalu pilih "Tambahkan ke Layar Utama".', 'info');
    }
  });
}

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('Service Worker registered with scope:', reg.scope))
      .catch((err) => console.warn('SW registration failed:', err));
  });
}

// ===================================================================
// EVENT LISTENERS & INITIALIZATION
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
  loadStateFromStorage();

  // Initialize UI components
  renderGroceryList();
  renderCatalogList();
  renderHistoryView();
  updateSafetyBudgetBar();
  syncMetaControls();

  // Event Listeners for Store Location & Shopping Date
  const inputStore = document.getElementById('inputStoreLocation');
  const inputDate = document.getElementById('inputShoppingDate');

  if (inputStore) {
    inputStore.value = state.storeLocation || 'Supermarket';
    inputStore.addEventListener('input', (e) => {
      state.storeLocation = e.target.value.trim() || 'Supermarket';
      persistState();
    });
  }

  if (inputDate) {
    inputDate.value = state.shoppingDate || new Date().toISOString().split('T')[0];
    inputDate.addEventListener('change', (e) => {
      state.shoppingDate = e.target.value || new Date().toISOString().split('T')[0];
      persistState();
    });
  }

  // ===================================================================
  // REALTIME MULTI-DEVICE FIRESTORE LISTENER (onSnapshot)
  // HP di Supermarket & PC di Rumah Tersinkron Otomatis Tanpa Refresh!
  // ===================================================================
  listenToActiveSession((remoteData, meta) => {
    if (!remoteData) {
      // Belum ada dokumen sesi aktif di Cloud Firestore, inisialisasi dari lokal
      triggerCloudSync();
      return;
    }

    // Hindari echo write-back saat menerima snapshot remote
    isReceivingRemoteUpdate = true;
    try {
      if (remoteData.storeLocation !== undefined) state.storeLocation = String(remoteData.storeLocation);
      if (remoteData.shoppingDate !== undefined) state.shoppingDate = String(remoteData.shoppingDate);
      if (remoteData.walletLimit !== undefined) state.budgetLimit = Number(remoteData.walletLimit);
      if (Array.isArray(remoteData.items)) {
        state.groceryItems = remoteData.items.map(item => ({
          id: String(item.id || ('item-' + Date.now())),
          name: String(item.name || ''),
          category: String(item.category || 'Bahan Pokok'),
          unit: String(item.unit || 'pcs'),
          qty: Math.max(1, Number(item.qty) || 1),
          unitPrice: Number(item.unitPrice) || 0,
          discountMode: item.discountMode || 'NONE',
          discountSingle: Number(item.discountSingle) || 0,
          discountTier1: Number(item.discountTier1) || 0,
          discountTier2: Number(item.discountTier2) || 0,
          discountNominal: Number(item.discountNominal) || 0,
          cleanUnitPrice: Number(item.cleanUnitPrice !== undefined ? item.cleanUnitPrice : item.unitPrice) || 0,
          lineSubtotal: Number(item.lineSubtotal) || 0,
          lineSavings: Number(item.lineSavings) || 0,
          isChecked: Boolean(item.isChecked),
          addedAt: item.addedAt || new Date().toISOString()
        }));
      }

      // Update LocalStorage agar saat offline/F5 tetap aman
      localStorage.setItem('tr_budget_limit', state.budgetLimit.toString());
      localStorage.setItem('tr_store_location', state.storeLocation);
      localStorage.setItem('tr_shopping_date', state.shoppingDate);
      localStorage.setItem('tr_grocery_items', JSON.stringify(state.groceryItems));

      // Update Tab 3 setting inputs & preset buttons in real-time
      const settingInput = document.getElementById('inputSettingBudget');
      if (settingInput && document.activeElement !== settingInput) {
        settingInput.value = state.budgetLimit;
      }
      updatePresetButtonsUI(state.budgetLimit);

      // Re-render UI seketika di layar HP atau PC
      syncMetaControls();
      renderGroceryList();
      updateSafetyBudgetBar();

      if (meta && meta.fromCache) {
        updateSyncStatusUI('offline', 'Cache Lokal (Offline)');
      } else {
        updateSyncStatusUI('live', 'Realtime Sync');
      }
    } catch (err) {
      console.error('[Error applying remote snapshot]:', err);
    } finally {
      setTimeout(() => {
        isReceivingRemoteUpdate = false;
      }, 150);
    }
  }, (err) => {
    console.warn('[Realtime Sync Warning]:', err);
    updateSyncStatusUI('offline', 'Offline (Lokal)');
  });

  // Bottom Navigation tabs click
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Category filter chips
  document.querySelectorAll('.cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.filterCategory = pill.getAttribute('data-category');
      renderGroceryList();
    });
  });

  // Search input
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderGroceryList();
    });
  }

  // Floating Add button & Header triggers
  document.getElementById('btnOpenAddModal').addEventListener('click', openAddItemModal);
  document.getElementById('btnCloseItemModal').addEventListener('click', closeItemModal);
  document.getElementById('btnOpenBudgetModal').addEventListener('click', openBudgetModal);
  document.getElementById('btnEditBudgetTrigger').addEventListener('click', openBudgetModal);

  // Stepper inside Item form
  document.getElementById('btnFormQtyMinus').addEventListener('click', () => {
    const cur = Number(inputFormQty.value) || 1;
    if (cur > 1) inputFormQty.value = cur - 1;
    updateFormLiveCalculation();
  });

  document.getElementById('btnFormQtyPlus').addEventListener('click', () => {
    const cur = Number(inputFormQty.value) || 1;
    inputFormQty.value = cur + 1;
    updateFormLiveCalculation();
  });

  inputFormQty.addEventListener('input', updateFormLiveCalculation);
  inputUnitPrice.addEventListener('input', updateFormLiveCalculation);
  inputItemName.addEventListener('input', (e) => {
    // Auto-detect benchmark price if exact match
    const match = state.benchmarkCatalog.find(b => b.name.toLowerCase() === e.target.value.toLowerCase().trim());
    if (match) {
      lblRefPriceHint.textContent = `Bln lalu: ${formatRupiah(match.price)}`;
      if (!inputUnitPrice.value) {
        inputUnitPrice.value = match.price;
      }
      selectCategory.value = match.category;
      selectUnit.value = match.unit;
    } else {
      lblRefPriceHint.textContent = '';
    }
    updateFormLiveCalculation();
  });

  // Quick Add Price Chips (+5rb, +10rb, +25rb, +50rb)
  document.querySelectorAll('.btn-quick-price').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const amount = Number(btn.getAttribute('data-add')) || 0;
      addNominalToPrice(amount);
    });
  });

  // Quick Qty multipliers (2x, 3x, 5x)
  document.querySelectorAll('.btn-quick-qty').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const qty = Number(btn.getAttribute('data-qty')) || 1;
      setFormQty(qty);
    });
  });

  // Discount mode tab switcher buttons
  document.querySelectorAll('.btn-disc-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const mode = tab.getAttribute('data-mode') || 'NONE';
      selectDiscountMode(mode);
    });
  });

  // Form submit & submit button listeners
  const itemForm = document.getElementById('itemForm');
  if (itemForm) {
    itemForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveGroceryItem(e);
    });
  }

  const btnSubmitItemForm = document.getElementById('btnSubmitItemForm');
  if (btnSubmitItemForm) {
    btnSubmitItemForm.addEventListener('click', (e) => {
      e.preventDefault();
      saveGroceryItem(e);
    });
  }

  // Discount inputs live update
  inputDiscSingle.addEventListener('input', updateFormLiveCalculation);
  inputDiscTier1.addEventListener('input', updateFormLiveCalculation);
  inputDiscTier2.addEventListener('input', updateFormLiveCalculation);
  inputDiscNominal.addEventListener('input', updateFormLiveCalculation);

  // Finish shopping session
  document.getElementById('btnFinishSession').addEventListener('click', finishShoppingSession);

  // Tab 3: Input manual batas dompet listener (reaktif update visual preset)
  const inputSettingBudget = document.getElementById('inputSettingBudget');
  if (inputSettingBudget) {
    const handleSettingChange = () => {
      const parsed = parseBudgetInput(inputSettingBudget.value);
      updatePresetButtonsUI(parsed);
    };
    inputSettingBudget.addEventListener('input', handleSettingChange);
    inputSettingBudget.addEventListener('change', handleSettingChange);
  }

  // Tab 3: Delegated click listener untuk preset nominal anggaran
  const presetBudgetGrid = document.getElementById('presetBudgetGrid');
  if (presetBudgetGrid) {
    presetBudgetGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-budget-preset');
      if (!btn) return;
      const amt = btn.getAttribute('data-amount');
      if (amt) {
        selectBudgetPreset(amt);
      }
    });
  }

  // Tab 3: Tombol Simpan Batas Anggaran
  const btnSaveSetting = document.getElementById('btnSaveBudgetSetting');
  if (btnSaveSetting) {
    btnSaveSetting.addEventListener('click', (e) => {
      e.preventDefault();
      saveBudgetSetting();
    });
  }

  // Quick Budget Modal handlers (Ubah Limit Dompet)
  const btnSaveQuick = document.getElementById('btnSaveQuickBudget');
  if (btnSaveQuick) {
    btnSaveQuick.addEventListener('click', (e) => {
      e.preventDefault();
      saveQuickBudget();
    });
  }

  const formQuickBudget = document.getElementById('quickBudgetForm');
  if (formQuickBudget) {
    formQuickBudget.addEventListener('submit', (e) => {
      e.preventDefault();
      saveQuickBudget();
    });
  }

  const btnCloseBudget = document.getElementById('btnCloseBudgetModal');
  if (btnCloseBudget) {
    btnCloseBudget.addEventListener('click', closeBudgetModal);
  }

  document.getElementById('btnResetDefaultCatalog').addEventListener('click', resetDefaultCatalog);

  // Close modals on overlay backdrop click
  const itemModalOverlay = document.getElementById('itemModalOverlay');
  if (itemModalOverlay) {
    itemModalOverlay.addEventListener('click', (e) => {
      if (e.target === itemModalOverlay) closeItemModal();
    });
  }

  const budgetOverlay = document.getElementById('budgetModalOverlay');
  if (budgetOverlay) {
    budgetOverlay.addEventListener('click', (e) => {
      if (e.target === budgetOverlay) closeBudgetModal();
    });
  }

  // Confirm delete modal backdrop click
  const confirmDeleteModal = document.getElementById('confirmDeleteModal');
  if (confirmDeleteModal) {
    confirmDeleteModal.addEventListener('click', (e) => {
      if (e.target === confirmDeleteModal) {
        confirmDeleteModal.classList.remove('active');
        activeConfirmCallback = null;
      }
    });
  }
  // Initial visual active state for preset buttons
  updatePresetButtonsUI(state.budgetLimit);
});

// ===================================================================
// GLOBAL WINDOW EXPORTS (ES Module compatibility for inline HTML onclick)
// ===================================================================
window.saveGroceryItem = saveGroceryItem;
window.quickAddPreset = quickAddPreset;
window.toggleItemCheck = toggleItemCheck;
window.deleteGroceryItem = deleteGroceryItem;
window.openEditItemModal = openEditItemModal;
window.changeItemQty = changeItemQty;
window.setItemQtyDirect = setItemQtyDirect;
window.requestClearCart = requestClearCart;
window.setBudgetAmount = setBudgetAmount;
window.selectBudgetPreset = selectBudgetPreset;
window.saveBudgetSetting = saveBudgetSetting;
window.updatePresetButtonsUI = updatePresetButtonsUI;
window.openBudgetModal = openBudgetModal;
window.closeBudgetModal = closeBudgetModal;
window.saveQuickBudget = saveQuickBudget;
window.parseBudgetInput = parseBudgetInput;
window.selectDiscountMode = selectDiscountMode;
window.addNominalToPrice = addNominalToPrice;
window.setFormQty = setFormQty;
window.deleteBenchmarkItem = deleteBenchmarkItem;
window.useAsBenchmark = useHistoryAsCurrentBenchmark;
window.useHistoryAsCurrentBenchmark = useHistoryAsCurrentBenchmark;
window.deleteHistorySession = deleteHistorySession;
window.closeItemModal = closeItemModal;
window.openAddItemModal = openAddItemModal;
window.resetDefaultCatalog = resetDefaultCatalog;
window.showToast = showToast;
window.openConfirmModal = openConfirmModal;
window.addCatalogProductToCart = addCatalogProductToCart;
window.changeCatalogProductQty = changeCatalogProductQty;
window.MASTER_PRODUCTS_CATALOG = MASTER_PRODUCTS_CATALOG;
