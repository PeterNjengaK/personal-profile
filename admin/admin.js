const loginForm = document.querySelector('#login-form');
const profileForm = document.querySelector('#profile-form');
const authPanel = document.querySelector('#auth-panel');
const dashboard = document.querySelector('#dashboard');
const loginStatus = document.querySelector('#login-status');
const saveStatus = document.querySelector('#save-status');
const rawContent = document.querySelector('#raw-content');
const publishButton = document.querySelector('#publish-button');
let profileDocument = {};
let activeTab = 'identity';
let dirty = false;
let revision = 0;
let publishing = false;
const originalItems = new WeakMap();

const scalarFields = [
  ['name', 'Full name', 'text'], ['email', 'Email address', 'email'], ['headline', 'Professional headline', 'textarea'],
  ['aboutIntro', 'About introduction', 'textarea'], ['bio', 'Short bio', 'textarea'], ['resumeProfile', 'Resume summary', 'textarea'],
  ['phone', 'Phone number', 'tel'], ['location', 'Location', 'text'], ['website', 'Website', 'url'],
  ['birthday', 'Birthday', 'text'], ['age', 'Age', 'text'], ['degree', 'Highest degree', 'text'], ['freelance', 'Freelance availability', 'text']
];
const pageFields = {
  homeEyebrow: 'Home introduction label', homeExpertiseTitle: 'Home expertise title', homeWorkTitle: 'Home portfolio title', homeContactTitle: 'Home contact invitation',
  aboutAcademicIntro: 'About academic intro', skillsTitle: 'Skills title', skillsSubtitle: 'Skills subtitle',
  factsTitle: 'Facts title', factsSubtitle: 'Facts subtitle', testimonialsTitle: 'Testimonials title',
  testimonialsSubtitle: 'Testimonials subtitle', portfolioTitle: 'Portfolio title', portfolioSubtitle: 'Portfolio subtitle',
  resumeTitle: 'Resume title', resumeSubtitle: 'Resume subtitle', servicesTitle: 'Services title',
  servicesSubtitle: 'Services subtitle', professionalProfileTitle: 'Professional profile title', educationTitle: 'Education title',
  experienceTitle: 'Experience title', contactTitle: 'Contact title'
};
const pageDefaults = { homeEyebrow: 'TECHNOLOGY. CREATIVITY. PURPOSE.', homeExpertiseTitle: 'A practical mind. A creative perspective.', homeWorkTitle: 'Selected work', homeContactTitle: "Let's build something meaningful." };
const collections = {
  services: { title: 'Services', singular: 'Service', fields: [['title', 'Title'], ['description', 'Description', true], ['icon', 'Icon (project, code, creative, or a symbol)']] },
  projects: { title: 'Portfolio projects', singular: 'Project', fields: [['title', 'Title'], ['category', 'Category (android, design, or web)'], ['description', 'Description', true], ['image', 'Image path or URL']] },
  skills: { title: 'Skills', singular: 'Skill', fields: [['name', 'Skill name'], ['level', 'Level (0-100)']] },
  education: { title: 'Education', singular: 'Qualification', fields: [['title', 'Qualification'], ['date', 'Dates'], ['organization', 'Institution'], ['description', 'Description', true]] },
  experience: { title: 'Experience', singular: 'Role', fields: [['title', 'Role'], ['date', 'Dates'], ['organization', 'Organization'], ['items', 'Responsibilities (one per line)', true]] },
  facts: { title: 'Professional facts', singular: 'Fact', fields: [['number', 'Number'], ['label', 'Label']] },
  testimonials: { title: 'Testimonials', singular: 'Testimonial', fields: [['name', 'Client name'], ['role', 'Role or organization'], ['quote', 'Quote', true], ['image', 'Image path or URL']] }
};

function status(element, message, error = false) {
  element.textContent = message;
  element.classList.toggle('error', error);
}
function markDirty() {
  dirty = true;
  revision += 1;
  status(saveStatus, 'Unsaved changes. Publish when you are ready.');
  updateSummary();
}
function updateSummary() {
  document.querySelector('#editor-name').textContent = profileForm.querySelector('[data-panel="identity"] [data-key="name"]')?.value || 'Your profile';
  for (const [key, id] of [['projects', 'project-count'], ['services', 'service-count'], ['skills', 'skill-count']]) {
    document.getElementById(id).textContent = document.querySelector(`[data-collection="${key}"] .collection-list`)?.children.length || 0;
  }
}
function field(label, key, value = '', type = 'text') {
  const wrapper = document.createElement('label');
  wrapper.textContent = label;
  const control = document.createElement(type === 'textarea' ? 'textarea' : 'input');
  control.dataset.key = key;
  control.value = value ?? '';
  if (type !== 'textarea') control.type = type;
  wrapper.append(control);
  return wrapper;
}
function renderFields(container, fields, values) {
  container.replaceChildren(...fields.map(([key, label, type]) => field(label, key, values[key], type || 'text')));
}
function renumber(list, config) {
  [...list.children].forEach((card, index) => {
    card.querySelector('strong').textContent = `${config.singular} ${index + 1}`;
    card.querySelector('[data-move="up"]').disabled = index === 0;
    card.querySelector('[data-move="down"]').disabled = index === list.children.length - 1;
  });
}
function renderCollection(key, config, values) {
  const section = document.createElement('section');
  section.className = 'collection'; section.dataset.collection = key;
  const header = document.createElement('div'); header.className = 'collection-header';
  const title = document.createElement('h3'); title.textContent = config.title;
  const add = document.createElement('button');
  add.type = 'button'; add.className = 'add-button'; add.textContent = `+ Add ${config.singular.toLowerCase()}`;
  header.append(title, add);
  const list = document.createElement('div'); list.className = 'collection-list';
  section.append(header, list);
  const addItem = (item = {}) => {
    const card = document.createElement('article'); card.className = 'collection-item';
    originalItems.set(card, item);
    const top = document.createElement('div'); top.className = 'collection-item-top';
    const label = document.createElement('strong');
    const actions = document.createElement('div'); actions.className = 'item-actions';
    for (const direction of ['up', 'down']) {
      const move = document.createElement('button');
      move.type = 'button'; move.className = 'mini-button'; move.dataset.move = direction;
      move.textContent = direction === 'up' ? '\u2191' : '\u2193';
      move.setAttribute('aria-label', `Move ${config.singular.toLowerCase()} ${direction}`);
      move.addEventListener('click', () => {
        if (direction === 'up' && card.previousElementSibling) list.insertBefore(card, card.previousElementSibling);
        if (direction === 'down' && card.nextElementSibling) list.insertBefore(card.nextElementSibling, card);
        renumber(list, config); markDirty();
      });
      actions.append(move);
    }
    const remove = document.createElement('button');
    remove.type = 'button'; remove.className = 'delete-button'; remove.textContent = 'Remove';
    remove.addEventListener('click', () => { card.remove(); renumber(list, config); markDirty(); add.focus(); });
    actions.append(remove); top.append(label, actions);
    const grid = document.createElement('div'); grid.className = 'field-grid';
    config.fields.forEach(([fieldKey, fieldLabel, multiline]) => {
      const value = fieldKey === 'items' && Array.isArray(item[fieldKey]) ? item[fieldKey].join('\n') : item[fieldKey];
      const control = field(fieldLabel, fieldKey, value, multiline ? 'textarea' : fieldKey === 'level' ? 'number' : 'text');
      if (fieldKey === 'level') Object.assign(control.querySelector('input'), { min: '0', max: '100' });
      if (multiline) control.classList.add('wide');
      grid.append(control);
    });
    card.append(top, grid); list.append(card); renumber(list, config);
    return card;
  };
  values.forEach(addItem);
  add.addEventListener('click', () => { const card = addItem(); markDirty(); card.querySelector('input, textarea')?.focus(); });
  return section;
}
function fillForm(profile) {
  profileDocument = structuredClone(profile);
  renderFields(profileForm.querySelector('[data-panel="identity"] .field-grid'), scalarFields, profile);
  for (const key of ['name', 'email', 'headline']) profileForm.querySelector(`[data-panel="identity"] [data-key="${key}"]`).required = true;
  renderFields(document.querySelector('#page-copy-fields'), Object.entries(pageFields).map(([key, label]) => [key, label]), { ...pageDefaults, ...profile.pageCopy });
  for (const [key, label] of [['aboutPageSubtitle', 'About page description'], ['contactPageSubtitle', 'Contact page description']]) {
    document.querySelector('#page-copy-fields').append(field(label, key, profile[key] || ''));
  }
  document.querySelector('#collection-editors').replaceChildren(...Object.entries(collections).map(([key, config]) => renderCollection(key, config, profile[key] || [])));
  renderFields(document.querySelector('#link-fields'), [['facebook', 'Facebook URL', 'url'], ['instagram', 'Instagram URL', 'url'], ['linkedin', 'LinkedIn URL', 'url'], ['github', 'GitHub URL', 'url'], ['footerText', 'Footer text']], { ...profile.social, footerText: profile.footerText });
  rawContent.value = JSON.stringify(profile, null, 2);
  updateSummary();
}
function collectFields(container) {
  return Object.fromEntries([...container.querySelectorAll('[data-key]')].map((control) => [control.dataset.key, control.value]));
}
function collectVisual() {
  const data = { ...profileDocument, ...collectFields(profileForm.querySelector('[data-panel="identity"]')) };
  const copy = collectFields(document.querySelector('#page-copy-fields'));
  for (const key of ['aboutPageSubtitle', 'contactPageSubtitle']) { data[key] = copy[key]; delete copy[key]; }
  data.pageCopy = { ...data.pageCopy, ...copy };
  const links = collectFields(document.querySelector('#link-fields'));
  data.footerText = links.footerText; delete links.footerText; data.social = { ...data.social, ...links };
  for (const key of Object.keys(collections)) {
    data[key] = [...document.querySelector(`[data-collection="${key}"] .collection-list`).children].map((card) => {
      const item = { ...originalItems.get(card), ...collectFields(card) };
      if (key === 'experience') item.items = item.items.split('\n').map((line) => line.trim()).filter(Boolean);
      if (key === 'skills') item.level = Number(item.level) || 0;
      return item;
    });
  }
  return data;
}
function parseAdvanced() {
  let data;
  try { data = JSON.parse(rawContent.value); } catch { throw new Error('Check the JSON formatting in Advanced before continuing.'); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('The profile must be a JSON object.');
  for (const [key] of scalarFields) {
    if (data[key] !== undefined && !['string', 'number'].includes(typeof data[key])) throw new Error(`${key} must be text or a number.`);
  }
  for (const key of ['name', 'email', 'headline']) if (typeof data[key] !== 'string' || !data[key].trim()) throw new Error(`Add a valid ${key} in Advanced.`);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) throw new Error('Add a valid email address in Advanced.');
  for (const key of ['pageCopy', 'social']) {
    if (data[key] !== undefined && (!data[key] || typeof data[key] !== 'object' || Array.isArray(data[key]))) throw new Error(`${key} must be a JSON object.`);
  }
  for (const key of Object.keys(collections)) {
    if (data[key] !== undefined && (!Array.isArray(data[key]) || data[key].some(item => !item || typeof item !== 'object' || Array.isArray(item)))) throw new Error(`${key} must be a list of objects.`);
  }
  if (data.experience?.some(item => item.items !== undefined && !Array.isArray(item.items))) throw new Error('Experience responsibilities must be a list.');
  return data;
}
function activateTab(key) {
  if (key === activeTab) return true;
  try {
    if (activeTab === 'advanced') fillForm(parseAdvanced());
    if (key === 'advanced') rawContent.value = JSON.stringify(collectVisual(), null, 2);
  } catch (error) { status(saveStatus, error.message, true); rawContent.focus(); return false; }
  activeTab = key;
  document.querySelectorAll('.tab').forEach((tab) => {
    const selected = tab.dataset.tab === key;
    tab.classList.toggle('active', selected); tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1;
  });
  document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.toggle('active', panel.dataset.panel === key));
  return true;
}
document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => activateTab(tab.dataset.tab)));
const tabs = [...document.querySelectorAll('.tab')];
document.querySelector('.tabs').addEventListener('keydown', (event) => {
  const index = tabs.indexOf(document.activeElement);
  if (index < 0) return;
  const targets = { ArrowDown: (index + 1) % tabs.length, ArrowRight: (index + 1) % tabs.length, ArrowUp: (index + tabs.length - 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 };
  if (targets[event.key] === undefined) return;
  event.preventDefault(); const next = tabs[targets[event.key]];
  if (activateTab(next.dataset.tab)) next.focus();
});
const mobileTabs = matchMedia('(max-width: 760px)');
function tabOrientation() { document.querySelector('.tabs').setAttribute('aria-orientation', mobileTabs.matches ? 'horizontal' : 'vertical'); }
mobileTabs.addEventListener('change', tabOrientation); tabOrientation();
profileForm.addEventListener('input', markDirty);
window.addEventListener('beforeunload', (event) => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });

async function loadProfile() {
  const response = await fetch('../api/profile', { credentials: 'same-origin' });
  if (!response.ok) throw new Error(response.status === 429 ? 'The server is busy. Please try again shortly.' : 'Could not load your profile. Please try again.');
  fillForm(await response.json());
  dirty = false;
  authPanel.classList.add('hidden'); dashboard.classList.remove('hidden');
  status(saveStatus, "You're up to date.");
}
document.querySelector('#password-toggle').addEventListener('click', (event) => {
  const input = document.querySelector('#password'); const show = input.type === 'password';
  input.type = show ? 'text' : 'password'; event.target.textContent = show ? 'Hide' : 'Show'; event.target.setAttribute('aria-pressed', String(show));
});
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault(); const button = loginForm.querySelector('[type="submit"]'); button.disabled = true;
  status(loginStatus, 'Opening your studio...');
  try {
    const response = await fetch('../api/auth/login', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: document.querySelector('#password').value }) });
    if (!response.ok) throw new Error(response.status === 429 ? 'Too many attempts. Wait a minute and try again.' : 'That password did not match. Please try again.');
    await loadProfile(); loginForm.reset(); tabs[0].focus();
  } catch (error) { status(loginStatus, error.message || 'Could not connect to the server.', true); }
  finally { button.disabled = false; }
});
profileForm.addEventListener('submit', async (event) => {
  event.preventDefault(); if (publishing) return;
  let data;
  try {
    data = activeTab === 'advanced' ? parseAdvanced() : collectVisual();
    if (activeTab !== 'advanced') {
      const invalid = [...profileForm.querySelectorAll('input, textarea')].find(control => !control.checkValidity());
      if (invalid) { activateTab(invalid.closest('.tab-panel').dataset.panel); invalid.reportValidity(); return; }
    }
  } catch (error) { status(saveStatus, error.message, true); return; }
  publishing = true; publishButton.disabled = true; const savedRevision = revision;
  status(saveStatus, 'Publishing your changes...');
  try {
    const response = await fetch('../api/profile', { method: 'PUT', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!response.ok) throw new Error(response.status === 401 ? 'Your session expired. Sign out and sign in again; copy any unsaved work first.' : 'Could not publish. Your edits are still here; please try again.');
    profileDocument = structuredClone(data);
    if (revision === savedRevision) {
      fillForm(data); dirty = false;
      status(saveStatus, 'Published. Your website is up to date.');
    } else { status(saveStatus, 'Published. You have newer edits still to save.'); }
  } catch (error) { status(saveStatus, error.message || 'Connection lost. Your edits are still here.', true); }
  finally { publishing = false; publishButton.disabled = false; }
});
document.querySelector('#logout-button').addEventListener('click', async () => {
  if (publishing) return;
  if (dirty && !window.confirm('Sign out and discard your unsaved changes?')) return;
  try {
    const response = await fetch('../api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    if (!response.ok) throw new Error('Could not sign out. Please try again.');
    dirty = false; location.reload();
  } catch (error) { status(saveStatus, error.message, true); }
});
