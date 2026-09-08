async function loadDynamicProfile() {
  try {
    const response = await fetch('/api/profile');
    if (!response.ok) return;
    const profile = await response.json();
    document.querySelectorAll('[data-profile]').forEach((element) => {
      const key = element.dataset.profile;
      if (profile[key] !== undefined) element.textContent = profile[key];
    });
    document.querySelectorAll('[data-profile-path]').forEach((element) => {
      const value = element.dataset.profilePath.split('.').reduce((result, key) => result?.[key], profile);
      if (value !== undefined) element.textContent = value;
    });
    document.querySelectorAll('[data-profile-href]').forEach((element) => {
      const key = element.dataset.profileHref;
      if (profile[key]) element.href = profile[key];
    });
    document.querySelectorAll('[data-profile-email]').forEach((element) => {
      element.textContent = profile.email || '';
      element.href = `mailto:${profile.email || ''}`;
    });
    document.querySelectorAll('[data-profile-phone]').forEach((element) => {
      element.textContent = profile.phone || '';
      element.href = `tel:${String(profile.phone || '').replace(/[^+\d]/g, '')}`;
    });
    document.querySelectorAll('.social-icons a[title]').forEach((element) => {
      const key = element.title.toLowerCase();
      element.href = profile.social?.[key] || '#';
    });
    renderServices(profile.services || []);
    renderProjects(profile.projects || []);
    renderSkills(profile.skills || []);
    renderFacts(profile.facts || []);
    renderEducation(profile.education || []);
    renderExperience(profile.experience || []);
    renderTestimonials(profile.testimonials || []);
  } catch {
    // Static content remains visible when the API is unavailable.
  }
}

function renderTestimonials(testimonials) {
  const container = document.querySelector('[data-dynamic-testimonials]');
  if (!container) return;
  container.replaceChildren(...testimonials.map((testimonial) => {
    const card = document.createElement('div');
    card.className = 'testimonial';
    const image = document.createElement('img');
    image.className = 'testimonial-img'; image.src = testimonial.image || ''; image.alt = testimonial.name || 'Client testimonial';
    const quote = document.createElement('p');
    quote.className = 'testimonial-text'; quote.textContent = `" ${testimonial.quote} "`;
    const author = document.createElement('div');
    author.className = 'testimonial-author'; author.textContent = testimonial.name;
    const role = document.createElement('div');
    role.className = 'testimonial-role'; role.textContent = testimonial.role;
    image.loading = 'lazy';
    if (testimonial.image) card.append(image);
    card.append(quote, author, role);
    return card;
  }));
}

function renderSkills(skills) {
  const container = document.querySelector('[data-dynamic-skills]');
  if (!container) return;
  const columns = [document.createElement('div'), document.createElement('div')];
  skills.forEach((skill, index) => {
    const item = document.createElement('div');
    item.className = 'skill-item';
    const name = document.createElement('div');
    name.className = 'skill-name';
    const label = document.createElement('span');
    label.textContent = skill.name;
    const level = document.createElement('span');
    level.textContent = `${skill.level}%`;
    name.append(label, level);
    const bar = document.createElement('div');
    bar.className = 'skill-bar';
    const progress = document.createElement('div');
    progress.className = 'skill-progress';
    progress.style.width = `${Math.max(0, Math.min(100, Number(skill.level) || 0))}%`;
    bar.append(progress);
    item.append(name, bar);
    columns[index < Math.ceil(skills.length / 2) ? 0 : 1].append(item);
  });
  container.replaceChildren(...columns);
}

function renderFacts(facts) {
  const container = document.querySelector('[data-dynamic-facts]');
  if (!container) return;
  container.replaceChildren(...facts.map((fact) => {
    const box = document.createElement('div');
    box.className = 'fact-box fade-in';
    const number = document.createElement('div');
    number.className = 'fact-number';
    number.textContent = fact.number;
    const label = document.createElement('div');
    label.className = 'fact-text';
    label.textContent = fact.label;
    box.append(number, label);
    return box;
  }));
}

function renderEducation(education) {
  const container = document.querySelector('[data-dynamic-education]');
  if (!container) return;
  container.replaceChildren(...education.map((item) => renderResumeItem(item)));
}

function renderExperience(experience) {
  const container = document.querySelector('[data-dynamic-experience]');
  if (!container) return;
  container.replaceChildren(...experience.map((item) => renderResumeItem(item)));
}

function renderResumeItem(item) {
  const element = document.createElement('div');
  element.className = 'resume-item';
  const title = document.createElement('h4');
  title.textContent = item.title;
  const date = document.createElement('div');
  date.className = 'date';
  date.textContent = item.date || '';
  const organization = document.createElement('h5');
  organization.textContent = item.organization || '';
  element.append(title, date, organization);
  if (item.description) {
    const description = document.createElement('p');
    description.textContent = item.description;
    element.append(description);
  }
  if (Array.isArray(item.items)) {
    const list = document.createElement('ul');
    item.items.forEach((text) => {
      const entry = document.createElement('li');
      entry.textContent = text;
      list.append(entry);
    });
    element.append(list);
  }
  return element;
}

function renderServices(services) {
  const container = document.querySelector('[data-dynamic-services]');
  if (!container) return;
  container.replaceChildren(...services.map((service) => {
    const card = document.createElement('div');
    card.className = 'services-card fade-in';
    const icon = document.createElement('div');
    icon.className = 'service-icon';
    const symbols = {
      project: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M9 3v4m6-4v4M8 12h8m-8 4h5"/>',
      code: '<path d="m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16"/>',
      creative: '<path d="m16 3 5 5-11 11-7 2 2-7L16 3ZM13 6l5 5M5 14l5 5"/>'
    };
    if (symbols[service.icon]) {
      icon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${symbols[service.icon]}</svg>`;
    } else {
      icon.textContent = service.icon || '\u2727';
    }
    const title = document.createElement('h3');
    title.textContent = service.title;
    const description = document.createElement('p');
    description.textContent = service.description;
    card.append(icon, title, description);
    return card;
  }));
}

function renderProjects(projects) {
  const container = document.querySelector('[data-dynamic-projects]');
  if (!container) return;
  const visibleProjects = document.body.classList.contains('home-page') ? projects.slice(0, 3) : projects;
  container.replaceChildren(...visibleProjects.map((project) => {
    const item = document.createElement('div');
    item.className = 'portfolio-item fade-in';
    item.dataset.category = project.category;
    const image = document.createElement('img');
    image.className = 'portfolio-img';
    image.src = project.image;
    image.alt = project.title;
    image.loading = 'lazy';
    const overlay = document.createElement('div');
    overlay.className = 'portfolio-overlay';
    const category = document.createElement('span');
    category.className = `portfolio-category ${project.category}`;
    category.textContent = project.category;
    const title = document.createElement('h3');
    title.textContent = project.title;
    const description = document.createElement('p');
    description.textContent = project.description;
    overlay.append(category, title, description);
    item.append(image, overlay);
    return item;
  }));
  document.querySelector('.filter-btn.active')?.click();
}

loadDynamicProfile();
