/********************
 * Data bootstrap *
 ********************/
const API_BASE = 'http://localhost:3000/api';
const LS_KEYS = {
  PRODUCTS: 'fw_products',
  CART: 'fw_cart',
  ORDERS: 'fw_orders',
  USER: 'fw_user',
  SUPPLIERS: 'fw_suppliers',
  LAST_ORDER_ID: 'fw_last_order_id'
};

// API helper functions
async function apiGet(endpoint) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('API GET error:', error);
    return null;
  }
}

async function apiPost(endpoint, data) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('API POST error:', error);
    return null;
  }
}

async function bootstrapData() {
  // Try to get products from API first
  let products = await apiGet('/products');
  
  if (products && products.length > 0) {
    setJSON(LS_KEYS.PRODUCTS, products);
  } else {
    // Fallback to seed data if API fails
    const seed = [
      {
        id: 'p1',
        name: 'Hand-Forged Chef Knife',
        price: 1299.00,
        category: 'Kitchen',
        image: 'images/knife1.png',
        info: 'High-carbon steel, 8-inch.',
        desc: 'Expertly hand-forged from high-carbon steel for exceptional sharpness and durability.\nThe ergonomic handle provides perfect balance and comfort during extended use.\nFeatures a razor-sharp edge that maintains its sharpness longer than machine-made alternatives.\nA timeless kitchen essential that combines traditional craftsmanship with modern performance.'
      },
      {
        id: 'p2',
        name: 'Paring Knife',
        price: 599.00,
        category: 'Kitchen',
        image: 'Images/paring.png',
        info: 'Precise control',
        desc: 'Precision-crafted small blade perfect for detailed kitchen work and intricate food preparation.\nThe compact design offers superior control for peeling, trimming, and delicate cutting tasks.\nHigh-quality stainless steel construction ensures long-lasting sharpness and easy maintenance.\nAn indispensable tool for both professional chefs and home cooking enthusiasts.'
      },
      {
        id: 'p3',
        name: 'Custom Fire Poker',
        price: 349.00,
        category: 'Home',
        image: 'Images/poker.png',
        info: 'Twisted handle',
        desc: 'Hand-forged steel fire poker with textured grip handle for secure, comfortable use.\nThe curved hook design allows for easy log manipulation and ash management.\nBuilt to withstand high temperatures while maintaining structural integrity through years of use.\nCustom length and design options available to match your fireplace or outdoor fire pit.'
      },
      {
        id: 'p4',
        name: 'Outdoor Camp Axe',
        price: 1799.00,
        category: 'Outdoor',
        image: 'images/axe.png',
        info: 'Forged head, ash handle.',
        desc: 'Rugged camping axe featuring a sharp steel head and traditional wooden handle.\nPerfect for splitting kindling, chopping firewood, and general campsite tasks.\nThe balanced weight distribution ensures efficient cutting with minimal effort required.\nCompact size makes it ideal for backpacking and car camping adventures.'
      },
      {
        id: 'p5',
        name: 'Wall Hook Set (4)',
        price: 299.00,
        category: 'Home',
        image: 'Images/hooks.png',
        info: 'Wrought iron.',
        desc: 'Sleek modern wall hooks crafted from durable materials with a contemporary finish.\nEach hook features a strong mounting system capable of holding coats, bags, and accessories.\nThe minimalist design complements any interior décor while maximizing functionality.\nSet includes four matching hooks with all necessary mounting hardware included.'
      },
      {
        id: 'p6',
        name: 'Custom Bottle Opener',
        price: 149.00,
        category: 'Gifts',
        image: 'Images/opener.png',
        info: 'Personalizable.',
        desc: 'Heavy-duty bottle opener with ergonomic handle designed for comfortable, effortless operation.\nSolid construction ensures reliable performance for years of entertaining and daily use.\nThe sleek design doubles as a conversation piece while maintaining practical functionality.\nAvailable in multiple finishes and can be personalized with custom engraving options.'
      }
    ];
    
    setJSON(LS_KEYS.PRODUCTS, seed);
    
    // Also send seed data to API
    seed.forEach(product => {
      apiPost('/products', product);
    });
  }

  // Initialize other data
  if (!localStorage.getItem(LS_KEYS.CART)) {
    localStorage.setItem(LS_KEYS.CART, JSON.stringify([]));
  }
  
  if (!localStorage.getItem(LS_KEYS.ORDERS)) {
    localStorage.setItem(LS_KEYS.ORDERS, JSON.stringify([]));
  }
  
  if (!localStorage.getItem(LS_KEYS.SUPPLIERS)) {
    const seedSup = [
      {id: 's1', name: 'IronWorks SA', email: 'sales@ironworks.co.za', materials: ['steel', 'iron'], leadTime: 7},
      {id: 's2', name: 'EdgeCraft', email: 'hello@edgecraft.africa', materials: ['handles', 'fasteners'], leadTime: 5}
    ];
    localStorage.setItem(LS_KEYS.SUPPLIERS, JSON.stringify(seedSup));
  }
}

/*********************
 * Util helpers *
 *********************/
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const money = n => `R ${Number(n).toFixed(2)}`;
const getJSON = key => JSON.parse(localStorage.getItem(key) || 'null');
const setJSON = (key, val) => localStorage.setItem(key, JSON.stringify(val));
const uid = (p = 'id') => `${p}.${Math.random().toString(36).slice(2, 9)}`;

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1800);
}

function showSpinner(on = true) {
  const s = document.getElementById('spinnerOverlay');
  if (!s) return;
  s.style.display = on ? 'flex' : 'none';
}

/********************
 * Cart / UI *
 ********************/
function initCartIcon() {
  const el = document.getElementById('cartIcon');
  if (!el) return;
  el.innerHTML = `<a href="cart.html" aria-label="Cart">
    <span id="cartCount">0</span>
  </a>`;
  updateCartCount();
}

function initUserIcon() {
  const el = document.getElementById('userIcon');
  if (!el) return;
  el.innerHTML = `<a href="account.html" aria-label="Account">^</a>`;
}

function updateCartCount() {
  const cart = getJSON(LS_KEYS.CART) || [];
  const qty = cart.reduce((a, c) => a + Number(c.qty || 0), 0);
  const cc = document.getElementById('cartCount');
  if (cc) cc.textContent = qty;
  
  const icon = document.querySelector('#cartIcon a');
  if (icon) { 
    icon.classList.remove('cart-animate'); 
    void icon.offsetWidth; 
    icon.classList.add('cart-animate'); 
  }
}

function addToCart(id, qty = 1) {
  const products = getJSON(LS_KEYS.PRODUCTS) || [];
  const product = products.find(p => p.id === id);
  if (!product) return;
  
  const cart = getJSON(LS_KEYS.CART) || [];
  const line = cart.find(i => i.id === id);
  
  if (line) line.qty += qty;
  else cart.push({id, name: product.name, price: product.price, image: product.image, qty});
  
  setJSON(LS_KEYS.CART, cart);
  updateCartCount();
  showToast(`Added ${qty} × ${product.name}`);
}

/****************************************************
 * Catalogue (index.html) *
 ****************************************************/
function renderCataloguePage() {
  const products = getJSON(LS_KEYS.PRODUCTS) || [];
  const grid = document.getElementById('grid');
  const categories = [...new Set(products.map(p => p.category || 'Uncategorised'))];
  const catBar = document.getElementById('categoryChips');
  let activeCat = 'All';
  
  function drawCats() {
    catBar.innerHTML = ['All', ...categories].map(c => 
      `<a href="#" data-cat="${c}" class="${c == activeCat ? 'active' : ''}">${c}</a>`
    ).join('');
    
    catBar.querySelectorAll('a').forEach(a => 
      a.addEventListener('click', e => {
        e.preventDefault();
        activeCat = a.dataset.cat;
        drawCats();
        drawGrid();
      })
    );
  }
  
  function drawGrid(list = products) {
    const term = ($('#searchInput')?.value || '').toLowerCase();
    const sort = $('#sortSelect')?.value || '';
    
    let filtered = list.filter(p => 
      (activeCat === 'All' || p.category === activeCat) &&
      (p.name.toLowerCase().includes(term) || (p.desc || '').toLowerCase().includes(term))
    );
    
    if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    if (sort === 'name-asc') filtered.sort((a, b) => a.name.localeCompare(b.name));
    
    grid.innerHTML = filtered.map(p => `
      <article class="product-card fade-in">
        <a href="product.html?id=${encodeURIComponent(p.id)}">
          <img src="${p.image || 'images/placeholder.jpg'}" alt="${p.name}" />
        </a>
        <h4 class="product-title">${p.name}</h4>
        <div class="product-info">${p.info || ''}</div>
        <div class="product-price">${money(p.price)}</div>
        <button class="button-primary" data-id="${p.id}">Add to cart</button>
      </article>
    `).join('');
    
    grid.querySelectorAll('button[data-id]').forEach(btn => {
      btn.addEventListener('click', () => addToCart(btn.dataset.id, 1));
    });
  }
  
  drawCats();
  drawGrid();
  
  $('#searchInput')?.addEventListener('input', () => drawGrid());
  $('#sortSelect')?.addEventListener('change', () => drawGrid());
}

/***********************
 * Product (product.html) *
 ***********************/
function renderProductPage() {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const products = getJSON(LS_KEYS.PRODUCTS) || [];
  const p = products.find(x => x.id === id);
  const mount = document.getElementById('productPage');
  
  if (!p) {
    mount.innerHTML = '<div class="empty-state">Product not found.</div>';
    return;
  }
  
  mount.innerHTML = `
    <div class="product-image">
      <img src="${p.image || 'images/placeholder.jpg'}" alt="${p.name}">
    </div>
    <div class="product-details">
      <h2>${p.name}</h2>
      <div class="price">${money(p.price)}</div>
      <p class="description">${p.desc || p.info || 'No description available'}</p>
      <div class="purchase-controls">
        <button class="qty-btn" id="minus">-</button>
        <span id="qty" style="min-width:2ch; text-align:center;">1</span>
        <button class="qty-btn" id="plus">+</button>
        <button class="button-primary" id="addBtn">Add to cart</button>
      </div>
    </div>
  `;
  
  let q = 1;
  const updateQty = () => $('#qty').textContent = q;
  
  $('#minus').onclick = () => { 
    if (q > 1) { 
      q--; 
      updateQty(); 
    } 
  };
  
  $('#plus').onclick = () => { 
    q++; 
    updateQty(); 
  };
  
  $('#addBtn').onclick = () => addToCart(p.id, q);
}

/*******************************************************
 * Account (account.html) *
 *******************************************************/
async function initAccountPage() {
  const form = $('#profileForm');
  const user = getJSON(LS_KEYS.USER) || {};
  
  $('#profName').value = user.name || '';
  $('#profEmail').value = user.email || '';
  $('#profPhone').value = user.phone || '';
  
  form.addEventListener('submit', async e => {
    e.preventDefault();
    
    const name = $('#profName').value.trim();
    const email = $('#profEmail').value.trim();
    const phone = $('#profPhone').value.trim();
    let ok = true;
    
    $('#errName').textContent = name ? '' : 'Name is required.';
    if (!name) ok = false;
    
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    $('#errEmail').textContent = emailOk ? '' : 'Valid email is required.';
    if (!emailOk) ok = false;
    
    const phoneOk = !phone || /^[\d\s\-]{7,}$/.test(phone);
    $('#errPhone').textContent = phoneOk ? '' : 'Enter a valid phone.';
    if (!phoneOk) ok = false;
    
    if (!ok) return;
    
    // Save to localStorage
    setJSON(LS_KEYS.USER, {name, email, phone});
    
    // Also save to database if user has an ID
    if (user.id) {
      await apiPost('/users/update', {id: user.id, name, email, phone});
    }
    
    showToast('Profile saved');
  });
  
  // Load order history from API
  try {
    const orders = await apiGet(`/orders?email=${user.email || ''}`);
    const tb = $("#orderHistoryTable tbody");
    
    if (orders && orders.length) {
      tb.innerHTML = orders.map(o => `
        <tr>
          <td>${o.id}</td>
          <td>${new Date(o.createdAt).toLocaleString()}</td>
          <td>${o.items.map(i => `${i.qty}× ${i.name}`).join(', ')}</td>
          <td>${money(o.total)}</td>
          <td>${o.status}</td>
        </tr>
      `).join('');
    } else {
      tb.innerHTML = `<tr><td colspan="5" class="empty-state">No orders yet.</td></tr>`;
    }
  } catch (error) {
    console.error('Error loading orders:', error);
    const tb = $("#orderHistoryTable tbody");
    tb.innerHTML = `<tr><td colspan="5" class="empty-state">Error loading orders.</td></tr>`;
  }
}

/***********************
 * Admin Products (admin.html) *
 ***********************/
async function initAdminProducts() {
  const form = $("#productForm");
  const fields = {
    id: $("#prodId"),
    name: $("#prodName"),
    price: $("#prodPrice"),
    category: $("#prodCategory"),
    image: $("#prodImage"),
    desc: $("#prodDesc"),
  };
  
  async function loadTable() {
    const products = getJSON(LS_KEYS.PRODUCTS) || [];
    const tb = $("#adminProductsTable tbody");
    
    tb.innerHTML = products.map(p => `
      <tr>
        <td>${p.id}</td>
        <td>${p.name}</td>
        <td>${money(p.price)}</td>
        <td>${p.category || ''}</td>
        <td>${p.image ? '✅' : '—'}</td>
        <td>
          <button class="button-primary" data-edit="${p.id}">Edit</button>
          <button class="button-primary" data-del="${p.id}" style="background:#222;color:#fff;border:1px solid var(--border);">Delete</button>
        </td>
      </tr>
    `).join('');
    
    tb.querySelectorAll('button[data-edit]').forEach(b => 
      b.onclick = () => editProduct(b.dataset.edit)
    );
    
    tb.querySelectorAll('button[data-del]').forEach(b => 
      b.onclick = () => deleteProduct(b.dataset.del)
    );
  }
  
  function editProduct(id) {
    const products = getJSON(LS_KEYS.PRODUCTS) || [];
    const p = products.find(x => x.id === id);
    if (!p) return;
    
    fields.id.value = p.id;
    fields.name.value = p.name;
    fields.price.value = p.price;
    fields.category.value = p.category || '';
    fields.image.value = p.image || '';
    fields.desc.value = p.desc || '';
    
    window.scrollTo({top: 0, behavior: 'smooth'});
  }
  
  async function deleteProduct(id) {
    let products = getJSON(LS_KEYS.PRODUCTS) || [];
    products = products.filter(p => p.id !== id);
    setJSON(LS_KEYS.PRODUCTS, products);
    
    // Also delete from API
    await apiPost('/products/delete', {id});
    
    loadTable();
    showToast('Product deleted');
  }
  
  form.addEventListener('submit', async e => {
    e.preventDefault();
    
    const name = fields.name.value.trim();
    const price = Number(fields.price.value);
    const priceOk = !Number.isNaN(price) && price >= 0;
    
    $('#eProdName').textContent = name ? '' : 'Name required.';
    $('#eProdPrice').textContent = priceOk ? '' : 'Valid price required.';
    
    if (!name || !priceOk) return;
    
    const products = getJSON(LS_KEYS.PRODUCTS) || [];
    
    if (fields.id.value) {
      // Update existing product
      const idx = products.findIndex(p => p.id === fields.id.value);
      if (idx > -1) {
        const updatedProduct = {
          ...products[idx],
          name,
          price,
          category: fields.category.value.trim(),
          image: fields.image.value.trim(),
          desc: fields.desc.value.trim()
        };
        
        products[idx] = updatedProduct;
        setJSON(LS_KEYS.PRODUCTS, products);
        
        // Update in API
        await apiPost('/products/update', updatedProduct);
      }
    } else {
      // Create new product
      const newProduct = {
        id: uid('p'),
        name,
        price,
        category: fields.category.value.trim(),
        image: fields.image.value.trim(),
        info: '',
        desc: fields.desc.value.trim()
      };
      
      products.push(newProduct);
      setJSON(LS_KEYS.PRODUCTS, products);
      
      // Create in API
      await apiPost('/products', newProduct);
    }
    
    form.reset();
    fields.id.value = '';
    loadTable();
    showToast('Product saved');
  });
  
  loadTable();
}

/******************************************************
 * Checkout / Orders *
 ******************************************************/
function cartLines() {
  const cart = getJSON(LS_KEYS.CART) || [];
  const products = getJSON(LS_KEYS.PRODUCTS) || [];
  
  return cart.map(c => {
    const p = products.find(x => x.id === c.id);
    return {
      id: c.id,
      name: c.name || p?.name || 'Item',
      price: Number(c.price ?? p?.price ?? 0),
      qty: Number(c.qty || 0),
      image: c.image || p?.image || ''
    };
  });
}

function cartTotals(lines) {
  const subtotal = lines.reduce((a, l) => a + l.price * l.qty, 0);
  const shipping = subtotal > 0 ? 79 : 0;
  const total = subtotal + shipping;
  
  return {subtotal, shipping, total};
}

function initCheckoutPage() {
  initUserIcon();
  initCartIcon();
  
  const lines = cartLines();
  const wrap = $('#checkoutSummary');
  
  if (!lines.length) {
    wrap.innerHTML = `<div class="empty-state">Your cart is empty. <br/><a class="button-primary" href="index.html" style="display:inline-block;margin-top:1rem;">Browse products</a></div>`;
  } else {
    const totals = cartTotals(lines);
    
    wrap.innerHTML = `<div class="table-wrap">
      <table>
        <thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead>
        <tbody>
          ${lines.map(l => `<tr><td>${l.name}</td><td>${l.qty}</td><td>${money(l.price)}</td><td>${money(l.price * l.qty)}</td></tr>`).join('')}
          <tr><td colspan="3" style="text-align:right;">Subtotal</td><td>${money(totals.subtotal)}</td></tr>
          <tr><td colspan="3" style="text-align:right;">Shipping</td><td>${money(totals.shipping)}</td></tr>
          <tr><th colspan="3" style="text-align:right;">Total</th><th>${money(totals.total)}</th></tr>
        </tbody>
      </table>
    </div>`;
  }
  
  $('#checkoutForm').addEventListener('submit', async e => {
    e.preventDefault();
    
    // Basic validation
    const name = $('#chkName').value.trim();
    const email = $('#chkEmail').value.trim();
    const address = $('#chkAddress').value.trim();
    const phone = $('#chkPhone').value.trim();
    const delivery = $('#chkDelivery').value;
    const card = $('#cardNumber').value.replace(/\s+/g, '');
    const exp = $('#cardExpiry').value.trim();
    const cvc = $('#cardCvc').value.trim();
    
    let ok = true;
    
    $('#eChkName').textContent = name ? '' : 'Name required.'; 
    if (!name) ok = false;
    
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    $('#eChkEmail').textContent = emailOk ? '' : 'Valid email required.'; 
    if (!emailOk) ok = false;
    
    $('#eChkAddress').textContent = address ? '' : 'Address required.'; 
    if (!address) ok = false;
    
    const cardOk = /^\d{13,19}$/.test(card);
    $('#eCardNumber').textContent = cardOk ? '' : 'Enter a valid card number.'; 
    if (!cardOk) ok = false;
    
    if (!ok) return;
    
    // "Process" order
    showSpinner(true);
    
    try {
      const lines = cartLines();
      const totals = cartTotals(lines);
      
      const order = {
        id: uid('o'),
        createdAt: Date.now(),
        status: 'Paid',
        items: lines,
        total: totals.total,
        customer: {name, email, phone, address, delivery}
      };
      
      // Save order to API
      const result = await apiPost('/orders', order);
      
      if (result) {
        // Save to localStorage as backup
        const orders = getJSON(LS_KEYS.ORDERS) || [];
        orders.push(order);
        setJSON(LS_KEYS.ORDERS, orders);
        
        // Clear cart
        setJSON(LS_KEYS.CART, []);
        setJSON(LS_KEYS.LAST_ORDER_ID, order.id);
        
        // Save/merge user
        const user = getJSON(LS_KEYS.USER) || {};
        setJSON(LS_KEYS.USER, {...user, name, email, phone});
        
        showSpinner(false);
        location.href = 'receipt.html';
      } else {
        throw new Error('Failed to save order');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      showSpinner(false);
      showToast('Error processing order. Please try again.');
    }
  });
}

/*************************************
 * Receipt page *
 ************************************/
async function renderReceiptPage() {
  const lastId = JSON.parse(localStorage.getItem(LS_KEYS.LAST_ORDER_ID) || 'null');
  let order = null;
  
  // Try to get from API first
  if (lastId) {
    order = await apiGet(`/orders/${lastId}`);
  }
  
  // Fallback to localStorage
  if (!order) {
    const orders = getJSON(LS_KEYS.ORDERS) || [];
    order = orders.find(x => x.id === lastId) || orders[orders.length - 1];
  }
  
  const mount = $('#receiptContainer');
  
  if (!order) {
    mount.innerHTML = `<div class="empty-state">No recent order found. <a class="button-primary" href="index.html" style="display:inline-block;margin-top:1rem;">Shop</a></div>`;
    return;
  }
  
  mount.innerHTML = `
    <h2>Receipt</h2>
    <p>Order <strong>${order.id}</strong> • ${new Date(order.createdAt).toLocaleString()}</p>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Items</th><th>Qty</th><th>Units</th><th>Totals</th></tr></thead>
        <tbody>
          ${order.items.map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td>${money(i.price)}</td><td>${money(i.qty * i.price)}</td></tr>`).join('')}
          <tr><th colspan="3" style="text-align:right;">Grand Total</th><th>${money(order.total)}</th></tr>
        </tbody>
      </table>
    </div>
    <p>Customer: ${order.customer.name} — ${order.customer.email}</p>
    <a href="index.html" class="button-primary" style="display:inline-block;margin-top:1rem;">Continue Shopping</a>
  `;
}

/*************************************
 * Reports page *
 ************************************/
async function initReportsPage() {
  // Optional month filter
  const run = async () => {
    const month = $('#repMonth').value; // "YYYY-MM"
    
    try {
      // Get orders from API
      const orders = await apiGet('/orders');
      
      if (!orders) {
        $('#salesTable tbody').innerHTML = `<tr><td colspan="4" class="empty-state">No sales data available.</td></tr>`;
        $('#topProductsTable tbody').innerHTML = `<tr><td colspan="3" class="empty-state">No data.</td></tr>`;
        $('#customersTable tbody').innerHTML = `<tr><td colspan="3" class="empty-state">No customers yet.</td></tr>`;
        return;
      }
      
      // Filter by month if specified
      const filteredOrders = month ? orders.filter(o => {
        const d = new Date(o.createdAt);
        const tag = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return tag === month;
      }) : orders;
      
      // Sales table by day
      const byDay = {};
      for (const o of filteredOrders) {
        const d = new Date(o.createdAt).toISOString().slice(0, 10);
        if (!byDay[d]) byDay[d] = {orders: 0, units: 0, revenue: 0};
        byDay[d].orders++;
        byDay[d].units += o.items.reduce((a, i) => a + i.qty, 0);
        byDay[d].revenue += o.total;
      }
      
      const salesRows = Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b));
      $('#salesTable tbody').innerHTML = salesRows.length ? salesRows.map(([d, v]) => `
        <tr><td>${d}</td><td>${v.orders}</td><td>${v.units}</td><td>${money(v.revenue)}</td></tr>
      `).join('') : `<tr><td colspan="4" class="empty-state">No sales for selection.</td></tr>`;
      
      // Top products
      const prodAgg = {};
      for (const o of filteredOrders) {
        for (const i of o.items) {
          if (!prodAgg[i.name]) prodAgg[i.name] = {units: 0, revenue: 0};
          prodAgg[i.name].units += i.qty;
          prodAgg[i.name].revenue += i.qty * i.price;
        }
      }
      
      const top = Object.entries(prodAgg).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 10);
      $('#topProductsTable tbody').innerHTML = top.length ? top.map(([name, v]) => `
        <tr><td>${name}</td><td>${v.units}</td><td>${money(v.revenue)}</td></tr>
      `).join('') : `<tr><td colspan="3" class="empty-state">No data.</td></tr>`;
      
      // Customers
      const cust = {};
      for (const o of filteredOrders) {
        const email = o.customer?.email || 'guest';
        if (!cust[email]) cust[email] = {orders: 0, spend: 0};
        cust[email].orders++;
        cust[email].spend += o.total;
      }
      
      const custRows = Object.entries(cust).sort((a, b) => b[1].spend - a[1].spend);
      $('#customersTable tbody').innerHTML = custRows.length ? custRows.map(([email, v]) => `
        <tr><td>${email}</td><td>${v.orders}</td><td>${money(v.spend)}</td></tr>
      `).join('') : `<tr><td colspan="3" class="empty-state">No customers yet.</td></tr>`;
      
      // Simple chart placeholder
      drawBarChart('#salesChart', salesRows.map(([d, v]) => ({label: d, value: v.revenue})), {height: 160});
      
    } catch (error) {
      console.error('Error loading reports:', error);
      $('#salesTable tbody').innerHTML = `<tr><td colspan="4" class="empty-state">Error loading data.</td></tr>`;
    }
  };
  
  $('#runReports').addEventListener('click', run);
  run();
}

function drawBarChart(selector, data, {height = 160} = {}) {
  const el = document.querySelector(selector);
  if (!el) return;
  if (!data.length) { el.innerHTML = ''; return; }
  
  const max = Math.max(...data.map(d => d.value));
  const barW = 28, gap = 8;
  const width = data.length * barW + (data.length - 1) * gap + 32;
  const h = height;
  
  const bars = data.map((d, j) => {
    const x = 16 + j * (barW + gap);
    const hBar = max ? Math.round((d.value / max) * (h - 40)) : 0;
    const y = h - 20 - hBar;
    
    return `
      <rect x="${x}" y="${y}" width="${barW}" height="${hBar}" fill="white" opacity="0.9"></rect>
      <text x="${x + barW / 2}" y="${h - 6}" font-size="10" text-anchor="middle" fill="white">${d.label.slice(5)}</text>
    `;
  }).join('');
  
  el.innerHTML = `
    <svg viewBox="0 0 ${width} ${h}" width="100%" height="${h}">
      <rect x="0" y="0" width="${width}" height="${h}" fill="transparent" />
      ${bars}
    </svg>
  `;
}