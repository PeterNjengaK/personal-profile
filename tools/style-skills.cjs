const fs = require('node:fs');
const renderer = `function renderSkills(skills) {
  const container = document.querySelector('[data-dynamic-skills]');
  if (!container) return;
  container.classList.add('capability-grid');
  const headings = {
    'Web': 'Web development', 'Backend': 'Backend engineering', 'Databases': 'Data & storage',
    'Android': 'Android development', 'Desktop': 'Desktop applications', 'Design': 'Graphic design',
    'Video': 'Video editing', 'Streaming': 'Live streaming', 'Music production': 'Music production'
  };
  container.replaceChildren(...skills.map((skill, index) => {
    const card = document.createElement('article');
    card.className = 'capability-card';
    const raw = String(skill.name || '');
    const separator = raw.indexOf(':');
    const key = separator >= 0 ? raw.slice(0, separator) : raw;
    const title = headings[key] || key;
    const tools = separator >= 0 ? raw.slice(separator + 1).trim() : '';
    const creative = /Design|Video|Streaming|Music/i.test(key);
    const systems = /planning|ICT|authentication/i.test(key);
    card.dataset.kind = creative ? 'creative' : systems ? 'systems' : 'development';
    const header = document.createElement('div');
    header.className = 'capability-header';
    const icon = document.createElement('span');
    icon.className = 'capability-icon';
    const paths = creative ? '<path d="m16 3 5 5-11 11-7 2 2-7L16 3ZM13 6l5 5M5 14l5 5"/>' : systems ? '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M9 3v4m6-4v4M8 12h8m-8 4h5"/>' : '<path d="m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16"/>';
    icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';
    const number = document.createElement('span');
    number.className = 'capability-number';
    number.textContent = String(index + 1).padStart(2, '0');
    header.append(icon, number);
    const label = document.createElement('p');
    label.className = 'capability-label';
    label.textContent = creative ? 'Creative studio' : systems ? 'Systems & delivery' : 'Software development';
    const heading = document.createElement('h3');
    heading.textContent = title;
    card.append(header, label, heading);
    if (tools) {
      const list = document.createElement('ul');
      list.className = 'capability-tags';
      tools.split(/,| & /).map(tool => tool.trim()).filter(Boolean).forEach(tool => {
        const tag = document.createElement('li');
        tag.textContent = tool;
        list.append(tag);
      });
      card.append(list);
    }
    return card;
  }));
}

`;
let js = fs.readFileSync('dynamic-profile.js','utf8');
js = js.slice(0,js.indexOf('function renderSkills(')) + renderer + js.slice(js.indexOf('function renderFacts('));
fs.writeFileSync('dynamic-profile.js',js);
let about = fs.readFileSync('about.html','utf8');
about = about.replace('profile.css?v=studio-2','profile.css?v=skills-cards-1').replace('dynamic-profile.js?v=studio-2','dynamic-profile.js?v=skills-cards-1');
fs.writeFileSync('about.html',about);
