
const API_BASE = "https://yourbackenddomain.com/api"; // replace with your backend

function checkAuth(){
  const staffName = localStorage.getItem('staffName');
  if(!staffName) { window.location.href='staff.html'; return null; }
  return staffName;
}

async function apiRequest(endpoint, method='GET', body=null){
  try{
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      method,
      headers:{'Content-Type':'application/json'},
      body: body? JSON.stringify(body): null
    });
    if(!res.ok) throw new Error(`Request failed: ${res.status}`);
    return await res.json();
  } catch(err){
    console.error(err);
    alert(`Server error: ${err.message}`);
    return null;
  }
}

function getSpinnerHTML(){ return '<tr><td colspan="6">⏳ Loading...</td></tr>'; }

async function renderBookings(){
  const tbody = document.getElementById('bookingsTableBody');
  tbody.innerHTML = getSpinnerHTML();
  const bookings = await apiRequest('bookings') || [];
  if(!bookings.length){ tbody.innerHTML='<tr><td colspan="6">No bookings found</td></tr>'; return; }
  tbody.innerHTML = bookings.map(b=>`
    <tr>
      <td>${b.fullName || '-'}</td>
      <td>${b.date || '-'}</td>
      <td>${b.time || '-'}</td>
      <td>${b.table || '-'}</td>
      <td>${b.status || 'Pending'}</td>
      <td>
        <button class="action-btn approve" onclick="updateBookingStatus('${b._id}','Confirmed')">✅</button>
        <button class="action-btn reject" onclick="updateBookingStatus('${b._id}','Rejected')">❌</button>
      </td>
    </tr>
  `).join('');
}

async function renderOrders(){
  const tbody = document.getElementById('ordersTableBody');
  tbody.innerHTML = getSpinnerHTML();
  const orders = await apiRequest('orders') || [];
  if(!orders.length){ tbody.innerHTML='<tr><td colspan="6">No orders found</td></tr>'; return; }
  tbody.innerHTML = orders.map(o=>`
    <tr>
      <td>${o._id || '-'}</td>
      <td>${o.customerName || '-'}</td>
      <td>₦${(o.total||0).toLocaleString()}</td>
      <td>${o.status || 'Pending'}</td>
      <td>${new Date(o.time || Date.now()).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</td>
      <td>
        <button class="action-btn complete" onclick="updateOrderStatus('${o._id}','Completed')">✔</button>
        <button class="action-btn pending" onclick="updateOrderStatus('${o._id}','Pending')">⏳</button>
      </td>
    </tr>
  `).join('');
}

async function renderFeedback(){
  const grid = document.getElementById('feedbackGrid');
  grid.innerHTML = '<p>⏳ Loading...</p>';
  const feedback = await apiRequest('feedback') || [];
  if(!feedback.length){ grid.innerHTML='<div class="empty-state"><p>No feedback yet.</p></div>'; return; }
  grid.innerHTML = feedback.map(f=>`
    <div class="feedback-card">
      <div class="feedback-header">
        <span class="feedback-name">${f.name || 'Anonymous'}</span>
        <button class="delete-feedback" onclick="deleteFeedback('${f._id}')">🗑️</button>
      </div>
      <div class="rating-stars">${'★'.repeat(f.rating||0)+'☆'.repeat(5-(f.rating||0))}</div>
      <div class="feedback-comment">${f.comment || ''}</div>
    </div>
  `).join('');
}

async function updateBookingStatus(id,newStatus){
  if(!confirm(`Change booking status to "${newStatus}"?`)) return;
  await apiRequest(`bookings/${id}`,'PATCH',{status:newStatus});
  renderBookings();
}

async function updateOrderStatus(id,newStatus){
  if(!confirm(`Mark order as "${newStatus}"?`)) return;
  await apiRequest(`orders/${id}`,'PATCH',{status:newStatus});
  renderOrders();
}

async function deleteFeedback(id){
  if(!confirm('Are you sure you want to delete this feedback?')) return;
  await apiRequest(`feedback/${id}`,'DELETE');
  renderFeedback();
}

// Sidebar Navigation
document.querySelectorAll('.nav-item').forEach(item=>{
  item.addEventListener('click',function(){
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
    this.classList.add('active');
    const sectionId=this.dataset.section+'-section';
    document.querySelectorAll('.content-section').forEach(sec=>sec.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    if(window.innerWidth<=768){
      document.getElementById('sidebar').classList.remove('visible');
      document.getElementById('menuToggle').classList.remove('active');
    }
  });
});

// Mobile Menu Toggle
document.getElementById('menuToggle').addEventListener('click',function(){
  document.getElementById('sidebar').classList.toggle('visible');
  this.classList.toggle('active');
});

// Logout
document.getElementById('logoutBtn').addEventListener('click',()=>{ if(confirm('Logout now?')){ localStorage.removeItem('staffName'); window.location.href='staff.html'; } });

async function initDashboard(){
  const staffName=checkAuth();
  if(!staffName) return;
  document.getElementById('welcomeMessage').textContent=`Welcome back, ${staffName} 👋`;
  renderBookings();
  renderOrders();
  renderFeedback();
}
document.addEventListener('DOMContentLoaded',initDashboard);