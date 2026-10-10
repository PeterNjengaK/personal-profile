const fs = require('node:fs');
const pages = ['index.html','about.html','resume.html','services.html','portfolio.html','contact.html'];
const button = '<a class="floating-text-me" href="mailto:peter.njengakihoro@gmail.com" aria-label="Text me by email"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9H13a8.5 8.5 0 0 1 8 8v.5Z"/><path d="M8 10h8m-8 4h5"/></svg><span>Text me</span></a>';
for (const file of pages) {
  let html = fs.readFileSync(file,'utf8');
  html = html.replace(/\s*<a class="btn footer-text-me"[^>]*>[\s\S]*?<\/a>/, '');
  html = html.replace('</body>', button+'\n</body>');
  html = html.replace(/profile\.css\?v=[^"']+/, 'profile.css?v=floating-contact-1');
  fs.writeFileSync(file,html);
}
