// Shared enhancements for the public profile pages.
// Every public page using this script receives the same floating contact link.
if (!document.querySelector('.floating-text-me')) {
  const contactButton = document.createElement('a');
  contactButton.className = 'floating-text-me';
  contactButton.href = 'contact.html#send-message';
  contactButton.setAttribute('aria-label', 'Text me: open the email message form');
  contactButton.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9H13a8.5 8.5 0 0 1 8 8v.5Z"/><path d="M8 10h8m-8 4h5"/></svg><span>Text me</span>';
  document.body.append(contactButton);
}
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
