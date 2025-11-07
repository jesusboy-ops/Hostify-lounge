const API_BASE = "https://hostify-app-nnod.vercel.app/api";

// ====== AUTH HELPERS ======
function getAuthToken() {
  return localStorage.getItem("authToken");
}

function getCurrentUser() {
  const userData = localStorage.getItem("userData");
  return userData ? JSON.parse(userData) : null;
}

function requireAuth() {
  const token = getAuthToken();
  if (!token) {
    alert("Please login to place an order!");
    window.location.href = "../auth.html";
    return false;
  }
  return true;
}

// ====== API SERVICE ======
const ApiService = {
  async get(endpoint) {
    const token = getAuthToken();
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE}${endpoint}`, { headers });

    if (response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      window.location.href = "/auth.html";
      throw new Error("Authentication required");
    }
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  },

  async post(endpoint, data) {
    const token = getAuthToken();
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      window.location.href = "../auth.html";
      throw new Error("Authentication required");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return response.json();
  }
};

// ====== MENU MANAGEMENT ======
let menuItems = [];
let cart = [];
let currentFilter = "all";

function getFallbackMenuItems() {
  return [
    {_id:"1", name:"Zobo Drink", description:"With lemon and mint", price:5000, category:"drinks", image:"/images/bb37bfa2-9c82-4ade-b4e2-72e9bf50be9b.jpeg"},
    {_id:"2", name:"Chapman", description:"Sweet and refreshing", price:5000, category:"drinks", image:"/images/undefined.jpeg"},
    {_id:"3", name:"Jollof Rice", description:"With chicken or fish", price:5000, category:"food", image:"/images/b0ea2267-f951-4a8c-a9bf-0d2b6e652ce9.jpeg"},
    {_id:"4", name:"Fried Rice", description:"Mixed vegetables and chicken", price:5500, category:"food", image:"/images/a6b97136-9822-492e-bc6e-af0f2f961912.jpeg"}
  ];
}

async function loadMenuItems() {
  try {
    console.log("Loading menu items from backend...");
    const menuData = await ApiService.get('/order'); // <-- Updated endpoint
    console.log("Menu data received:", menuData);

    if (Array.isArray(menuData)) menuItems = menuData;
    else if (menuData.data && Array.isArray(menuData.data)) menuItems = menuData.data;
    else menuItems = getFallbackMenuItems();

    console.log("Loaded menu items:", menuItems.length);
    displayMenu();
  } catch (error) {
    console.error("Failed to load menu items:", error);
    menuItems = getFallbackMenuItems();
    displayMenu();
    showMessage("Using offline menu. Some features may be limited.", "warning");
  }
}

// ====== UI ======
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
if (menuToggle && navLinks) menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("active");
  menuToggle.textContent = navLinks.classList.contains("active") ? "✕" : "☰";
});

const themeToggle = document.getElementById("themeToggle");
if (themeToggle) themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "🔆" : "🌙";
});

// ====== ORDER OVERLAY ======
const orderOverlay = document.createElement("div");
orderOverlay.id = "orderOverlay";
orderOverlay.style.cssText = `display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); justify-content:center; align-items:center; z-index:9999;`;
document.body.appendChild(orderOverlay);

// ====== MESSAGES ======
function showMessage(message, type="info") {
  let msgContainer = document.getElementById("messageContainer");
  if (!msgContainer) {
    msgContainer = document.createElement("div");
    msgContainer.id = "messageContainer";
    msgContainer.style.cssText = "position:fixed; top:20px; right:20px; padding:12px 20px; border-radius:5px; color:white; z-index:10000; font-weight:bold; max-width:300px;";
    document.body.appendChild(msgContainer);
  }

  const styles = { success:"background:#4CAF50;", error:"background:#f44336;", warning:"background:#ff9800;", info:"background:#2196F3;" };
  msgContainer.style.cssText += styles[type] || styles.info;
  msgContainer.textContent = message;
  msgContainer.style.display = "block";
  setTimeout(() => msgContainer.style.display = "none", 3000);
}

// ====== MENU DISPLAY ======
function displayMenu(filter="all") {
  const menuGrid = document.getElementById("menuGrid");
  if (!menuGrid) return console.error("Menu grid not found");

  const filtered = filter==="all" ? menuItems : menuItems.filter(i=>i.category===filter);
  menuGrid.innerHTML = filtered.map(item => `
    <div class="menu-item">
      <img src="${item.image}" alt="${item.name}" onerror="this.src='/images/placeholder.jpg'">
      <div class="item-content">
        <h3 class="item-title">${item.name}</h3>
        <p class="item-description">${item.description}</p>
        <div class="item-price">₦${item.price.toLocaleString()}</div>
        <button class="add-to-cart-btn" onclick="addToCart('${item._id}')">Place Order Now</button>
      </div>
    </div>
  `).join("");
}

function filterMenu(category) {
  currentFilter = category;
  displayMenu(category);
}

// ====== CART ======
function addToCart(itemId) {
  if (!requireAuth()) return;
  const item = menuItems.find(i=>i._id===itemId);
  if (!item) return showMessage("Item not found!", "error");
  const existing = cart.find(i=>i._id===itemId);
  if (existing) existing.quantity++;
  else cart.push({...item, quantity:1});
  updateCartCount();
  showMessage(`${item.name} added to cart!`, "success");
}

function updateCartCount() {
  const cartCount = document.getElementById("cartCount");
  if (cartCount) {
    const total = cart.reduce((sum,i)=>sum+i.quantity,0);
    cartCount.textContent = total;
    cartCount.style.display = total>0?"block":"none";
  }
}

function removeFromCart(itemId) { cart = cart.filter(i=>i._id!==itemId); displayCart(); updateCartCount(); showMessage("Item removed", "info"); }
function updateQuantity(itemId, change) { const item = cart.find(i=>i._id===itemId); if(item){item.quantity+=change; if(item.quantity<=0) removeFromCart(itemId); else {displayCart(); updateCartCount();}}}

function displayCart() {
  const cartEl = document.getElementById("cartItems");
  if (!cartEl) return;
  if(cart.length===0) cartEl.innerHTML="<p class='empty-cart'>Your cart is empty</p>";
  else cartEl.innerHTML = cart.map(i=>`
    <div class="cart-item">
      <div class="cart-item-info">
        <h4>${i.name}</h4>
        <p class="item-price">₦${i.price.toLocaleString()} each</p>
      </div>
      <div class="cart-item-controls">
        <div class="quantity-controls">
          <button onclick="updateQuantity('${i._id}',-1)" class="qty-btn">-</button>
          <span class="quantity">${i.quantity}</span>
          <button onclick="updateQuantity('${i._id}',1)" class="qty-btn">+</button>
        </div>
        <div class="item-total">₦${(i.price*i.quantity).toLocaleString()}</div>
        <button onclick="removeFromCart('${i._id}')" class="remove-btn">🗑️</button>
      </div>
    </div>
  `).join("");
  updateTotal();
}

function updateTotal() {
  const totalEl = document.getElementById("totalPrice");
  if(totalEl) totalEl.textContent=`₦${cart.reduce((sum,i)=>sum+i.price*i.quantity,0).toLocaleString()}`;
}

// ====== CHECKOUT ======
function openCheckoutModal() { if(cart.length===0){showMessage("Cart is empty","warning"); return;} const modal=document.getElementById("checkoutModal"); if(modal){displayCart(); modal.classList.add("active"); modal.style.display="flex";}}
function closeCheckoutModal() { const modal=document.getElementById("checkoutModal"); if(modal){modal.classList.remove("active"); modal.style.display="none";}}

document.getElementById("cartIcon")?.addEventListener("click",openCheckoutModal);
document.getElementById("checkoutClose")?.addEventListener("click",closeCheckoutModal);
document.getElementById("checkoutModal")?.addEventListener("click",(e)=>{if(e.target===e.currentTarget) closeCheckoutModal();});

const proceedBtn = document.getElementById("proceedBtn");
const checkoutForm = document.getElementById("checkoutForm");

proceedBtn?.addEventListener("click",()=>checkoutForm.classList.remove("hidden"));

checkoutForm?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  if(!requireAuth()) return;

  const customerName=document.getElementById("customerName")?.value.trim();
  const customerContact=document.getElementById("customerContact")?.value.trim();
  const deliveryAddress=document.getElementById("deliveryAddress")?.value.trim();

  if(!customerName || !customerContact){showMessage("Enter name and contact!","error"); return;}
  if(cart.length===0){showMessage("Cart is empty","error"); return;}

  const totalAmount=cart.reduce((sum,i)=>sum+i.price*i.quantity,0);
  const orderPayload={
    customerName,
    phoneNum: customerContact,
    items: cart.map(i=>({itemId:i._id,name:i.name,quantity:i.quantity,price:i.price})),
    totalAmount,
    status:"pending",
    space:"food",
    date:new Date().toISOString().split('T')[0],
    time:new Date().toTimeString().split(' ')[0],
    people:1
  };

  orderOverlay.innerHTML=`<div style="background:white;padding:2rem;border-radius:10px;text-align:center;">
    <div class="spinner" style="width:40px;height:40px;border:4px solid #f3f3f3;border-top:4px solid #3498db;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 1rem;"></div>
    <p>Placing your order...</p>
  </div>`;
  orderOverlay.style.display="flex";

  try{
    const orderResult = await ApiService.post('/order',orderPayload); // <-- UPDATED
    showMessage("✅ Order placed successfully!","success");
    cart=[]; updateCartCount(); checkoutForm.reset(); closeCheckoutModal();
    setTimeout(()=>{ const orderId=orderResult.orderId||orderResult._id||orderResult.data?._id||"N/A"; showMessage(`Order #${orderId} confirmed! We'll contact you soon.`,"success");},1000);
  } catch(err){console.error(err); showMessage(`Failed: ${err.message}`,"error");}
  finally{setTimeout(()=>orderOverlay.style.display="none",1000);}
});

// ====== INIT ======
document.addEventListener("DOMContentLoaded", async ()=>{
  console.log("Initializing application...");
  const token=getAuthToken();
  if(!token) showMessage("Please login to place orders","info");
  await loadMenuItems();
  updateCartCount();
  console.log("Application initialized successfully");
});

window.filterMenu=filterMenu;
window.addToCart=addToCart;
window.removeFromCart=removeFromCart;
window.updateQuantity=updateQuantity;
window.openCheckoutModal=openCheckoutModal;
window.closeCheckoutModal=closeCheckoutModal;

const style=document.createElement('style');
style.textContent="@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}";
document.head.appendChild(style);
