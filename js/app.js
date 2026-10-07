/**
 * SMART GROCERY & BUDGET SAFETY TRACKER (TroliRantau)
 * Architecture: Mobile PWA, Ergonomic Touch UI, Realtime Reactive State
 */

// ===================================================================
// CONSTANTS & INITIAL BENCHMARK SEEDS
// ===================================================================

const DEFAULT_BENCHMARK_CATALOG = [
  { id: 'cat-1', name: 'Beras Ramos 5kg', category: 'Bahan Pokok', unit: 'kg', price: 71000 },
  { id: 'cat-2', name: 'Telur Ayam 1kg', category: 'Bahan Pokok', unit: 'kg', price: 29500 },
  { id: 'cat-3', name: 'Minyak Goreng 2L', category: 'Bahan Pokok', unit: 'liter', price: 34500 },
  { id: 'cat-4', name: 'Indomie Goreng (5 pcs)', category: 'Makanan & Camilan', unit: 'pack', price: 15000 },
  { id: 'cat-5', name: 'Sabun Mandi Refill 450ml', category: 'Kebersihan & Mandi', unit: 'pack', price: 26000 },
  { id: 'cat-6', name: 'Deterjen Rinso 770g', category: 'Kebersihan & Mandi', unit: 'pack', price: 22000 },
  { id: 'cat-7', name: 'Mama Lemon 680ml', category: 'Kebersihan & Mandi', unit: 'botol', price: 10500 },
  { id: 'cat-8', name: 'Kopi Kapal Api 10x', category: 'Minuman', unit: 'pack', price: 13000 },
  { id: 'cat-9', name: 'Ultra Milk Full Cream 1L', category: 'Minuman', unit: 'liter', price: 19000 },
  { id: 'cat-10', name: 'Bawang Merah 250g', category: 'Bumbu & Masak', unit: 'pack', price: 12000 },
  { id: 'cat-11', name: 'Kecap Manis Bango 520ml', category: 'Bumbu & Masak', unit: 'botol', price: 24000 }
];

const INITIAL_DEMO_GROCERY_ITEMS = [
  {
    id: 'demo-1',
    name: 'Beras Ramos 5kg',
    category: 'Bahan Pokok',
    unit: 'kg',
    qty: 1,
    unitPrice: 74000,
    discountMode: 'NONE',
    discountSingle: 0,
    discountTier1: 0,
    discountTier2: 0,
    discountNominal: 0,
    isChecked: true,
    addedAt: new Date().toISOString()
  },
  {
    id: 'demo-2',
    name: 'Telur Ayam 1kg',
    category: 'Bahan Pokok',
    unit: 'kg',
    qty: 1,
    unitPrice: 28000,
    discountMode: 'NONE',
    discountSingle: 0,
    discountTier1: 0,
    discountTier2: 0,
    discountNominal: 0,
    isChecked: true,
    addedAt: new Date().toISOString()
  },
  {
    id: 'demo-3',
    name: 'Sabun Mandi Refill 450ml',
    category: 'Kebersihan & Mandi',
    unit: 'pack',
    qty: 2,
    unitPrice: 25000,
    discountMode: 'STACKED',
    discountSingle: 0,
    discountTier1: 50,
    discountTier2: 20,
    discountNominal: 0,
    isChecked: false,
    addedAt: new Date().toISOString()
  },
  {
    id: 'demo-4',
    name: 'Indomie Goreng (5 pcs)',
    category: 'Makanan & Camilan',
    unit: 'pack',
    qty: 3,
    unitPrice: 15500,
    discountMode: 'SINGLE',
    discountSingle: 10,
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
    date: '15 September 2026',
    itemCount: 8,
    totalSpent: 485000,
    totalSaved: 42000,
    budgetLimit: 750000,
    itemsPreview: [
      { name: 'Beras Ramos 5kg', qty: 1, price: 71000 },
      { name: 'Minyak Goreng 2L', qty: 2, price: 69000 },
      { name: 'Telur Ayam 1kg', qty: 1, price: 29500 },
      { name: 'Toiletries & Sabun', qty: 4, price: 95500 }
    ]
  }
];

// ===================================================================
// APP STATE MANAGEMENT
// ===================================================================

const state = {
  budgetLimit: 750000,
  groceryItems: [],
  benchmarkCatalog: [],
  historySessions: [],
  activeTab: 'tab-belanja',
  filterCategory: 'ALL',
  searchQuery: '',
  formDiscountMode: 'NONE'
};

// ===================================================================
// STORAGE HELPERS
// ===================================================================

function loadStateFromStorage() {
  try {
    const savedLimit = localStorage.getItem('tr_budget_limit');
    if (savedLimit) state.budgetLimit = parseInt(savedLimit, 10);

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

function persistState() {
  try {
    localStorage.setItem('tr_budget_limit', state.budgetLimit.toString());
    localStorage.setItem('tr_benchmark_catalog', JSON.stringify(state.benchmarkCatalog));
    localStorage.setItem('tr_grocery_items', JSON.stringify(state.groceryItems));
    localStorage.setItem('tr_history_sessions', JSON.stringify(state.historySessions));
  } catch (e) {
    console.error('Error saving state:', e);
  }
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

  // Status Classes & Warnings
  safetyCard.classList.remove('state-safe', 'state-warning', 'state-danger');

  if (percentage < 75) {
    safetyCard.classList.add('state-safe');
    safetyBadge.className = 'safety-badge badge-safe';
    safetyBadge.innerHTML = '<i data-lucide="shield-check" style="width:12px;height:12px;"></i> Aman';
    lblAdvice.textContent = 'Keranjang masih santai 👍';
    lblRemaining.style.color = 'var(--primary)';
  } else if (percentage <= 92) {
    safetyCard.classList.add('state-warning');
    safetyBadge.className = 'safety-badge badge-warning';
    safetyBadge.innerHTML = '<i data-lucide="alert-triangle" style="width:12px;height:12px;"></i> Waspada';
    lblAdvice.textContent = 'Mendekati batas dompet! ⚠️';
    lblRemaining.style.color = 'var(--accent-amber)';
  } else {
    safetyCard.classList.add('state-danger');
    safetyBadge.className = 'safety-badge badge-danger';
    safetyBadge.innerHTML = '<i data-lucide="siren" style="width:12px;height:12px;"></i> Over Budget!';
    lblAdvice.textContent = '🚨 REM BELANJA! Melebihi Limit Dompet!';
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
// RENDER GROCERY LIST (TAB 1)
// ===================================================================

function renderGroceryList() {
  const container = document.getElementById('groceryListContainer');
  const finishBox = document.getElementById('trolleyFinishBox');
  const searchQ = state.searchQuery.toLowerCase().trim();
  const filterCat = state.filterCategory;

  const filteredItems = state.groceryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQ);
    const matchesCat = filterCat === 'ALL' || item.category === filterCat;
    return matchesSearch && matchesCat;
  });

  if (filteredItems.length === 0) {
    if (state.groceryItems.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon-wrap">
            <i data-lucide="shopping-bag" style="width:30px;height:30px;"></i>
          </div>
          <h3>Troli Belanja Masih Kosong</h3>
          <p>Tap tombol "+ Tambah Item" atau pilih rekomendasi cepat anak rantau di atas untuk mulai mencatat.</p>
        </div>
      `;
      if (finishBox) finishBox.style.display = 'none';
    } else {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon-wrap">
            <i data-lucide="search-x" style="width:30px;height:30px;"></i>
          </div>
          <h3>Barang Tidak Ditemukan</h3>
          <p>Coba kata kunci lain atau ubah filter kategori belanja.</p>
        </div>
      `;
      if (finishBox) finishBox.style.display = 'flex';
    }
    refreshIcons();
    updateSafetyBudgetBar();
    return;
  }

  if (finishBox) finishBox.style.display = 'flex';

  let html = '';
  filteredItems.forEach(item => {
    const calc = calculateItemPrice(item);
    const comp = compareWithLastMonth(item.name, item.unitPrice);

    // Comparator Badge Class
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

    // Discount Badge
    let discountHtml = '';
    if (calc.discountPerUnit > 0) {
      discountHtml = `<div class="discount-tag"><i data-lucide="tag" style="width:12px;height:12px;"></i> ${calc.discountDescription} (Hemat ${formatRupiah(calc.lineSavings)})</div>`;
    }

    // Strikethrough price
    let originalStriked = '';
    if (calc.lineSavings > 0) {
      originalStriked = `<span class="price-original-striked">${formatRupiah(calc.originalLineTotal)}</span>`;
    }

    html += `
      <div class="grocery-card ${item.isChecked ? 'checked' : ''}" id="item-${item.id}">
        <div class="grocery-card-top">
          <!-- Big Trolley Checkbox -->
          <button class="trolley-check-btn" onclick="toggleItemCheck('${item.id}')" title="Tandai Sudah di Troli">
            <i data-lucide="check"></i>
          </button>

          <!-- Core details -->
          <div class="item-core-details">
            <div class="item-header-meta">
              <span class="badge-category">${item.category}</span>
              <span class="item-unit-badge">@${item.unit}</span>
            </div>
            <div class="item-name">${item.name}</div>
            ${compHtml}
            ${discountHtml}
          </div>

          <!-- Edit & Delete buttons -->
          <div class="item-actions-top">
            <button class="btn-card-action" onclick="openEditItemModal('${item.id}')" title="Edit Item">
              <i data-lucide="edit-3" style="width:16px;height:16px;"></i>
            </button>
            <button class="btn-card-action btn-del" onclick="deleteGroceryItem('${item.id}')" title="Hapus Item">
              <i data-lucide="trash-2" style="width:16px;height:16px;"></i>
            </button>
          </div>
        </div>

        <!-- Bottom row: Qty Stepper & Live Subtotal -->
        <div class="grocery-card-bottom">
          <div class="stepper-container">
            <button class="btn-stepper" onclick="changeItemQty('${item.id}', -1)">-</button>
            <span class="stepper-value">${item.qty}</span>
            <button class="btn-stepper" onclick="changeItemQty('${item.id}', 1)">+</button>
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
  });

  container.innerHTML = html;
  refreshIcons();
  updateSafetyBudgetBar();
}

// ===================================================================
// ITEM INTERACTION HANDLERS (STEPPER, CHECK, DELETE)
// ===================================================================

function changeItemQty(itemId, delta) {
  const item = state.groceryItems.find(i => i.id === itemId);
  if (!item) return;

  const newQty = (item.qty || 1) + delta;
  if (newQty <= 0) {
    if (confirm(`Hapus "${item.name}" dari troli belanja?`)) {
      deleteGroceryItem(itemId);
    }
    return;
  }

  item.qty = newQty;
  persistState();
  renderGroceryList();
}

function toggleItemCheck(itemId) {
  const item = state.groceryItems.find(i => i.id === itemId);
  if (!item) return;

  item.isChecked = !item.isChecked;
  persistState();
  renderGroceryList();
}

function deleteGroceryItem(itemId) {
  state.groceryItems = state.groceryItems.filter(i => i.id !== itemId);
  persistState();
  renderGroceryList();
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
  let t1 = 0;
  let t2 = 0;

  if (discountTag === '50+20') {
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
      discountSingle: 0,
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

  // Update tabs
  document.querySelectorAll('.btn-disc-tab').forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('data-mode') === mode);
  });

  paneDiscSingle.style.display = mode === 'SINGLE' ? 'block' : 'none';
  paneDiscStacked.style.display = mode === 'STACKED' ? 'block' : 'none';
  paneDiscNominal.style.display = mode === 'NOMINAL' ? 'block' : 'none';

  updateFormLiveCalculation();
}

function addNominalToPrice(amount) {
  const current = Number(inputUnitPrice.value) || 0;
  inputUnitPrice.value = current + amount;
  updateFormLiveCalculation();
}

function setFormQty(qty) {
  inputFormQty.value = qty;
  updateFormLiveCalculation();
}

// Realtime calculation & comparator preview inside form
function updateFormLiveCalculation() {
  const name = inputItemName.value;
  const basePrice = Number(inputUnitPrice.value) || 0;
  const qty = Math.max(1, Number(inputFormQty.value) || 1);
  const mode = state.formDiscountMode;

  // Comparator vs last month
  const comp = compareWithLastMonth(name, basePrice);
  if (basePrice > 0) {
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
  } else {
    formComparatorFeedback.className = 'form-comparator-feedback';
    formComparatorFeedback.innerHTML = '';
  }

  // Math calculation
  const mockItem = {
    unitPrice: basePrice,
    qty,
    discountMode: mode,
    discountSingle: Number(inputDiscSingle.value) || 0,
    discountTier1: Number(inputDiscTier1.value) || 0,
    discountTier2: Number(inputDiscTier2.value) || 0,
    discountNominal: Number(inputDiscNominal.value) || 0
  };

  const calc = calculateItemPrice(mockItem);

  // Discount Pill & Math Walkthrough Explanation
  if (mode === 'NONE') {
    lblDiscountSummaryPill.textContent = 'Tanpa Diskon';
    discountMathPreview.style.display = 'none';
  } else if (mode === 'SINGLE') {
    lblDiscountSummaryPill.textContent = `Diskon ${mockItem.discountSingle}%`;
    discountMathPreview.style.display = 'block';
    discountMathPreview.innerHTML = `
      <div><strong>Rumus Diskon Tunggal (${mockItem.discountSingle}%):</strong></div>
      <div>${formatRupiah(basePrice)} - ${mockItem.discountSingle}% = <strong>${formatRupiah(calc.cleanUnitPrice)}</strong> per ${selectUnit.value}</div>
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
      <div>${formatRupiah(basePrice)} - ${formatRupiah(mockItem.discountNominal)} = <strong>${formatRupiah(calc.cleanUnitPrice)}</strong> per ${selectUnit.value}</div>
    `;
  }

  // Live subtotal display
  lblFormLiveSubtotal.textContent = formatRupiah(calc.lineSubtotal);
  if (calc.lineSavings > 0) {
    lblFormLiveStrikedPrice.style.display = 'block';
    lblFormLiveStrikedPrice.textContent = formatRupiah(calc.originalLineTotal);
  } else {
    lblFormLiveStrikedPrice.style.display = 'none';
  }

  refreshIcons();
}

function saveGroceryItem() {
  const name = inputItemName.value.trim();
  const category = selectCategory.value;
  const unit = selectUnit.value;
  const unitPrice = Number(inputUnitPrice.value);
  const qty = Math.max(1, Number(inputFormQty.value) || 1);
  const editId = editItemIdInput.value;

  if (!name || isNaN(unitPrice) || unitPrice <= 0) {
    alert('Mohon isi nama produk dan harga satuan dengan benar!');
    return;
  }

  const discountMode = state.formDiscountMode;
  const discountSingle = Number(inputDiscSingle.value) || 0;
  const discountTier1 = Number(inputDiscTier1.value) || 0;
  const discountTier2 = Number(inputDiscTier2.value) || 0;
  const discountNominal = Number(inputDiscNominal.value) || 0;

  if (editId) {
    // Update existing
    const item = state.groceryItems.find(i => i.id === editId);
    if (item) {
      item.name = name;
      item.category = category;
      item.unit = unit;
      item.unitPrice = unitPrice;
      item.qty = qty;
      item.discountMode = discountMode;
      item.discountSingle = discountSingle;
      item.discountTier1 = discountTier1;
      item.discountTier2 = discountTier2;
      item.discountNominal = discountNominal;
    }
  } else {
    // Add new item
    state.groceryItems.unshift({
      id: 'item-' + Date.now(),
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
      isChecked: false,
      addedAt: new Date().toISOString()
    });
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

  persistState();
  closeItemModal();
  renderGroceryList();
}

// ===================================================================
// TAB 2: RIWAYAT & DATABASE BELANJA
// ===================================================================

function finishShoppingSession() {
  if (state.groceryItems.length === 0) {
    alert('Keranjang troli masih kosong!');
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
    itemCount: state.groceryItems.length,
    totalSpent,
    totalSaved,
    budgetLimit: state.budgetLimit,
    itemsPreview: itemsSnapshot
  };

  state.historySessions.unshift(newSession);

  // Clear current trolley
  state.groceryItems = [];
  persistState();

  alert(`🎉 Belanja Berhasil Disimpan!\nTotal Belanja: ${formatRupiah(totalSpent)}\nHemat Diskon: ${formatRupiah(totalSaved)}\n\nDatabase harga belanja ini otomatis dijadikan acuan pembanding resmi untuk bulan depan!`);

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
  alert(`✅ Sesi ${session.date} berhasil dijadikan patokan harga bulan lalu!`);
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

function setBudgetAmount(amount) {
  state.budgetLimit = amount;
  document.getElementById('inputSettingBudget').value = amount;
  persistState();
  updateSafetyBudgetBar();

  // Update preset buttons active state
  document.querySelectorAll('.btn-budget-preset').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.includes(amount.toLocaleString('id-ID')));
  });
}

function resetDefaultCatalog() {
  if (confirm('Kembalikan database harga acuan bulan lalu ke template default anak rantau?')) {
    state.benchmarkCatalog = JSON.parse(JSON.stringify(DEFAULT_BENCHMARK_CATALOG));
    persistState();
    renderCatalogList();
    renderGroceryList();
    alert('✅ Database harga acuan telah direset.');
  }
}

// Quick Budget Modal
const budgetModalOverlay = document.getElementById('budgetModalOverlay');
const quickBudgetInput = document.getElementById('quickBudgetInput');

function openBudgetModal() {
  quickBudgetInput.value = state.budgetLimit;
  budgetModalOverlay.classList.add('active');
  quickBudgetInput.focus();
}

function closeBudgetModal() {
  budgetModalOverlay.classList.remove('active');
}

function saveQuickBudget() {
  const val = Number(quickBudgetInput.value);
  if (val && val > 0) {
    setBudgetAmount(val);
    closeBudgetModal();
  }
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
    document.getElementById('inputSettingBudget').value = state.budgetLimit;
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
      alert('Untuk memasang PWA di HP:\nBuka menu browser Anda (titik 3 atau tombol share) lalu pilih "Tambahkan ke Layar Utama / Add to Home screen".');
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

  // Discount inputs live update
  inputDiscSingle.addEventListener('input', updateFormLiveCalculation);
  inputDiscTier1.addEventListener('input', updateFormLiveCalculation);
  inputDiscTier2.addEventListener('input', updateFormLiveCalculation);
  inputDiscNominal.addEventListener('input', updateFormLiveCalculation);

  // Finish shopping session
  document.getElementById('btnFinishSession').addEventListener('click', finishShoppingSession);

  // Save budget from setting tab
  document.getElementById('btnSaveBudgetSetting').addEventListener('click', () => {
    const val = Number(document.getElementById('inputSettingBudget').value);
    if (val && val > 0) {
      setBudgetAmount(val);
      alert('✅ Batas anggaran berhasil diperbarui!');
    }
  });

  document.getElementById('btnResetDefaultCatalog').addEventListener('click', resetDefaultCatalog);

  // Close modals on overlay backdrop click
  itemModalOverlay.addEventListener('click', (e) => {
    if (e.target === itemModalOverlay) closeItemModal();
  });

  budgetModalOverlay.addEventListener('click', (e) => {
    if (e.target === budgetModalOverlay) closeBudgetModal();
  });
});
