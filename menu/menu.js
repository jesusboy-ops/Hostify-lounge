const API_BASE = "";

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("active");
  menuToggle.textContent = navLinks.classList.contains("active") ? "✕" : "☰";
});

const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark")
    ? "🔆"
    : "🌙";
});


const menuItems = [
  // drinks
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

  // food
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
let currentFilter = "all";

const orderOverlay = document.createElement("div");
orderOverlay.id = "orderOverlay";
orderOverlay.classList.add("order-overlay");
document.body.appendChild(orderOverlay);

function displayMenu(filter = "all") {
  const menuGrid = document.getElementById("menuGrid");
  const filtered =
    filter === "all"
      ? menuItems
      : menuItems.filter((i) => i.category === filter);
  menuGrid.innerHTML = filtered
    .map(
      (item) => `
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
  `
    )
    .join("");
}

function filterMenu(category) {
  currentFilter = category;
  displayMenu(category);
}

function addToCart(itemId) {
  const item = menuItems.find((i) => i._id === itemId);
  const existing = cart.find((i) => i._id === itemId);
  if (existing) existing.quantity++;
  else cart.push({ ...item, quantity: 1 });
  updateCartCount();
}

function updateCartCount() {
  document.getElementById("cartCount").textContent = cart.reduce(
    (a, b) => a + b.quantity,
    0
  );
}

// Cart Display
const cartIcon = document.getElementById("cartIcon");
const checkoutModal = document.getElementById("checkoutModal");
const cartItemsEl = document.getElementById("cartItems");
cartIcon.addEventListener("click", () => {
  if (cart.length === 0) return alert("Your cart is empty!");
  displayCart();
  checkoutModal.classList.add("active");
});

document
  .getElementById("checkoutClose")
  .addEventListener("click", () => checkoutModal.classList.remove("active"));

function displayCart() {
  if (cart.length === 0) cartItemsEl.innerHTML = "<p>Your cart is empty</p>";
  else
    cartItemsEl.innerHTML = cart
      .map(
        (i) => `
    <div class="cart-item">
      <span>${i.name} x ${i.quantity}</span>
      <span>₦${(i.price * i.quantity).toLocaleString()}</span>
    </div>
  `
      )
      .join("");
  updateTotal();
}

function updateTotal() {
  const total = cart.reduce((a, b) => a + b.price * b.quantity, 0);
  document.getElementById(
    "totalPrice"
  ).textContent = `₦${total.toLocaleString()}`;
}

const proceedBtn = document.getElementById("proceedBtn");
const checkoutForm = document.getElementById("checkoutForm");

proceedBtn.addEventListener("click", () => {
  checkoutForm.classList.remove("hidden");
});

checkoutForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const customerName = document.getElementById("customerName").value;
  const customerContact = document.getElementById("customerContact").value;
  if (!customerName || !customerContact)
    return alert("Please enter name and contact!");

  const orderPayload = {
    customerName,
    contact: customerContact,
    orders: cart.map((i) => ({
      itemId: i._id,
      name: i.name,
      quantity: i.quantity,
      price: i.price,
    })),
    total: cart.reduce((a, b) => a + b.price * b.quantity, 0),
    status: "Pending",
    timestamp: new Date().toISOString(),
  };

  orderOverlay.innerHTML = `<div class="overlay-content">
                               <div class="spinner"></div>
                               <p>Placing your order...</p>
                             </div>`;
  orderOverlay.style.display = "flex";

  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });
    console.log(await res.json());
    alert("✅ Order placed successfully!");
    cart = [];
    updateCartCount();
    displayCart();
    checkoutForm.classList.add("hidden");
  } catch (err) {
    console.warn("Backend not active yet");
    alert("⚠️ Could not send order, frontend working only.");
  } finally {
    setTimeout(() => {
      orderOverlay.style.display = "none";
    }, 500);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  displayMenu();
  updateCartCount();
});
