const API_URL = 'http://localhost:3000';

document.cookie = 'session_id=ses_' + Math.random().toString(36).substr(2, 16) + '; path=/; max-age=31536000';
document.cookie = 'tracking_uid=usr_' + Math.random().toString(36).substr(2, 16) + '; path=/; max-age=63072000';

async function register() {
  const data = {
    username: document.getElementById('username').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    birthdate: document.getElementById('birthdate').value,
    address: document.getElementById('address').value,
    phone: document.getElementById('phone').value,
    creditcard: document.getElementById('creditcard').value,
    health_info: document.getElementById('health_info').value
  };

  const response = await fetch(`${API_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  localStorage.setItem('user', JSON.stringify(result.user));
  localStorage.setItem('password', data.password);

  alert(result.message);
}

async function login() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  const response = await fetch(`${API_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const result = await response.json();
  if (result.user) {
    localStorage.setItem('currentUser', JSON.stringify(result.user));
    document.getElementById('loginStatus').textContent = `Eingeloggt als: ${result.user.username}`;
    trackPageView('login-success');
  }
}

function trackPageView(page) {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  fetch(`${API_URL}/api/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user?.id, page, timestamp: new Date().toISOString() })
  }).catch(() => {});
}

async function loadComments() {
  const response = await fetch(`${API_URL}/api/comments`);
  const comments = await response.json();

  const container = document.getElementById('comments');
  container.innerHTML = '';

  comments.forEach(comment => {
    const div = document.createElement('div');
    div.innerHTML = comment.content;
    container.appendChild(div);
  });
}

async function postComment() {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  const comment = document.getElementById('commentText').value;

  await fetch(`${API_URL}/api/comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user?.id, comment })
  });

  loadComments();
}

trackPageView('home');
loadComments();
