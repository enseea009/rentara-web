const API_BASE_URL = '/api';

// Common utility functions
function updateHeaderAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    const authSection = document.getElementById('auth-section');

    if (authSection && user && user.first_name) {
        // Find if we are in a subfolder or root
        const isSubpage = window.location.pathname.includes('/pages/');
        const profilePath = isSubpage ? 'profile.html' : 'pages/profile.html';
        const loginPath = isSubpage ? 'login.html' : 'pages/login.html';

        authSection.innerHTML = `
            <div class="user-menu" style="display: flex; gap: 15px; align-items: center;">
                <a href="${profilePath}"><i class="fa-solid fa-user"></i> Hi, ${user.first_name}</a>
                <a href="javascript:void(0)" onclick="logout()" style="color: var(--danger); font-size: 0.9rem;">
                    <i class="fa-solid fa-right-from-bracket"></i> Logout
                </a>
            </div>
        `;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Redirect logic based on current path
    const isSubpage = window.location.pathname.includes('/pages/');
    window.location.href = isSubpage ? 'login.html' : 'pages/login.html';
}

document.addEventListener('DOMContentLoaded', updateHeaderAuth);
