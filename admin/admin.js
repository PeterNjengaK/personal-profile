const loginForm = document.querySelector('#login-form');
const profileForm = document.querySelector('#profile-form');
const loginStatus = document.querySelector('#login-status');
const saveStatus = document.querySelector('#save-status');

const rawContent = document.querySelector('#raw-content');

const scalarFields = [
  ['name', 'Name', 'input'], ['email', 'Email', 'email'], ['headline', 'Headline', 'textarea'],
  ['aboutIntro', 'About intro', 'textarea'], ['bio', 'Bio', 'textarea'], ['resumeProfile', 'Resume profile', 'textarea'],
  ['phone', 'Phone', 'input'], ['location', 'Location', 'input'], ['website', 'Website', 'url'],
  ['birthday', 'Birthday', 'input'], ['age', 'Age', 'input'], ['degree', 'Degree', 'input'], ['freelance', 'Freelance status', 'input']
];
const pageFields = {
  aboutAcademicIntro: 'About academic intro', skillsTitle: 'Skills title', skillsSubtitle: 'Skills subtitle',
  factsTitle: 'Facts title', factsSubtitle: 'Facts subtitle', testimonialsTitle: 'Testimonials title',
  testimonialsSubtitle: 'Testimonials subtitle', portfolioTitle: 'Portfolio title', portfolioSubtitle: 'Portfolio subtitle',
  resumeTitle: 'Resume title', resumeSubtitle: 'Resume subtitle', servicesTitle: 'Services title',
  servicesSubtitle: 'Services subtitle', professionalProfileTitle: 'Professional profile title', educationTitle: 'Education title',
  experienceTitle: 'Experience title', contactTitle: 'Contact title'
};
const collections = {
  services: { title: 'Services', fields: [['title', 'Title'], ['description', 'Description', true], ['icon', 'Icon']] },
  projects: { title: 'Portfolio projects', fields: [['title', 'Title'], ['category', 'Category'], ['description', 'Description', true], ['image', 'Image path or URL']] },
  skills: { title: 'Skills', fields: [['name', 'Skill name'], ['level', 'Level (0-100)']] },
  education: { title: 'Education', fields: [['title', 'Qualification'], ['date', 'Dates'], ['organization', 'Institution'], ['description', 'Description', true]] },
  experience: { title: 'Experience', fields: [['title', 'Role'], ['date', 'Dates'], ['organization', 'Organization'], ['items', 'Responsibilities (one per line)', true]] },
  facts: { title: 'Professional facts', fields: [['number', 'Number'], ['label', 'Label']] },
  testimonials: { title: 'Testimonials', fields: [['name', 'Client name'], ['role', 'Role or organization'], ['quote', 'Quote', true], ['image', 'Image path or URL']] }
};

function field(label, key, value = '', type = 'input', extra = {}) {
  const wrapper = document.createElement('label');
  wrapper.textContent = label;
  const control = document.createElement(type === 'textarea' ? 'textarea' : 'input');
  control.dataset.key = key;
  control.value = value ?? '';
  if (type !== 'textarea') control.type = type;
  Object.assign(control, extra);
  wrapper.append(control);
  return wrapper;
}

function renderFields(container, fields, values, prefix = '') {
  container.replaceChildren(...fields.map(([key, label, typeHint]) => field(label, `${prefix}${key}`, values[key], typeHint === 'textarea' ? 'textarea' : (typeHint === 'email' || typeHint === 'url' ? typeHint : 'input'))));
}

function renderCollection(key, config, values) {
  const section = document.createElement('section');
  section.className = 'collection';
  section.dataset.collection = key;
  const header = document.createElement('div');
  header.className = 'collection-header';
  const title = document.createElement('h3');
  title.textContent = config.title;
  const add = document.createElement('button');
  add.type = 'button'; add.className = 'add-button'; add.textContent = `Add ${config.title.toLowerCase().replace(/s$/, '')}`;
  header.append(title, add);
  const list = document.createElement('div');
  list.className = 'collection-list';
  section.append(header, list);
  const addItem = (item = {}) => {
    const card = document.createElement('article');
    card.className = 'collection-item';
    const top = document.createElement('div');
    top.className = 'collection-item-top';
    const label = document.createElement('strong');
    label.textContent = `${config.title.slice(0, -1)} ${list.children.length + 1}`;
    const remove = document.createElement('button');
    remove.type = 'button'; remove.className = 'delete-button'; remove.textContent = 'Remove';
    remove.addEventListener('click', () => { card.remove(); renumber(list, config.title); });
    top.append(label, remove);
    const grid = document.createElement('div');
    grid.className = 'field-grid';
    config.fields.forEach(([fieldKey, fieldLabel, multiline]) => {
      const value = fieldKey === 'items' && Array.isArray(item[fieldKey]) ? item[fieldKey].join('\n') : item[fieldKey];
      const control = field(fieldLabel, fieldKey, value, multiline ? 'textarea' : 'input');
      if (multiline || fieldKey === 'description' || fieldKey === 'quote') control.classList.add('wide');
      grid.append(control);
    });
    card.append(top, grid); list.append(card);
  };
  values.forEach(addItem);
  add.addEventListener('click', () => addItem());
  return section;
}

function renumber(list, title) { [...list.children].forEach((card, index) => { card.querySelector('strong').textContent = `${title.slice(0, -1)} ${index + 1}`; }); }

function fillForm(profile) {
  renderFields(profileForm.querySelector('[data-panel="identity"] .field-grid'), scalarFields, profile);
  renderFields(document.querySelector('#page-copy-fields'), Object.entries(pageFields).map(([key, label]) => [key, label]), profile.pageCopy || {});
  const collectionEditors = document.querySelector('#collection-editors');
  collectionEditors.replaceChildren(...Object.entries(collections).map(([key, config]) => renderCollection(key, config, profile[key] || [])));
  renderFields(document.querySelector('#link-fields'), [['facebook', 'Facebook URL'], ['instagram', 'Instagram URL'], ['linkedin', 'LinkedIn URL'], ['github', 'GitHub URL'], ['footerText', 'Footer text']], { ...profile.social, footerText: profile.footerText });
  rawContent.value = JSON.stringify(profile, null, 2);
}

function collectFields(container) {
  return Object.fromEntries([...container.querySelectorAll('[data-key]')].map((control) => [control.dataset.key, control.value]));
}

function collectCollections() {
  return Object.fromEntries(Object.keys(collections).map((key) => {
    const items = [...document.querySelector(`[data-collection="${key}"] .collection-list`).children];
    return [key, items.map((card) => Object.fromEntries([...card.querySelectorAll('[data-key]')].map((control) => [control.dataset.key, control.dataset.key === 'items' ? control.value.split('\n').map((line) => line.trim()).filter(Boolean) : control.value])))];
  }));
}

async function loadProfile() {
  const response = await fetch('../api/profile', { credentials: 'same-origin' });
  if (!response.ok) {
    if (response.status === 429) throw new Error('The server is busy. Wait a minute, then try again.');
    throw new Error(`Could not load profile (${response.status}).`);
  }
  fillForm(await response.json());
  loginForm.classList.add('hidden'); profileForm.classList.remove('hidden');
}

document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => {
  document.querySelectorAll('.tab, .tab-panel').forEach((element) => element.classList.remove('active'));
  tab.classList.add('active'); document.querySelector(`[data-panel="${tab.dataset.tab}"]`).classList.add('active');
}));

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault(); loginStatus.textContent = 'Signing in...'; loginStatus.classList.remove('error');
  try {
    const response = await fetch('../api/auth/login', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: document.querySelector('#password').value }) });
    if (!response.ok) { loginStatus.textContent = response.status === 429 ? 'Too many attempts. Wait a minute and try again.' : 'Invalid password.'; loginStatus.classList.add('error'); return; }
    await loadProfile();
  } catch (error) {
    loginStatus.textContent = error.message || 'Could not connect to the server.';
    loginStatus.classList.add('error');
  }
});

profileForm.addEventListener('submit', async (event) => {
  event.preventDefault(); saveStatus.textContent = 'Publishing...'; saveStatus.classList.remove('error');
  let data;
  try { data = JSON.parse(rawContent.value); } catch { saveStatus.textContent = 'Fix the JSON in Advanced before publishing.'; saveStatus.classList.add('error'); return; }
  Object.assign(data, collectFields(profileForm.querySelector('[data-panel="identity"]')));
  data.pageCopy = collectFields(document.querySelector('#page-copy-fields'));
  const links = collectFields(document.querySelector('#link-fields'));
  data.footerText = links.footerText; delete links.footerText; data.social = links;
  Object.assign(data, collectCollections());
  const response = await fetch('../api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  saveStatus.textContent = response.ok ? 'Published. All public pages now use these changes.' : 'Could not publish changes.';
  if (!response.ok) saveStatus.classList.add('error'); else rawContent.value = JSON.stringify(data, null, 2);
});

