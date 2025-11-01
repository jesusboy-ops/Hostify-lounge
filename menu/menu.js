
 // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuToggle.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
    });

    // Dark Mode toggle
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      themeToggle.textContent = document.body.classList.contains('dark') ? '🔆' : '🌙';
    });

    // Menu Items Data
    const menuItems = [
      { id: 1, name: 'Zobo Drink', description: 'With lemon and mint', price: 5000, category: 'drinks', image: '/images/bb37bfa2-9c82-4ade-b4e2-72e9bf50be9b.jpeg' },
      { id: 2, name: 'Jollof Rice', description: 'With chicken or fish', price: 5000, category: 'food', image: '/images/b0ea2267-f951-4a8c-a9bf-0d2b6e652ce9.jpeg' },
      { id: 3, name: 'Spaghetti', description: 'With chicken chunks', price: 5000, category: 'food', image: '/images/spag.jpeg' },
      { id: 4, name: 'Rice and Stew', description: 'With plantain and veggies', price: 5000, category: 'food', image: '/images/97e576ee-702f-4c9f-8aa7-3c1894b3c0bd.jpeg' },
      { id: 5, name: 'Fried Rice', description: 'With chicken or beef', price: 5000, category: 'food', image: '/images/a6b97136-9822-492e-bc6e-af0f2f961912.jpeg' },
      { id: 6, name: 'Banana Smoothie', description: 'Strawberry available', price: 5000, category: 'drinks', image: '/images/The best 3-ingredient smoothie_ Make this easy….jpeg' },
      { id: 7, name: 'Mint Tea', description: 'Natural herbs', price: 5000, category: 'drinks', image: '/images/Mint tea is flavorful and fragrant herbal tea….jpeg' },
      { id: 8, name: 'Yam and Sauce', description: 'Sauce can be changed', price: 5000, category: 'food', image: '/images/539aa2a4-1325-47a3-8498-e47f9433a4c5.jpeg' }
    ];

    let cart = [];
    let currentFilter = 'all';

    function displayMenu(filter = 'all') {
      const menuGrid = document.getElementById('menuGrid');
      const filtered = filter === 'all' ? menuItems : menuItems.filter(item => item.category === filter);
      menuGrid.innerHTML = filtered.map(item => `
        <div class="menu-item">
          <img src="${item.image}" alt="${item.name}">
          <div class="item-content">
            <h3 class="item-title">${item.name}</h3>
            <p class="item-description">${item.description}</p>
            <div class="item-price">₦${item.price.toLocaleString()}</div>
            <button class="add-to-cart-btn" onclick="addToCart(${item.id})">Place Order Now</button>
          </div>
        </div>
      `).join('');
    }

    function filterMenu(category) {
      currentFilter = category;
      displayMenu(category);
    }

    function addToCart(itemId) {
      const item = menuItems.find(i => i.id === itemId);
      const existingItem = cart.find(i => i.id === itemId);
      if (existingItem) { existingItem.quantity++; } else { cart.push({ ...item, quantity: 1 }); }
      updateCartCount();
      animateCartIcon();
    }

    function updateCartCount() {
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      document.getElementById('cartCount').textContent = totalItems;
    }

    function animateCartIcon() {
      const icon = document.getElementById('cartIcon');
      icon.style.transform = 'scale(1.2)';
      setTimeout(() => icon.style.transform = 'scale(1)', 300);
    }

    document.getElementById('cartIcon').addEventListener('click', () => {
      if (cart.length === 0) { alert('Your cart is empty!'); return; }
      displayCart();
      document.getElementById('checkoutModal').classList.add('active');
    });

    function closeCheckout() { document.getElementById('checkoutModal').classList.remove('active'); }

    function displayCart() {
      const cartItems = document.getElementById('cartItems');
      if (cart.length === 0) { cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>'; return; }
      cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
          <div class="cart-item-info">
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-price">₦${item.price.toLocaleString()}</div>
          </div>
          <div class="quantity-controls">
            <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
            <span class="qty-display">${item.quantity}</span>
            <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
          </div>
          <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
      `).join('');
      updateTotal();
    }

    function updateQuantity(itemId, change) {
      const item = cart.find(i => i.id === itemId);
      if (item) {
        item.quantity += change;
        if (item.quantity <= 0) { removeFromCart(itemId); } 
        else { displayCart(); updateCartCount(); }
      }
    }

    function removeFromCart(itemId) {
      cart = cart.filter(i => i.id !== itemId);
      displayCart();
      updateCartCount();
      if(cart.length===0) closeCheckout();
    }

    function updateTotal() {
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      document.getElementById('totalPrice').textContent = `₦${total.toLocaleString()}`;
    }

    function proceedToCheckout() {
      alert('Proceeding to payment... Total: ₦' + cart.reduce((sum,item)=>sum+(item.price*item.quantity),0).toLocaleString());
      cart=[]; updateCartCount(); closeCheckout(); displayMenu(currentFilter);
    }

    // Initialize
    displayMenu();