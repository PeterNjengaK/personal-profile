// Shared enhancements for the public profile pages.
document.querySelectorAll('#main-nav a').forEach((link) => {
  if (link.classList.contains('active')) link.setAttribute('aria-current', 'page');
});
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  const menu = document.getElementById('main-nav');
  if (!menu?.classList.contains('active')) return;
  menu.classList.remove('active');
  const toggle = document.querySelector('.nav-toggle');
  toggle?.setAttribute('aria-expanded', 'false');
  toggle?.focus();
});
document.querySelectorAll('.filter-btn').forEach((button) => {
  button.setAttribute('aria-pressed', String(button.classList.contains('active')));
  button.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach((filter) => {
      filter.setAttribute('aria-pressed', String(filter === button));
    });
  });
});
document.addEventListener('click', (event) => {
  if (event.target.closest('header')) return;
  document.getElementById('main-nav')?.classList.remove('active');
  document.querySelector('.nav-toggle')?.setAttribute('aria-expanded', 'false');
});
