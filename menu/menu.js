
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("active");
  menuToggle.textContent = navLinks.classList.contains("active") ? "✕" : "☰";
});

 // === THEME TOGGLE ===
  const themeToggle = document.getElementById("themeToggle");
  themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    themeToggle.textContent = document.body.classList.contains("dark") ? "🔆" : "🌙";
  });
  
const menuItems = [

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
    name: "Malt Drink",
    description: "Rich and malty",
    price: 4500,
    category: "drinks",
    image: "/images/undefined (1).jpeg",
  },
  {
    _id: "4",
    name: "Smoothie",
    description: "Mango and banana",
    price: 6000,
    category: "drinks",
    image: "/images/Mango Banana Smoothie  🌞 Brighten your morning….jpeg",
  },
  {
    _id: "5",
    name: "Fruit Punch",
    description: "Assorted fruits blend",
    price: 5500,
    category: "drinks",
    image: "/images/Fruit Punch Recipe.jpeg",
  },
  {
    _id: "6",
    name: "Coconut Water",
    description: "Freshly extracted",
    price: 4000,
    category: "drinks",
    image: "/images/Nothing beats the pure, refreshing taste of….jpeg",
  },
  {
    _id: "7",
    name: "Iced Tea",
    description: "Lemon flavored",
    price: 3500,
    category: "drinks",
    image: "/images/💬 Feeling overheated_ Cool down in the most….jpeg",
  },
  {
    _id: "8",
    name: "Coffee",
    description: "Hot brewed coffee",
    price: 4500,
    category: "drinks",
    image: "/images/undefined (2).jpeg",
  },
  {
    _id: "9",
    name: "Green Juice",
    description: "Spinach and apple",
    price: 5000,
    category: "drinks",
    image: "/images/Start your day with this revitalizing green juice….jpeg",
  },
  {
    _id: "10",
    name: "Orange Juice",
    description: "Freshly squeezed",
    price: 5000,
    category: "drinks",
    image: "/images/Description_ _Experience a burst of sunshine with….jpeg",
  },
  {
    _id: "11",
    name: "palm wine",
    description: "Freshly tapped",
    price: 5000,
    category: "drinks",
    image: "/images/Palm Wine - Traditional West African Drink _ 196….jpeg",
  },

  
  {
    _id: "11",
    name: "Jollof Rice",
    description: "With chicken or fish",
    price: 5000,
    category: "food",
    image: "/images/b0ea2267-f951-4a8c-a9bf-0d2b6e652ce9.jpeg",
  },
  {
    _id: "12",
    name: "Fried Rice",
    description: "Mixed vegetables and chicken",
    price: 5500,
    category: "food",
    image: "/images/a6b97136-9822-492e-bc6e-af0f2f961912.jpeg",
  },
  {
    _id: "13",
    name: "Egusi Soup",
    description: "Served with pounded yam",
    price: 6000,
    category: "food",
    image: "/images/undefined (5).jpeg",
  },
  {
    _id: "14",
    name: "Okra Soup",
    description: "With assorted meat",
    price: 6500,
    category: "food",
    image: "/images/Seafood Okro _ Okra ￼.jpeg",
  },
  {
    _id: "15",
    name: "Efo Riro",
    description: "Spinach stew with meat",
    price: 6000,
    category: "food",
    image: "/images/African Spinach Stew - Efo Riro _ Low Carb Africa….jpeg",
  },
  {
    _id: "16",
    name: "Suya",
    description: "Spicy grilled beef",
    price: 7000,
    category: "food",
    image: "/images/Dive into the rich and vibrant flavors of Nigeria….jpeg",
  },
  {
    _id: "17",
    name: "Moi Moi",
    description: "Steamed bean pudding",
    price: 4000,
    category: "food",
    image: "/images/Moimoi - Steamed Bean Pudding.jpeg",
  },
  {
    _id: "18",
    name: "Pounded Yam",
    description: "Served with soup",
    price: 5000,
    category: "food",
    image: "/images/undefined (3).jpeg",
  },
  {
    _id: "19",
    name: "Amala",
    description: "Served with ewedu soup",
    price: 5500,
    category: "food",
    image: "/images/undefined (6).jpeg",
  },
  {
    _id: "20",
    name: "Ofada Rice",
    description: "Served with ayamase sauce",
    price: 6000,
    category: "food",
    image: "/images/Ofada rice_..delicious ! www.sisiyemmie.com",
  },
  {
    _id: "21",
    name: "Pepper Soup",
    description: "Spicy fish soup",
    price: 4500,
    category: "food",
    image: "/images/I had never tried catfish pepper soup until my….jpeg",
  },
  {
    _id: "22",
    name: "Plantain Chips",
    description: "Crunchy snack",
    price: 2500,
    category: "food",
    image: "/images/Baked Plantain Chips – Crisp, Sweet & Totally….jpeg",
  },
  {
    _id: "23",
    name: "Boli",
    description: "Roasted plantain",
    price: 3000,
    category: "food",
    image: "/images/DrugXpert blog_ Is Roasted (Smoke) Ripe Plantain….jpeg",
  },
  {
    _id: "24",
    name: "Fish Stew",
    description: "Served with yam or rice",
    price: 6500,
    category: "food",
    image: "/images/Easy and delicious recipe.jpeg",
  },
  {
    _id: "25",
    name: "Chicken Stew",
    description: "Served with rice",
    price: 6000,
    category: "food",
    image: "/images/undefined (7).jpeg",
  },
  {
    _id: "26",
    name: "Beef Stew",
    description: "Served with rice or yam",
    price: 6500,
    category: "food",
    image: "/images/Indulge in this comforting dish of tender beef….jpeg",
  },
  {
    _id: "27",
    name: "Eba",
    description: "Served with egusi soup",
    price: 5000,
    category: "food",
    image: "/images/undefined (8).jpeg",
  },
  {
    _id: "28",
    name: "Yam Porridge",
    description: "Spiced yam with vegetables",
    price: 5500,
    category: "food",
    image: "/images/undefined (9).jpeg",
  },
  {
    _id: "29",
    name: "Spaghetti",
    description: "Tomato sauce with meat",
    price: 4500,
    category: "food",
    image: "/images/the ultimate comfort food! This rich, hearty sauce….jpeg",
  },
  {
    _id: "30",
    name: "Pizza",
    description: "Cheese, tomato, and toppings",
    price: 7000,
    category: "food",
    image: "/images/Easy Cheese Pizza Recipe_ Make the easy and….jpeg",
  },
  {
    _id: "31",
    name: "Burger",
    description: "Beef patty with fries",
    price: 6000,
    category: "food",
    image: "/images/A burger is a well-liked meal that consists of a….jpeg",
  },
  {
    _id: "32",
    name: "Hot Dog",
    description: "Sausage with bun",
    price: 4000,
    category: "food",
    image: "/images/🌟 Experience the classic Australian Sausage….jpeg",
  },
  {
    _id: "33",
    name: "Salad",
    description: "Fresh garden salad",
    price: 3500,
    category: "food",
    image: "/images/Looking for a quick yet satisfying meal_ Check out….jpeg",
  },
  {
    _id: "34",
    name: "Pancakes",
    description: "With syrup and butter",
    price: 4000,
    category: "food",
    image: "/images/undefined (10).jpeg",
  },
  {
    _id: "35",
    name: "Ice Cream",
    description: "Vanilla and chocolate",
    price: 3000,
    category: "food",
    image: "/images/Homemade Chocolate Ice Cream with Nuts & Fudge….jpeg",
  },
];
let cart = [];


function showMessage(msg, type = "info", duration = 4000) {
  let container = document.getElementById("messageContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "messageContainer";
    Object.assign(container.style, {
      position: "fixed",
      top: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      padding: "12px 20px",
      borderRadius: "8px",
      zIndex: 9999,
      color: "#fff",
      fontWeight: "600",
      fontFamily: "sans-serif",
      opacity: "0",
      transition: "opacity 0.3s",
    });
    document.body.appendChild(container);
  }
  container.textContent = msg;
  container.style.background = type === "error" ? "#dc3545" : type === "success" ? "#28a745" : "#007bff";
  container.style.opacity = "1";
  setTimeout(() => (container.style.opacity = "0"), duration);
}


function displayMenu(filter = "all") {
  const grid = document.getElementById("menuGrid");
  if (!grid) return;
  const filtered = filter === "all" ? menuItems : menuItems.filter(i => i.category === filter);
  grid.innerHTML = filtered.map(item => `
     <div class="menu-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="item-content">
        <h3 class="item-title">${item.name}</h3>
        <p class="item-description">${item.description}</p>
        <div class="item-price">₦${item.price.toLocaleString()}</div>
        <button class="add-to-cart-btn" onclick="addToCart('${
          item._id
        }')">Place Order Now</button>
      </div>
    </div>
  `).join('');
}
window.filterMenu = displayMenu;

// === CART FUNCTIONS ===
function addToCart(id) {
  const item = menuItems.find(i => i._id === id);
  if (!item) return;
  const existing = cart.find(c => c._id === id);
  if (existing) existing.quantity++;
  else cart.push({ ...item, quantity: 1 });
  updateCartCount();
  displayCart();
}
function removeFromCart(id) {
  cart = cart.filter(i => i._id !== id);
  updateCartCount();
  displayCart();
}
function updateQuantity(id, change) {
  const item = cart.find(i => i._id === id);
  if (!item) return;
  item.quantity += change;
  if (item.quantity <= 0) removeFromCart(id);
  else displayCart();
}
function updateCartCount() {
  const el = document.getElementById("cartCount");
  if (!el) return;
  const total = cart.reduce((sum, i) => sum + i.quantity, 0);
  el.textContent = total;
}
function displayCart() {
  const cartEl = document.getElementById("cartItems");
  if (!cartEl) return;
  if (!cart.length) { cartEl.innerHTML = "<p>Your cart is empty</p>"; return; }
  cartEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div>
        <strong>${item.name}</strong> <br>
        ₦${item.price.toLocaleString()} x ${item.quantity}
      </div>
      <div>
        <button onclick="updateQuantity('${item._id}', -1)">−</button>
        <button onclick="updateQuantity('${item._id}', 1)">+</button>
        <button onclick="removeFromCart('${item._id}')">🗑️</button>
      </div>
    </div>
  `).join('');
  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  document.getElementById("totalPrice").textContent = `₦${total.toLocaleString()}`;
}


async function submitOrder() {
  if (!cart.length) return showMessage("Cart is empty", "error");
  
  const overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: "fixed", inset: "0", background: "rgba(0,0,0,0.5)", display: "flex",
    justifyContent: "center", alignItems: "center", zIndex: "9999"
  });
  overlay.innerHTML = `<div style="color:white; text-align:center;">
    <div style="border:6px solid rgba(255,255,255,0.3); border-top:6px solid white; border-radius:50%; width:50px; height:50px; margin:auto; animation:spin 1s linear infinite;"></div>
    <p>Processing your order...</p>
  </div>`;
  document.body.appendChild(overlay);

  const token = localStorage.getItem("authToken"); // optional token
  const payload = {
    userId: token ? localStorage.getItem("userId") : undefined,
    items: cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
    totalPrice: cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
  };

  try {
    const res = await fetch("https://hostify-app-nnod.vercel.app/api/orders/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    document.body.removeChild(overlay);

    if (!res.ok) return showMessage(data.message || "Order failed", "error");

    showMessage("✅ Order submitted successfully!", "success");
    cart = [];
    updateCartCount();
    displayCart();

  } catch (err) {
    document.body.removeChild(overlay);
    console.error(err);
    showMessage("⚠️ Network error. Try again.", "error");
  }
}

// === EVENT LISTENERS ===
document.getElementById("cartIcon").addEventListener("click", () => {
  document.getElementById("checkoutModal").classList.add("active");
  displayCart();
});

document.getElementById("checkoutClose").addEventListener("click", () => {
  document.getElementById("checkoutModal").classList.remove("active");
});

document.getElementById("proceedBtn").addEventListener("click", () => {
  submitOrder();
});


const style = document.createElement("style");
style.innerHTML = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(style);


displayMenu();
updateCartCount();
