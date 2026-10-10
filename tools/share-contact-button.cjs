const fs = require('node:fs');
for (const file of ['index.html','about.html','resume.html','services.html','portfolio.html','contact.html']) {
  let html = fs.readFileSync(file,'utf8');
  html = html.replace(/<a class="floating-text-me"[^>]*>[\s\S]*?<\/a>\s*/, '');
  html = html.replace(/profile-ui\.js\?v=[^"']+/, 'profile-ui.js?v=shared-contact-1');
  html = html.replace(/profile\.css\?v=[^"']+/, 'profile.css?v=shared-contact-1');
  fs.writeFileSync(file,html);
}
