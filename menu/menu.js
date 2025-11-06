const API_BASE = "https://hostify-app-nnod.vercel.app/api";

// ====== AUTHENTICATION HELPERS ======
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
    const headers = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, { headers });
    
    if (response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      window.location.href = "/auth.html";
      throw new Error("Authentication required");
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  },

  async post(endpoint, data) {
    const token = getAuthToken();
    const headers = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

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

    return await response.json();
  }
};

// ====== MENU MANAGEMENT ======
let menuItems = [];
let cart = [];
let currentFilter = "all";

// Fallback menu data
function getFallbackMenuItems() {
  return [
    {
      _id: "1",
      name: "Zobo Drink",
      description: "With lemon and mint",
      price: 5000,
      category: "drinks",
      image: "/images/bb37bfa2-9c82-4ade-b4e2-72e9bf50be9b.jpeg",
    },
    {
      _id: "2",
      name: "Chapman",
      description: "Sweet and refreshing",
      price: 5000,
      category: "drinks",
      image: "/images/undefined.jpeg",
    },
    {
      _id: "3",
      name: "Jollof Rice",
      description: "With chicken or fish",
      price: 5000,
      category: "food",
      image: "/images/b0ea2267-f951-4a8c-a9bf-0d2b6e652ce9.jpeg",
    },
    {
      _id: "4",
      name: "Fried Rice",
      description: "Mixed vegetables and chicken",
      price: 5500,
      category: "food",
      image: "/images/a6b97136-9822-492e-bc6e-af0f2f961912.jpeg",
    }
  ];
}

async function loadMenuItems() {
  try {
    console.log("Loading menu items from backend...");
    
    // Use the endpoint we know exists
    const menuData = await ApiService.get('/book/all');
    console.log("Menu data received:", menuData);

    // Handle different response structures
    if (Array.isArray(menuData)) {
      menuItems = menuData;
    } else if (menuData.data && Array.isArray(menuData.data)) {
      menuItems = menuData.data;
    } else if (menuData.items && Array.isArray(menuData.items)) {
      menuItems = menuData.items;
    } else if (menuData.books && Array.isArray(menuData.books)) {
      menuItems = menuData.books;
    } else {
      console.warn("Unexpected menu data structure:", menuData);
      menuItems = getFallbackMenuItems();
    }

    console.log("Loaded menu items:", menuItems.length);
    displayMenu();
    
  } catch (error) {
    console.error("Failed to load menu items from backend:", error);
    // Fallback to local menu items
    menuItems = getFallbackMenuItems();
    displayMenu();
    showMessage("Using offline menu. Some features may be limited.", "warning");
  }
}

// ====== UI MANAGEMENT ======
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    menuToggle.textContent = navLinks.classList.contains("active") ? "✕" : "☰";
  });
}

const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    themeToggle.textContent = document.body.classList.contains("dark") ? "🔆" : "🌙";
  });
}

// ====== ORDER OVERLAY ======
const orderOverlay = document.createElement("div");
orderOverlay.id = "orderOverlay";
orderOverlay.style.cssText = `
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;
document.body.appendChild(orderOverlay);

// ====== MESSAGE DISPLAY ======
function showMessage(message, type = "info") {
  let messageContainer = document.getElementById("messageContainer");
  if (!messageContainer) {
    messageContainer = document.createElement("div");
    messageContainer.id = "messageContainer";
    messageContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 5px;
      color: white;
      z-index: 10000;
      font-weight: bold;
      max-width: 300px;
    `;
    document.body.appendChild(messageContainer);
  }

  const styles = {
    success: "background: #4CAF50;",
    error: "background: #f44336;",
    warning: "background: #ff9800;",
    info: "background: #2196F3;"
  };

  messageContainer.style.cssText += styles[type] || styles.info;
  messageContainer.textContent = message;
  messageContainer.style.display = "block";

  setTimeout(() => {
    messageContainer.style.display = "none";
  }, 3000);
}

// ====== MENU DISPLAY ======
function displayMenu(filter = "all") {
  const menuGrid = document.getElementById("menuGrid");
  if (!menuGrid) {
    console.error("Menu grid element not found");
    return;
  }

  const filtered = filter === "all" 
    ? menuItems 
    : menuItems.filter(item => item.category === filter);

  menuGrid.innerHTML = filtered.map(item => `
    <div class="menu-item">
      <img src="${item.image}" alt="${item.name}" onerror="this.src='/images/placeholder.jpg'">
      <div class="item-content">
        <h3 class="item-title">${item.name}</h3>
        <p class="item-description">${item.description}</p>
        <div class="item-price">₦${item.price.toLocaleString()}</div>
        <button class="add-to-cart-btn" onclick="addToCart('${item._id}')">
          Place Order Now
        </button>
      </div>
    </div>
  `).join("");
}

function filterMenu(category) {
  currentFilter = category;
  displayMenu(category);
}

// ====== CART MANAGEMENT ======
function addToCart(itemId) {
  if (!requireAuth()) return;

  const item = menuItems.find(i => i._id === itemId);
  if (!item) {
    showMessage("Item not found!", "error");
    return;
  }

  const existing = cart.find(i => i._id === itemId);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...item, quantity: 1 });
  }
  
  updateCartCount();
  showMessage(`${item.name} added to cart!`, "success");
}

function updateCartCount() {
  const cartCount = document.getElementById("cartCount");
  if (cartCount) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? "block" : "none";
  }
}

function removeFromCart(itemId) {
  cart = cart.filter(item => item._id !== itemId);
  displayCart();
  updateCartCount();
  showMessage("Item removed from cart", "info");
}

function updateQuantity(itemId, change) {
  const item = cart.find(i => i._id === itemId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(itemId);
    } else {
      displayCart();
      updateCartCount();
    }
  }
}

// ====== CART DISPLAY ======
function displayCart() {
  const cartItemsEl = document.getElementById("cartItems");
  if (!cartItemsEl) return;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = "<p class='empty-cart'>Your cart is empty</p>";
  } else {
    cartItemsEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p class="item-price">₦${item.price.toLocaleString()} each</p>
        </div>
        <div class="cart-item-controls">
          <div class="quantity-controls">
            <button onclick="updateQuantity('${item._id}', -1)" class="qty-btn">-</button>
            <span class="quantity">${item.quantity}</span>
            <button onclick="updateQuantity('${item._id}', 1)" class="qty-btn">+</button>
          </div>
          <div class="item-total">₦${(item.price * item.quantity).toLocaleString()}</div>
          <button onclick="removeFromCart('${item._id}')" class="remove-btn">🗑️</button>
        </div>
      </div>
    `).join("");
  }
  updateTotal();
}

function updateTotal() {
  const totalElement = document.getElementById("totalPrice");
  if (totalElement) {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalElement.textContent = `₦${total.toLocaleString()}`;
  }
}

// ====== CHECKOUT MODAL ======
function openCheckoutModal() {
  if (cart.length === 0) {
    showMessage("Your cart is empty!", "warning");
    return;
  }
  
  const checkoutModal = document.getElementById("checkoutModal");
  if (checkoutModal) {
    displayCart();
    checkoutModal.classList.add("active");
    checkoutModal.style.display = "flex";
  }
}

function closeCheckoutModal() {
  const checkoutModal = document.getElementById("checkoutModal");
  if (checkoutModal) {
    checkoutModal.classList.remove("active");
    checkoutModal.style.display = "none";
  }
}

const cartIcon = document.getElementById("cartIcon");
if (cartIcon) {
  cartIcon.addEventListener("click", openCheckoutModal);
}

const checkoutClose = document.getElementById("checkoutClose");
if (checkoutClose) {
  checkoutClose.addEventListener("click", closeCheckoutModal);
}

// Close modal when clicking outside
const checkoutModal = document.getElementById("checkoutModal");
if (checkoutModal) {
  checkoutModal.addEventListener("click", (e) => {
    if (e.target === checkoutModal) {
      closeCheckoutModal();
    }
  });
}

// ====== CHECKOUT PROCESS ======
const proceedBtn = document.getElementById("proceedBtn");
const checkoutForm = document.getElementById("checkoutForm");

if (proceedBtn && checkoutForm) {
  proceedBtn.addEventListener("click", () => {
    checkoutForm.classList.remove("hidden");
  });
}

if (checkoutForm) {
  checkoutForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    if (!requireAuth()) return;

    const customerName = document.getElementById("customerName")?.value.trim();
    const customerContact = document.getElementById("customerContact")?.value.trim();
    const deliveryAddress = document.getElementById("deliveryAddress")?.value.trim();

    if (!customerName || !customerContact) {
      showMessage("Please enter your name and contact information!", "error");
      return;
    }

    if (cart.length === 0) {
      showMessage("Your cart is empty!", "error");
      return;
    }

    const user = getCurrentUser();
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const orderPayload = {
      customerName,
      phoneNum: customerContact, // Use phoneNum to match backend
      items: cart.map(item => ({
        itemId: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount,
      status: "pending",
      // Add required fields for booking
      space: "food", // Indicates this is a food order
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
      people: 1
    };

    console.log("Submitting order:", orderPayload);

    // Show loading
    orderOverlay.innerHTML = `
      <div class="overlay-content" style="background: white; padding: 2rem; border-radius: 10px; text-align: center;">
        <div class="spinner" style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
        <p style="margin: 0; font-size: 1.1rem;">Placing your order...</p>
      </div>`;
    orderOverlay.style.display = "flex";

    try {
      // Use the correct booking endpoint
      const orderResult = await ApiService.post('/book/post', orderPayload);
      console.log("Order successful:", orderResult);

      showMessage("✅ Order placed successfully!", "success");
      
      // Clear cart and reset UI
      cart = [];
      updateCartCount();
      checkoutForm.reset();
      closeCheckoutModal();

      // Show order confirmation
      setTimeout(() => {
        const orderId = orderResult.orderId || orderResult._id || orderResult.data?._id || "N/A";
        showMessage(`Order #${orderId} confirmed! We'll contact you soon.`, "success");
      }, 1000);

    } catch (error) {
      console.error("Order submission failed:", error);
      showMessage(`Failed to place order: ${error.message}`, "error");
    } finally {
      setTimeout(() => {
        orderOverlay.style.display = "none";
      }, 1000);
    }
  });
}

// ====== INITIALIZATION ======
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Initializing application...");
  
  // Check authentication
  const token = getAuthToken();
  if (!token) {
    console.log("User not authenticated");
    showMessage("Please login to place orders", "info");
  } else {
    console.log("User authenticated");
  }

  // Load menu from backend
  await loadMenuItems();
  
  // Initialize UI
  updateCartCount();
  
  console.log("Application initialized successfully");
});

// ====== GLOBAL FUNCTIONS ======
window.filterMenu = filterMenu;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.openCheckoutModal = openCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;

// Add CSS for spinner animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);