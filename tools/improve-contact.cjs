const fs=require('node:fs');
let html=fs.readFileSync('contact.html','utf8');
html=html.replace(/(<p[^>]*data-profile="contactPageSubtitle"[^>]*>)[\s\S]*?(<\/p>)/, '$1Available for software projects, ICT consulting, and creative collaborations. Tell me what you would like to build.$2');
html=html.replace('</form>', '</form><p id="form-status" class="form-status" role="status" aria-live="polite"></p><p class="email-fallback">Prefer your email app? <a href="mailto:peter.njengakihoro@gmail.com">Email Peter directly</a>.</p>');
const start=html.indexOf('    // Form submission handling');
const end=html.indexOf('    // Animation for contact sections',start);
html=html.slice(0,start)+`    // Report acceptance by the form service without claiming inbox delivery.
    document.getElementById('contactForm').addEventListener('submit', async function(event) {
      event.preventDefault();
      const form = event.target;
      const button = form.querySelector('button[type="submit"]');
      const status = document.getElementById('form-status');
      button.disabled = true;
      button.textContent = 'Sending…';
      status.textContent = 'Submitting your message…';
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }, signal: controller.signal });
        if (!response.ok) throw new Error('Message submission failed');
        status.textContent = 'Your message was accepted by the contact service. Thank you for getting in touch.';
        form.reset();
      } catch {
        status.textContent = 'Your message could not be submitted. Your text is still here; please retry or use the direct email link below.';
      } finally {
        clearTimeout(timer);
        button.disabled = false;
        button.textContent = 'Send Message';
      }
    });

`+html.slice(end);
fs.writeFileSync('contact.html',html);
let home=fs.readFileSync('index.html','utf8');
home=home.replace(/(<h2[^>]*data-profile-path="pageCopy.homeContactTitle"[^>]*>)[\s\S]*?(<\/h2>)/,'$1Have a project in mind? Let’s build it together.$2');
fs.writeFileSync('index.html',home);
const files=['index.html','about.html','resume.html','services.html','portfolio.html','contact.html',...fs.readdirSync('.').filter(f=>f.startsWith('case-study-')&&f.endsWith('.html'))];
for(const f of files){let s=fs.readFileSync(f,'utf8').replace(/profile\.css\?v=[^"']+/,'profile.css?v=case-studies-1').replace(/dynamic-profile\.js\?v=[^"']+/,'dynamic-profile.js?v=case-studies-1');fs.writeFileSync(f,s)}
