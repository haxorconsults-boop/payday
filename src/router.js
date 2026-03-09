// Payday — SPA Hash Router
const routes = {};
let currentRoute = null;

export function registerRoute(path, handler) {
  routes[path] = handler;
}

export function navigate(path) {
  window.location.hash = path;
}

export function getCurrentRoute() {
  return currentRoute;
}

function resolveRoute() {
  const hash = window.location.hash.slice(1) || '/';
  currentRoute = hash;

  // Find matching route (exact or pattern)
  let handler = routes[hash];
  if (!handler) {
    // Try prefix matching for admin/employer sub-routes
    const keys = Object.keys(routes).sort((a, b) => b.length - a.length);
    for (const key of keys) {
      if (hash.startsWith(key)) {
        handler = routes[key];
        break;
      }
    }
  }

  const app = document.getElementById('app');
  if (handler) {
    app.innerHTML = '';
    const content = handler(hash);
    if (typeof content === 'string') {
      app.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      app.appendChild(content);
    }
    // Run any post-render hooks
    window.dispatchEvent(new CustomEvent('route-rendered', { detail: { path: hash } }));
  } else {
    app.innerHTML = `
      <div class="page flex items-center justify-center">
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h2>Page Not Found</h2>
          <p class="text-muted mt-sm">The page you're looking for doesn't exist.</p>
          <a href="#/" class="btn btn-primary mt-lg">Go Home</a>
        </div>
      </div>
    `;
  }
  // Scroll to top on navigation
  window.scrollTo(0, 0);
}

export function initRouter() {
  window.addEventListener('hashchange', resolveRoute);
  resolveRoute();
}
