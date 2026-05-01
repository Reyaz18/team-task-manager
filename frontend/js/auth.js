const API = 'http://localhost:5000/api';

function showTab(tab) {
  document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
  document.getElementById('signup-form').classList.toggle('hidden', tab !== 'signup');
  document.getElementById('tab-login').className = tab === 'login'
    ? 'flex-1 py-2 font-semibold text-blue-600 border-b-2 border-blue-600'
    : 'flex-1 py-2 font-semibold text-gray-400';
  document.getElementById('tab-signup').className = tab === 'signup'
    ? 'flex-1 py-2 font-semibold text-blue-600 border-b-2 border-blue-600'
    : 'flex-1 py-2 font-semibold text-gray-400';
}

async function login() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const msg = document.getElementById('msg');
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) return msg.textContent = data.message;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = 'dashboard.html';
  } catch {
    msg.textContent = 'Server error. Please try again.';
  }
}

async function signup() {
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const role = document.getElementById('signup-role').value;
  const msg = document.getElementById('msg');
  try {
    const res = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    const data = await res.json();
    if (!res.ok) return msg.textContent = data.message;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = 'dashboard.html';
  } catch {
    msg.textContent = 'Server error. Please try again.';
  }
}
