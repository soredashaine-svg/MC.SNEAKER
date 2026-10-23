// =========================================================
// mc.sneaker: sneakers ordering system
// Data used by the app:
//   PRODUCTS and SHIPPING_FEES  (from products.js)
//   cart   = [{ productId, size, qty }]       saved in localStorage
//   orders = [{ number, date, items, ... }]   saved in localStorage
// =========================================================

const CART_KEY = "mcsneaker-cart";
const ORDERS_KEY = "mcsneaker-orders";

// ---------- 1. Saving and loading ----------
function load(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch (e) { return []; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
}

let cart = load(CART_KEY);
let orders = load(ORDERS_KEY);

// ---------- 2. Helper functions ----------
function peso(amount) {
  return "₱" + amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function findProduct(id) {
  return PRODUCTS.find(function (p) { return p.id === id; });
}

// How many of a product are already in the cart (all sizes)
function qtyInCart(productId) {
  return cart.filter(function (i) { return i.productId === productId; })
             .reduce(function (sum, i) { return sum + i.qty; }, 0);
}

function cartSubtotal() {
  return cart.reduce(function (sum, item) {
    return sum + findProduct(item.productId).price * item.qty;
  }, 0);
}

// Draws a simple sneaker picture (SVG) using the product's colors
function sneakerSVG(colors) {
  const upper = colors[0], sole = colors[1], accent = colors[2];
  return '<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path d="M20 78 C20 52 40 40 62 40 L88 40 C100 40 104 52 116 58 L168 72 C182 76 186 84 186 92 L20 92 Z" fill="' + upper + '" stroke="#00000033" stroke-width="2"/>' +
    '<path d="M60 52 C80 56 98 66 120 74" stroke="' + accent + '" stroke-width="7" fill="none" stroke-linecap="round"/>' +
    '<path d="M72 44 L78 58 M84 44 L90 58 M96 46 L101 60" stroke="#00000055" stroke-width="3" stroke-linecap="round"/>' +
    '<rect x="14" y="90" width="176" height="14" rx="7" fill="' + sole + '" stroke="#00000033" stroke-width="2"/>' +
    '</svg>';
}

// ---------- 3. Pages (Shop / My Orders) ----------
const pages = { shop: document.getElementById("shopPage"), orders: document.getElementById("ordersPage") };

function showPage(name) {
  Object.keys(pages).forEach(function (key) { pages[key].hidden = key !== name; });
  document.querySelectorAll(".nav-link").forEach(function (link) {
    link.classList.toggle("active", link.dataset.page === name);
  });
  if (name === "orders") renderOrders();
  window.scrollTo(0, 0);
}

document.querySelectorAll("[data-page]").forEach(function (el) {
  el.addEventListener("click", function (e) {
    e.preventDefault();
    showPage(el.dataset.page);
  });
});

// ---------- 4. Pop-ups (open / close) ----------
function openOverlay(el) { el.hidden = false; document.body.classList.add("no-scroll"); }
function closeOverlay(el) { el.hidden = true; document.body.classList.remove("no-scroll"); }

document.querySelectorAll(".overlay").forEach(function (overlay) {
  overlay.addEventListener("click", function (e) {
    // Close when clicking the dark background or an × button
    if (e.target === overlay || e.target.hasAttribute("data-close")) closeOverlay(overlay);
  });
});
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") document.querySelectorAll(".overlay").forEach(closeOverlay);
});

// ---------- 5. Shop: product list, search, filter, sort ----------
const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const brandFilter = document.getElementById("brandFilter");
const sortSelect = document.getElementById("sortSelect");

// Fill the brand dropdown from the product list
[...new Set(PRODUCTS.map(function (p) { return p.brand; }))].forEach(function (brand) {
  const option = document.createElement("option");
  option.value = brand;
  option.textContent = brand;
  brandFilter.appendChild(option);
});

function renderProducts() {
  const search = searchInput.value.trim().toLowerCase();
  const brand = brandFilter.value;

  let list = PRODUCTS.filter(function (p) {
    const matchesBrand = brand === "all" || p.brand === brand;
    const matchesSearch = p.name.toLowerCase().includes(search) || p.brand.toLowerCase().includes(search);
    return matchesBrand && matchesSearch;
  });

  if (sortSelect.value === "price-asc") list.sort(function (a, b) { return a.price - b.price; });
  if (sortSelect.value === "price-desc") list.sort(function (a, b) { return b.price - a.price; });
  if (sortSelect.value === "name") list.sort(function (a, b) { return a.name.localeCompare(b.name); });

  productGrid.innerHTML = "";
  list.forEach(function (p) {
    const left = p.stock - qtyInCart(p.id);
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML =
      '<div class="product-image">' + sneakerSVG(p.colors) + '</div>' +
      '<div class="product-info">' +
        '<p class="brand"></p><h3></h3>' +
        '<p class="price">' + peso(p.price) + '</p>' +
        '<p class="stock ' + (left <= 0 ? "out" : left <= 5 ? "low" : "") + '">' +
          (left <= 0 ? "Out of stock" : left <= 5 ? "Only " + left + " left" : "In stock") + '</p>' +
      '</div>';
    card.querySelector(".brand").textContent = p.brand;
    card.querySelector("h3").textContent = p.name;

    const button = document.createElement("button");
    button.className = "primary full";
    button.textContent = left <= 0 ? "Sold out" : "View Details";
    button.disabled = left <= 0;
    button.addEventListener("click", function () { openProduct(p.id); });
    card.querySelector(".product-info").appendChild(button);

    productGrid.appendChild(card);
  });

  document.getElementById("noProducts").hidden = list.length > 0;
}

searchInput.addEventListener("input", renderProducts);
brandFilter.addEventListener("change", renderProducts);
sortSelect.addEventListener("change", renderProducts);

// ---------- 6. Product details pop-up ----------
const productModal = document.getElementById("productModal");
const sizeOptions = document.getElementById("sizeOptions");
const qtyValue = document.getElementById("qtyValue");
const modalError = document.getElementById("modalError");

let selected = { productId: null, size: null, qty: 1 };

function openProduct(id) {
  const p = findProduct(id);
  selected = { productId: id, size: null, qty: 1 };

  document.getElementById("modalImage").innerHTML = sneakerSVG(p.colors);
  document.getElementById("modalBrand").textContent = p.brand;
  document.getElementById("modalName").textContent = p.name;
  document.getElementById("modalPrice").textContent = peso(p.price);
  document.getElementById("modalDescription").textContent = p.description;
  qtyValue.textContent = "1";
  modalError.textContent = "";

  sizeOptions.innerHTML = "";
  p.sizes.forEach(function (size) {
    const b = document.createElement("button");
    b.className = "size";
    b.textContent = size;
    b.addEventListener("click", function () {
      selected.size = size;
      sizeOptions.querySelectorAll(".size").forEach(function (x) { x.classList.remove("active"); });
      b.classList.add("active");
      modalError.textContent = "";
    });
    sizeOptions.appendChild(b);
  });

  openOverlay(productModal);
}

document.getElementById("qtyMinus").addEventListener("click", function () {
  if (selected.qty > 1) selected.qty--;
  qtyValue.textContent = selected.qty;
});
document.getElementById("qtyPlus").addEventListener("click", function () {
  const p = findProduct(selected.productId);
  if (selected.qty < p.stock - qtyInCart(p.id)) selected.qty++;
  qtyValue.textContent = selected.qty;
});

document.getElementById("addToCart").addEventListener("click", function () {
  const p = findProduct(selected.productId);
  if (selected.size === null) {
    modalError.textContent = "Please choose a size.";
    return;
  }
  if (selected.qty > p.stock - qtyInCart(p.id)) {
    modalError.textContent = "Not enough stock left.";
    return;
  }

  // If the same sneaker and size is already in the cart, just add to its quantity
  const existing = cart.find(function (i) { return i.productId === p.id && i.size === selected.size; });
  if (existing) existing.qty += selected.qty;
  else cart.push({ productId: p.id, size: selected.size, qty: selected.qty });

  save(CART_KEY, cart);
  closeOverlay(productModal);
  updateCart();
  openOverlay(cartPanel);
});

// ---------- 7. Cart ----------
const cartPanel = document.getElementById("cartPanel");
const cartItems = document.getElementById("cartItems");

function updateCart() {
  const count = cart.reduce(function (sum, i) { return sum + i.qty; }, 0);
  document.getElementById("cartCount").textContent = count;
  document.getElementById("emptyCart").hidden = cart.length > 0;
  document.getElementById("goCheckout").disabled = cart.length === 0;
  document.getElementById("cartSubtotal").textContent = peso(cartSubtotal());

  cartItems.innerHTML = "";
  cart.forEach(function (item, index) {
    const p = findProduct(item.productId);
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML =
      '<div class="thumb">' + sneakerSVG(p.colors) + '</div>' +
      '<div class="cart-info"><strong></strong>' +
        '<span class="muted">Size ' + item.size + ' · ' + peso(p.price) + '</span>' +
        '<div class="qty small">' +
          '<button data-action="minus" aria-label="Decrease">−</button>' +
          '<span>' + item.qty + '</span>' +
          '<button data-action="plus" aria-label="Increase">+</button>' +
        '</div>' +
      '</div>' +
      '<button class="remove" data-action="remove" aria-label="Remove">&times;</button>';
    row.querySelector("strong").textContent = p.name;

    row.querySelector('[data-action="minus"]').addEventListener("click", function () { changeQty(index, -1); });
    row.querySelector('[data-action="plus"]').addEventListener("click", function () { changeQty(index, 1); });
    row.querySelector('[data-action="remove"]').addEventListener("click", function () { removeItem(index); });
    cartItems.appendChild(row);
  });

  renderProducts();   // stock labels depend on what is in the cart
}

function changeQty(index, change) {
  const item = cart[index];
  const p = findProduct(item.productId);
  if (change > 0 && qtyInCart(p.id) >= p.stock) return;   // cannot go over the stock
  item.qty += change;
  if (item.qty <= 0) cart.splice(index, 1);
  save(CART_KEY, cart);
  updateCart();
}

function removeItem(index) {
  cart.splice(index, 1);
  save(CART_KEY, cart);
  updateCart();
}

document.getElementById("openCart").addEventListener("click", function () {
  updateCart();
  openOverlay(cartPanel);
});

// ---------- 8. Checkout ----------
const checkoutModal = document.getElementById("checkoutModal");
const checkoutForm = document.getElementById("checkoutForm");
const checkoutError = document.getElementById("checkoutError");
const citySelect = checkoutForm.elements.city;

Object.keys(SHIPPING_FEES).forEach(function (city) {
  const option = document.createElement("option");
  option.value = city;
  option.textContent = city + " (" + peso(SHIPPING_FEES[city]) + " shipping)";
  citySelect.appendChild(option);
});

function updateSummary() {
  const subtotal = cartSubtotal();
  const shipping = SHIPPING_FEES[citySelect.value] || 0;
  document.getElementById("sumSubtotal").textContent = peso(subtotal);
  document.getElementById("sumShipping").textContent = citySelect.value ? peso(shipping) : "Select a city";
  document.getElementById("sumTotal").textContent = peso(subtotal + shipping);
}
citySelect.addEventListener("change", updateSummary);

document.getElementById("goCheckout").addEventListener("click", function () {
  if (cart.length === 0) return;
  closeOverlay(cartPanel);
  checkoutError.textContent = "";
  updateSummary();
  openOverlay(checkoutModal);
});

// Checks the form and returns an error message, or "" if everything is OK
function validateCheckout(data) {
  if (data.name.length < 2) return "Please enter your full name.";
  if (!/^09\d{9}$/.test(data.phone)) return "Contact number must be 11 digits and start with 09.";
  if (data.address.length < 5) return "Please enter your complete address.";
  if (!data.city) return "Please select your city.";
  return "";
}

checkoutForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const f = checkoutForm.elements;
  const data = {
    name: f.name.value.trim(),
    phone: f.phone.value.replace(/\s|-/g, ""),
    address: f.address.value.trim(),
    city: f.city.value,
    payment: f.payment.value,
    notes: f.notes.value.trim()
  };

  const error = validateCheckout(data);
  if (error) {
    checkoutError.textContent = error;
    return;
  }

  // Create the order
  const subtotal = cartSubtotal();
  const shipping = SHIPPING_FEES[data.city];
  const order = {
    number: "MC-" + Date.now().toString().slice(-6),
    date: new Date().toISOString(),
    customer: data,
    items: cart.map(function (i) {
      const p = findProduct(i.productId);
      return { name: p.name, size: i.size, qty: i.qty, price: p.price };
    }),
    subtotal: subtotal,
    shipping: shipping,
    total: subtotal + shipping,
    status: "Pending"
  };

  // Reduce the stock of each product that was ordered
  cart.forEach(function (i) { findProduct(i.productId).stock -= i.qty; });

  orders.unshift(order);
  save(ORDERS_KEY, orders);
  cart = [];
  save(CART_KEY, cart);
  checkoutForm.reset();
  updateCart();

  closeOverlay(checkoutModal);
  document.getElementById("successNumber").textContent = order.number;
  openOverlay(document.getElementById("successModal"));
});

document.getElementById("viewOrders").addEventListener("click", function () {
  closeOverlay(document.getElementById("successModal"));
  showPage("orders");
});

// ---------- 9. My Orders ----------
function renderOrders() {
  const orderList = document.getElementById("orderList");
  orderList.innerHTML = "";
  document.getElementById("noOrders").hidden = orders.length > 0;

  orders.forEach(function (order) {
    const card = document.createElement("article");
    card.className = "order-card";
    const date = new Date(order.date).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" });

    card.innerHTML =
      '<div class="order-head"><div><strong>' + order.number + '</strong>' +
      '<span class="muted"> · ' + date + '</span></div>' +
      '<span class="status ' + order.status.toLowerCase() + '">' + order.status + '</span></div>' +
      '<ul class="order-items"></ul>' +
      '<div class="row"><span class="muted">Payment: ' + order.customer.payment + '</span>' +
      '<strong>Total ' + peso(order.total) + '</strong></div>';

    const ul = card.querySelector(".order-items");
    order.items.forEach(function (item) {
      const li = document.createElement("li");
      li.textContent = item.qty + " × " + item.name + " (Size " + item.size + ") · " + peso(item.price * item.qty);
      ul.appendChild(li);
    });

    // Only pending orders can be cancelled
    if (order.status === "Pending") {
      const cancel = document.createElement("button");
      cancel.className = "link";
      cancel.textContent = "Cancel order";
      cancel.addEventListener("click", function () {
        if (!confirm("Cancel order " + order.number + "?")) return;
        order.status = "Cancelled";
        // Put the cancelled sneakers back in stock
        order.items.forEach(function (item) {
          const p = PRODUCTS.find(function (x) { return x.name === item.name; });
          if (p) p.stock += item.qty;
        });
        save(ORDERS_KEY, orders);
        renderOrders();
        renderProducts();
      });
      card.appendChild(cancel);
    }

    orderList.appendChild(card);
  });
}

// ---------- 10. Start ----------
// Lower the stock by the amounts already ordered (so it stays correct after a refresh)
orders.forEach(function (order) {
  if (order.status === "Cancelled") return;
  order.items.forEach(function (item) {
    const p = PRODUCTS.find(function (x) { return x.name === item.name; });
    if (p) p.stock = Math.max(0, p.stock - item.qty);
  });
});

updateCart();
renderProducts();