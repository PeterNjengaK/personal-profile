const loginForm = document.querySelector('#login-form');
const profileForm = document.querySelector('#profile-form');
const loginStatus = document.querySelector('#login-status');
const saveStatus = document.querySelector('#save-status');

function fillForm(profile) {
  for (const field of ['name', 'headline', 'aboutIntro', 'bio', 'email', 'phone', 'location', 'website', 'birthday', 'age', 'degree', 'freelance', 'aboutPageSubtitle', 'contactPageSubtitle', 'resumeProfile']) {
    profileForm.elements[field].value = profile[field] || '';
  }
  profileForm.elements.content.value = JSON.stringify({
    services: profile.services || [], projects: profile.projects || [], skills: profile.skills || [],
    education: profile.education || [], experience: profile.experience || [], facts: profile.facts || [], social: profile.social || {}
  }, null, 2);
}

async function loadProfile() {
  const response = await fetch('../api/profile');
  if (!response.ok) throw new Error('Could not load profile.');
  fillForm(await response.json());
  loginForm.classList.add('hidden');
  profileForm.classList.remove('hidden');
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginStatus.textContent = 'Signing in...';
  const response = await fetch('../api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: document.querySelector('#password').value }) });
  if (!response.ok) { loginStatus.textContent = 'Invalid password.'; return; }
  await loadProfile();
});

profileForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  saveStatus.textContent = 'Saving...';
  let extra;
  try { extra = JSON.parse(profileForm.elements.content.value); } catch { saveStatus.textContent = 'The advanced JSON is not valid.'; return; }
  const data = Object.fromEntries(new FormData(profileForm));
  delete data.content;
  Object.assign(data, extra);
  const response = await fetch('../api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  saveStatus.textContent = response.ok ? 'Saved. Your public profile now uses the new data.' : 'Could not save changes.';
});

