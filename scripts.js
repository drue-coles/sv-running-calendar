// --- Display last updated date in footer ---
document.addEventListener('DOMContentLoaded', () => {
  const lastUpdated = new Date(document.lastModified);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const span = document.getElementById('last-updated');
  if (span) {
    span.textContent = lastUpdated.toLocaleDateString(undefined, options);
  }

  // --- Generic card toggle behavior (works on all pages) ---
  document.addEventListener('click', e => {
    const header = e.target.closest('.card-header');
    if (!header) return;
    const body = header.nextElementSibling;
    if (!body || !body.classList.contains('card-body')) return;
    body.classList.toggle('hidden');
    const icon = header.querySelector('.toggle-icon');
    if (icon) {
      icon.textContent = body.classList.contains('hidden') ? '▶' : '▼';
    }
  });

  // --- Smooth scrolling for month links with sticky header offset ---
  const scrollToMonth = (targetId) => {
    const heading = document.getElementById(targetId);
    const container = document.getElementById(targetId + '-content');
    if (!heading) return;
    const headerHeight = document.querySelector('header').offsetHeight;
    const targetY = heading.getBoundingClientRect().top + window.scrollY - headerHeight - 10;
    const duration = 500;
    const start = window.scrollY;
    const distance = targetY - start;
    let startTime = null;
    const easeInOutQuad = (t) => t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
    const animateScroll = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const easedProgress = easeInOutQuad(progress);
      window.scrollTo(0, start + distance * easedProgress);
      if (timeElapsed < duration) {
        requestAnimationFrame(animateScroll);
      }
    };
    if (container && !container.innerHTML.trim()) {
      const observer = new MutationObserver((mutations, obs) => {
        if (container.innerHTML.trim()) {
          setTimeout(() => requestAnimationFrame(animateScroll), 20);
          obs.disconnect();
        }
      });
      observer.observe(container, { childList: true, subtree: true });
    } else {
      requestAnimationFrame(animateScroll);
    }
  };

  // Attach click handlers for month navigation
  document.querySelectorAll('.month-nav a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      scrollToMonth(targetId);
    });
  });

  // --- Load monthly race card fragments and scroll to hash when ready ---
  const months = [
    'jan','feb','mar','apr','may','jun',
    'jul','aug','sep','oct','nov','dec'
  ];

  const allFetches = months.map(month => {
    const container = document.getElementById(month + '-content');
    if (container) {
      return fetch(`fragments/${month}.html`)
        .then(resp => resp.text())
        .then(html => { container.innerHTML = html; })
        .catch(err => console.error(`Error loading ${month}.html:`, err));
    }
    return Promise.resolve();
  });

  if (window.location.hash) {
    const hash = window.location.hash.substring(1);
    Promise.all(allFetches).then(() => {
      setTimeout(() => scrollToMonth(hash), 50);
    });
  }
});