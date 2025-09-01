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
  
  // Add help prompt for first-time users
  if (cart.length === 1) {
    showToast(`Added to cart! <a href="help.html#cartHelp" style="color: #fff; text-decoration: underline;">Need help?</a>`, 4000);
  } else {
    showToast(`Added ${qty} × ${product.name}`);
  }
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
        // 🔄 Redirect to new tracking page instead of receipt
        location.href = 'tracking.html';
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

/********************
 * Mobile Navigation *
 ********************/
function initMobileMenu() {
  const nav = document.querySelector('.topnav');
  const toggle = document.createElement('button');
  toggle.className = 'menu-toggle';
  toggle.innerHTML = '☰';
  toggle.setAttribute('aria-label', 'Toggle menu');
  
  const headerInner = document.querySelector('.header-inner');
  if (headerInner && nav) {
    headerInner.appendChild(toggle);
    
    toggle.addEventListener('click', () => {
      nav.classList.toggle('show');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) {
        nav.classList.remove('show');
      }
    });
    
    // Close menu on resize if it becomes desktop view
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        nav.classList.remove('show');
      }
    });
  }
}
// Call this function in your bootstrapData() or similar initialization function

/***********************
 * Enhanced Checkout *
 ***********************/
function initEnhancedCheckout() {
  // Add card number formatting
  const cardNumberInput = $('#cardNumber');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      let formattedValue = '';
      
      for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
          formattedValue += ' ';
        }
        formattedValue += value[i];
      }
      
      e.target.value = formattedValue;
    });
  }
  
  // Add expiry date formatting
  const expiryInput = $('#cardExpiry');
  if (expiryInput) {
    expiryInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      
      if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
      
      e.target.value = value;
    });
  }
  
  // Add real-time validation
  const inputs = document.querySelectorAll('#checkoutForm .input');
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      validateField(this);
    });
  });
}

function validateField(field) {
  const errorElement = document.getElementById(`e${field.id.charAt(0).toUpperCase() + field.id.slice(1)}`);
  if (!errorElement) return;
  
  let isValid = true;
  let errorMessage = '';
  
  switch(field.id) {
    case 'chkName':
      isValid = field.value.trim().length >= 2;
      errorMessage = isValid ? '' : 'Name must be at least 2 characters';
      break;
    case 'chkEmail':
      isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
      errorMessage = isValid ? '' : 'Please enter a valid email address';
      break;
    case 'cardNumber':
      isValid = field.value.replace(/\s/g, '').length >= 13;
      errorMessage = isValid ? '' : 'Please enter a valid card number';
      break;
    case 'cardExpiry':
      isValid = /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(field.value);
      errorMessage = isValid ? '' : 'Please enter a valid expiry date (MM/YY)';
      break;
    case 'cardCvc':
      isValid = field.value.length >= 3;
      errorMessage = isValid ? '' : 'Please enter a valid CVC';
      break;
  }
  
  errorElement.textContent = errorMessage;
  field.classList.toggle('invalid', !isValid);
  
  return isValid;
}

/***********************
 * Admin Dashboard *
 ***********************/
async function initAdminDashboard() {
    await loadDashboardData();
    initDashboardCharts();
    initUserManagement();
    initOrderManagement();
    initModals();
}

async function loadDashboardData() {
    showSpinner(true);
    
    try {
        // Load stats
        const [orders, products, users] = await Promise.all([
            apiGet('/orders'),
            apiGet('/products'),
            apiGet('/users')
        ]);
        
        // Update stats
        if (orders) {
            const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
            $('#totalRevenue').textContent = money(totalRevenue);
            $('#totalOrders').textContent = orders.length;
            
            // Load recent orders
            loadRecentOrders(orders.slice(0, 5));
        }
        
        if (products) {
            $('#totalProducts').textContent = products.length;
        }
        
        if (users) {
            $('#totalUsers').textContent = users.length;
            // Load users table
            loadUsersTable(users);
        }
        
        // Initialize charts only once, not on every data load
        if (!window.chartsInitialized) {
            initDashboardCharts();
            window.chartsInitialized = true;
        }
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Error loading dashboard data');
    } finally {
        showSpinner(false);
    }
}

function loadRecentOrders(orders) {
    const tbody = $('#recentOrdersTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${order.customer?.name || 'N/A'}</td>
            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
            <td>${money(order.total)}</td>
            <td><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></td>
            <td>
                <button class="button-primary btn-sm view-order" data-id="${order.id}">View</button>
            </td>
        </tr>
    `).join('');
    
    // Add event listeners to view buttons
    tbody.querySelectorAll('.view-order').forEach(btn => {
        btn.addEventListener('click', () => viewOrder(btn.dataset.id));
    });
}

function loadUsersTable(users) {
    const tbody = $('#usersTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone || 'N/A'}</td>
            <td>${new Date(user.created_at).toLocaleDateString()}</td>
            <td>
                <button class="button-primary btn-sm edit-user" data-id="${user.id}">Edit</button>
                <button class="button-primary btn-sm btn-danger delete-user" data-id="${user.id}">Delete</button>
            </td>
        </tr>
    `).join('');
    
    // Add event listeners to user action buttons
    tbody.querySelectorAll('.edit-user').forEach(btn => {
        btn.addEventListener('click', () => editUser(btn.dataset.id));
    });
    
    tbody.querySelectorAll('.delete-user').forEach(btn => {
        btn.addEventListener('click', () => deleteUser(btn.dataset.id));
    });
}

function initDashboardCharts() {
    // Store chart instances globally so we can update them later
    window.revenueChartInstance = null;
    window.productsChartInstance = null;
    
    // This would be populated with real data from your API
    const revenueCtx = $('#revenueChart');
    const productsCtx = $('#productsChart');
    
    // Destroy existing charts if they exist
    if (window.revenueChartInstance) {
        window.revenueChartInstance.destroy();
    }
    if (window.productsChartInstance) {
        window.productsChartInstance.destroy();
    }
    
    if (revenueCtx) {
        window.revenueChartInstance = new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue (ZAR)',
                    data: [12500, 19000, 18000, 22000, 21000, 25000],
                    borderColor: '#fff',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true, // Changed from false to true
                plugins: {
                    legend: {
                        labels: {
                            color: '#fff'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#fff'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#fff'
                        }
                    }
                }
            }
        });
    }
    
    if (productsCtx) {
        window.productsChartInstance = new Chart(productsCtx, {
            type: 'doughnut',
            data: {
                labels: ['Knives', 'Tools', 'Home Goods', 'Outdoor'],
                datasets: [{
                    data: [45, 25, 20, 10],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true, // Changed from false to true
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#fff'
                        }
                    }
                }
            }
        });
    }
}

function initUserManagement() {
    $('#addUserBtn')?.addEventListener('click', () => {
        $('#userForm').reset();
        $('#userId').value = '';
        $('#userModal').style.display = 'block';
    });
}

function initOrderManagement() {
    // Handled by the view order buttons
}

async function viewOrder(orderId) {
    showSpinner(true);
    
    try {
        const order = await apiGet(`/orders/${orderId}`);
        if (!order) {
            showToast('Order not found');
            return;
        }
        
        // Populate order modal
        $('#orderIdTitle').textContent = order.id;
        $('#orderCustomerInfo').innerHTML = `
            <p><strong>Name:</strong> ${order.customer?.name || 'N/A'}</p>
            <p><strong>Email:</strong> ${order.customer?.email || 'N/A'}</p>
            <p><strong>Phone:</strong> ${order.customer?.phone || 'N/A'}</p>
            <p><strong>Address:</strong> ${order.customer?.address || 'N/A'}</p>
            <p><strong>Delivery:</strong> ${order.customer?.delivery || 'Standard'}</p>
        `;
        
        // Populate order items
        const itemsTbody = $('#orderItemsTable tbody');
        itemsTbody.innerHTML = order.items.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${money(item.price)}</td>
                <td>${item.qty}</td>
                <td>${money(item.price * item.qty)}</td>
            </tr>
        `).join('');
        
        // Populate order summary
        $('#orderSummary').innerHTML = `
            <p><strong>Subtotal:</strong> ${money(order.total - 79)}</p>
            <p><strong>Shipping:</strong> ${money(79)}</p>
            <p><strong>Total:</strong> ${money(order.total)}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
        `;
        
        // Set current status
        $('#orderStatusSelect').value = order.status;
        
        // Set up update button
        $('#updateStatusBtn').onclick = () => updateOrderStatus(orderId);
        
        // Show modal
        $('#orderModal').style.display = 'block';
        
    } catch (error) {
        console.error('Error loading order:', error);
        showToast('Error loading order details');
    } finally {
        showSpinner(false);
    }
}

async function updateOrderStatus(orderId) {
    const newStatus = $('#orderStatusSelect').value;
    
    try {
        const result = await apiPost('/orders/update-status', {
            id: orderId,
            status: newStatus
        });
        
        if (result) {
            showToast('Order status updated successfully');
            $('#orderModal').style.display = 'none';
            loadDashboardData(); // Refresh data
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        showToast('Error updating order status');
    }
}

function initModals() {
    // Close modals when clicking on X
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        document.querySelectorAll('.modal').forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Cancel button in user modal
    $('#cancelUserBtn')?.addEventListener('click', () => {
        $('#userModal').style.display = 'none';
    });
    
    // User form submission
    $('#userForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveUser();
    });
}

async function saveUser() {
    const userData = {
        id: $('#userId').value,
        name: $('#userName').value,
        email: $('#userEmail').value,
        phone: $('#userPhone').value,
        password: $('#userPassword').value
    };
    
    try {
        const endpoint = userData.id ? '/users/update' : '/users';
        const result = await apiPost(endpoint, userData);
        
        if (result) {
            showToast(`User ${userData.id ? 'updated' : 'created'} successfully`);
            $('#userModal').style.display = 'none';
            loadDashboardData(); // Refresh data
        }
    } catch (error) {
        console.error('Error saving user:', error);
        showToast('Error saving user');
    }
}

async function editUser(userId) {
    try {
        const user = await apiGet(`/users/${userId}`);
        if (!user) {
            showToast('User not found');
            return;
        }
        
        // Populate form
        $('#userId').value = user.id;
        $('#userName').value = user.name;
        $('#userEmail').value = user.email;
        $('#userPhone').value = user.phone || '';
        $('#userPassword').value = '';
        
        // Show modal
        $('#userModal').style.display = 'block';
        
    } catch (error) {
        console.error('Error loading user:', error);
        showToast('Error loading user details');
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }
    
    try {
        const result = await apiPost('/users/delete', { id: userId });
        
        if (result) {
            showToast('User deleted successfully');
            loadDashboardData(); // Refresh data
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showToast('Error deleting user');
    }
}

function updateNavigationBasedOnRole() {
  const user = JSON.parse(localStorage.getItem("fw_user") || "{}");
  const userRole = user.role || 'customer';
  
  // Hide admin links from non-admin users
  if (userRole !== 'admin') {
    document.querySelectorAll('[data-role="admin"]').forEach(el => {
      el.style.display = 'none';
    });
  }
  
  // Hide supplier links from non-supplier users
  if (userRole !== 'supplier' && userRole !== 'admin') {
    document.querySelectorAll('[data-role="supplier"]').forEach(el => {
      el.style.display = 'none';
    });
  }
  
  // Show appropriate links based on role
  if (userRole === 'admin') {
    document.querySelectorAll('[data-role="admin"]').forEach(el => {
      el.style.display = 'block';
    });
  }
  
  if (userRole === 'supplier' || userRole === 'admin') {
    document.querySelectorAll('[data-role="supplier"]').forEach(el => {
      el.style.display = 'block';
    });
  }
}

// Call this function after page load on all pages
document.addEventListener("DOMContentLoaded", function() {
  updateNavigationBasedOnRole();
});

/********************
 * Authentication *
 ********************/
/********************
 * Authentication Helpers *
 ********************/
function getUserRole() {
  const user = checkAuth(); // Use your existing checkAuth function
  return user ? user.role : 'customer';
}

function requireAuth(requiredRole = null) {
  const user = checkAuth();
  
  if (!user) {
    // Not logged in
    showToast("Please log in to access this page");
    window.location.href = "login.html";
    return false;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    // Doesn't have required role
    showToast("You don't have permission to access this page");
    window.location.href = "index.html";
    return false;
  }
  
  return true;
}

function logout() {
  localStorage.removeItem(LS_KEYS.USER);
  localStorage.removeItem(LS_KEYS.CART); // Optional: clear cart on logout
  document.body.classList.remove('user-logged-in');
  showToast("Logged out successfully");
  window.location.href = "index.html";
}

// Update initUserIcon to show logout option (if not already implemented)
function initUserIcon() {
  const el = document.getElementById('userIcon');
  if (!el) return;
  
  const user = checkAuth();
  
  if (user) {
    el.innerHTML = `
      <div class="user-menu">
        <button class="user-button" aria-label="Account">${user.name.charAt(0).toUpperCase()}</button>
        <div class="user-dropdown">
          <div class="user-info">
            <strong>${user.name}</strong>
            <div>${user.email}</div>
            <div class="user-role">Role: ${user.role}</div>
          </div>
          <a href="account.html">My Account</a>
          <a href="orders.html">My Orders</a>
          <button onclick="logout()">Logout</button>
        </div>
      </div>
    `;
  } else {
    el.innerHTML = `<a href="login.html" aria-label="Login">Login</a>`;
  }
}

// Update your bootstrapData function to check auth
async function bootstrapData() {
    checkAuth(); // Check authentication status
    
    // ... rest of your bootstrap code
}

// Add user menu styles to your CSS
const userMenuStyles = `
.user-menu {
    position: relative;
    display: inline-block;
}

.user-button {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--accent);
    color: #000;
    border: none;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.user-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
    min-width: 200px;
    display: none;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.user-menu:hover .user-dropdown {
    display: block;
}

.user-info {
    padding-bottom: 1rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid var(--border);
}

.user-dropdown a, .user-dropdown button {
    display: block;
    width: 100%;
    padding: 0.5rem 0;
    background: none;
    border: none;
    color: var(--text);
    text-align: left;
    cursor: pointer;
    text-decoration: none;
}

.user-dropdown a:hover, .user-dropdown button:hover {
    color: var(--accent);
}
`;

// Add the styles to the document
const styleSheet = document.createElement('style');
styleSheet.textContent = userMenuStyles;
document.head.appendChild(styleSheet);

/********************
 * Role-Based Navigation *
 ********************/
function updateNavigationBasedOnRole() {
    const user = getJSON(LS_KEYS.USER);
    if (!user) return;
    
    // Hide/show elements based on role
    const adminElements = document.querySelectorAll('[data-role="admin"]');
    const supplierElements = document.querySelectorAll('[data-role="supplier"]');
    const customerElements = document.querySelectorAll('[data-role="customer"]');
    
    // Hide all role-specific elements first
    document.querySelectorAll('[data-role]').forEach(el => {
        el.style.display = 'none';
    });
    
    // Show elements based on current user role
    if (user.role === 'admin') {
        adminElements.forEach(el => el.style.display = 'block');
        /* Redirect to admin dashboard if on certain pages
        if (window.location.pathname.endsWith('index.html') || 
            window.location.pathname.endsWith('product.html')) {
            window.location.href = 'admin-dashboard.html';
        }*/
    } 
    else if (user.role === 'supplier') {
        supplierElements.forEach(el => el.style.display = 'block');
    } 
    else {
        customerElements.forEach(el => el.style.display = 'block');
    }
    
    // Update user menu with role
    const userMenu = document.querySelector('.user-dropdown');
    if (userMenu) {
        const roleInfo = document.createElement('div');
        roleInfo.className = 'user-role';
        roleInfo.textContent = `Role: ${user.role}`;
        roleInfo.style.fontSize = '0.8rem';
        roleInfo.style.color = 'var(--muted)';
        roleInfo.style.marginTop = '0.5rem';
        userMenu.querySelector('.user-info').appendChild(roleInfo);
    }
}

// Update the initUserIcon function
function initUserIcon() {
    const el = document.getElementById('userIcon');
    if (!el) return;
    
    const user = getJSON(LS_KEYS.USER);
    
    if (user) {
        el.innerHTML = `
            <div class="user-menu">
                <button class="user-button" aria-label="Account">${user.name.charAt(0).toUpperCase()}</button>
                <div class="user-dropdown">
                    <div class="user-info">
                        <strong>${user.name}</strong>
                        <div>${user.email}</div>
                    </div>
                    ${user.role === 'admin' ? 
                        '<a href="admin.html">Admin Dashboard</a>' : 
                        '<a href="account.html">My Account</a>'
                    }
                    <a href="orders.html">My Orders</a>
                    <button onclick="logout()">Logout</button>
                </div>
            </div>
        `;
        
        // Update navigation based on role
        updateNavigationBasedOnRole();
    } else {
        el.innerHTML = `<a href="login.html" aria-label="Login">Login</a>`;
    }
}

// Update bootstrapData to handle role-based navigation
async function bootstrapData() {
    checkAuth(); // Check authentication status
    
    const user = getJSON(LS_KEYS.USER);
    if (user) {
        updateNavigationBasedOnRole();
    }
    
    // ... rest of your bootstrap code
}

/********************
 * Role-Based Redirects *
 ********************/
function checkRoleAccess() {
    const user = getJSON(LS_KEYS.USER);
    const currentPage = window.location.pathname.split('/').pop();
    
    // Pages that require specific roles
    const adminPages = ['admin.html', 'admin-dashboard.html', 'suppliers.html', 'reports.html'];
    const supplierPages = ['suppliers.html'];
    
    // Redirect to appropriate page based on role
    if (user) {
        if (adminPages.includes(currentPage) && user.role !== 'admin') {
            window.location.href = 'index.html';
            return false;
        }
        
        if (supplierPages.includes(currentPage) && user.role !== 'supplier' && user.role !== 'admin') {
            window.location.href = 'index.html';
            return false;
        }
        
        // Redirect admin to dashboard on main pages
        if (user.role === 'admin' && 
            (currentPage === 'index.html' || currentPage === 'product.html')) {
            window.location.href = 'admin-dashboard.html';
            return false;
        }
    }
    
    return true;
}

// Update bootstrapData to check role access
async function bootstrapData() {
    checkAuth(); // Check authentication status
    
    const user = getJSON(LS_KEYS.USER);
    if (user) {
        updateNavigationBasedOnRole();
        checkRoleAccess();
    }
    
    // ... rest of your bootstrap code
}


/***********************
* Reports Page - Simplified Working Version *
***********************/

// Global variables for reports
let currentPage = 1;
const ordersPerPage = 10;
let allOrders = [];
let filteredOrders = [];
let chartInstances = {};

async function initReportsPage() {
  console.log("Initializing reports page...");
  
  // Set up event listeners
  document.getElementById('dateRange').addEventListener('change', toggleCustomDateRange);
  document.getElementById('applyFilters').addEventListener('click', applyFilters);
  document.getElementById('exportPdfBtn').addEventListener('click', exportToPdf);
  document.getElementById('exportCsvBtn').addEventListener('click', exportToCsv);
  document.getElementById('prevPage').addEventListener('click', () => changePage(-1));
  document.getElementById('nextPage').addEventListener('click', () => changePage(1));
  
  // Load initial data
  await loadReportsData();
  applyFilters();
}

function toggleCustomDateRange() {
  const dateRange = document.getElementById('dateRange').value;
  document.getElementById('customDateRange').style.display = 
    dateRange === 'custom' ? 'block' : 'none';
}

async function loadReportsData() {
  showSpinner(true);
  
  try {
    // For demo purposes - create sample data if API fails
    allOrders = await generateSampleOrdersData();
    
    // Try to get real data from API
    try {
      const ordersResponse = await fetch('/api/orders');
      if (ordersResponse.ok) {
        const apiOrders = await ordersResponse.json();
        if (apiOrders && apiOrders.length > 0) {
          allOrders = apiOrders;
        }
      }
    } catch (apiError) {
      console.log('Using sample data due to API error:', apiError);
    }
    
  } catch (error) {
    console.error('Error loading reports data:', error);
    showToast('Error loading reports data');
  } finally {
    showSpinner(false);
  }
}

function applyFilters() {
  const statusFilter = document.getElementById('statusFilter').value;
  
  // Simple filtering for demo
  filteredOrders = statusFilter 
    ? allOrders.filter(order => order.status === statusFilter)
    : [...allOrders];
  
  currentPage = 1;
  
  updateStats();
  updateCharts();
  renderOrdersTable();
}

function updateStats() {
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalOrders = filteredOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  document.getElementById('totalRevenue').textContent = `R ${totalRevenue.toFixed(2)}`;
  document.getElementById('totalOrders').textContent = totalOrders;
  document.getElementById('avgOrderValue').textContent = `R ${avgOrderValue.toFixed(2)}`;
  document.getElementById('conversionRate').textContent = totalOrders > 0 ? '4.2%' : '0%';
}

function updateCharts() {
  // Destroy existing charts if they exist
  Object.values(chartInstances).forEach(chart => {
    if (chart) chart.destroy();
  });
  
  // Create sample charts
  const revenueCtx = document.getElementById('revenueChart');
  if (revenueCtx) {
    chartInstances.revenueChart = new Chart(revenueCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Revenue (ZAR)',
          data: [12500, 19000, 18000, 22000, 21000, 25000],
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          tension: 0.4,
          fill: true
        }]
      }
    });
  }
}

function renderOrdersTable() {
  const tbody = document.getElementById('ordersTableBody');
  
  if (filteredOrders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="no-data">No orders match the selected filters</td></tr>';
    document.getElementById('pagination').style.display = 'none';
    return;
  }
  
  // Simple rendering without pagination for demo
  let tableHTML = '';
  filteredOrders.forEach(order => {
    const orderDate = new Date(order.created_at || Date.now());
    const statusClass = `status-${order.status ? order.status.toLowerCase() : 'pending'}`;
    
    tableHTML += `
      <tr>
        <td>${order.id || 'ORD-' + Math.random().toString(36).substr(2, 8).toUpperCase()}</td>
        <td>${orderDate.toLocaleDateString()}</td>
        <td>${order.customer_name || 'Guest Customer'}</td>
        <td>${order.items ? order.items.length : 1} items</td>
        <td>R ${order.total ? order.total.toFixed(2) : '0.00'}</td>
        <td><span class="status-badge ${statusClass}">${order.status || 'Pending'}</span></td>
      </tr>
    `;
  });
  
  tbody.innerHTML = tableHTML;
  document.getElementById('pagination').style.display = 'none'; // Hide pagination for demo
}

function changePage(direction) {
  // Simplified for demo
  console.log('Change page:', direction);
}

function exportToPdf() {
  // Create a print-friendly version of the report
  const printContent = document.createElement('div');
  printContent.innerHTML = `
    <h1>ForgeWorks Sales Report</h1>
    <p>Generated: ${new Date().toLocaleDateString()}</p>
    
    <h2>Summary Statistics</h2>
    <p>Total Revenue: R ${filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0).toFixed(2)}</p>
    <p>Total Orders: ${filteredOrders.length}</p>
    <p>Average Order Value: R ${(filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0) / (filteredOrders.length || 1)).toFixed(2)}</p>
    
    <h2>Order Details</h2>
    <table border="1" style="width:100%; border-collapse:collapse;">
      <tr>
        <th>Order ID</th>
        <th>Date</th>
        <th>Customer</th>
        <th>Items</th>
        <th>Amount</th>
        <th>Status</th>
      </tr>
      ${filteredOrders.map(order => `
        <tr>
          <td>${order.id || 'N/A'}</td>
          <td>${new Date(order.created_at || order.createdAt).toLocaleDateString()}</td>
          <td>${order.customer_name || 'Guest'}</td>
          <td>${order.items ? order.items.length : 0}</td>
          <td>R ${order.total ? order.total.toFixed(2) : '0.00'}</td>
          <td>${order.status || 'Pending'}</td>
        </tr>
      `).join('')}
    </table>
  `;
  
  // Open print dialog
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>ForgeWorks Sales Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();
  
  // Wait for content to load then print
  printWindow.onload = function() {
    printWindow.print();
    // printWindow.close(); // Uncomment to auto-close after printing
  };
  
  showToast('Opening print dialog...');
}

function exportToCsv() {
  console.log("Exporting to CSV...");
  
  let csvContent = 'Order ID,Date,Customer,Items,Amount,Status\n';
  
  filteredOrders.forEach(order => {
    const orderDate = new Date(order.created_at || Date.now());
    csvContent += `"${order.id || ''}","${orderDate.toLocaleDateString()}","${order.customer_name || 'Guest'}","${order.items ? order.items.length : 1}","R ${order.total ? order.total.toFixed(2) : '0.00'}","${order.status || 'Pending'}"\n`;
  });
  
  const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `forgeworks-report-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showToast('CSV exported successfully!');
}

// Generate sample data for demo purposes
function generateSampleOrdersData() {
  return new Promise((resolve) => {
    const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    const sampleOrders = [];
    
    for (let i = 0; i < 25; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const total = Math.random() * 1000 + 50;
      const itemsCount = Math.floor(Math.random() * 5) + 1;
      
      sampleOrders.push({
        id: 'ORD-' + (1000 + i),
        customer_name: ['John Smith', 'Sarah Johnson', 'Mike Wilson', 'Emily Davis'][i % 4],
        customer_email: ['john@example.com', 'sarah@example.com', 'mike@example.com', 'emily@example.com'][i % 4],
        total: parseFloat(total.toFixed(2)),
        status: status,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        items: Array(itemsCount).fill(0).map(() => ({ 
          name: ['Chef Knife', 'Fire Poker', 'Axe', 'Bottle Opener'][Math.floor(Math.random() * 4)],
          quantity: Math.floor(Math.random() * 3) + 1,
          price: parseFloat((total / itemsCount).toFixed(2))
        }))
      });
    }
    
    resolve(sampleOrders);
  });
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