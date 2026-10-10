const fs = require('node:fs');
const p = JSON.parse(fs.readFileSync('data/profile.json', 'utf8'));
p.aboutIntro = 'I am Peter Njenga Kihoro, a software developer, project management specialist, and creative professional based in California. I build web, desktop, and Android applications that turn everyday workflows into practical tools for businesses and communities.';
p.bio = 'My work spans hospital workflows, church administration, cleaning marketplaces, retail storefronts, and dealership systems. I bring together application development, database design, ICT support, and project planning, alongside graphic design, video editing, and music production.';
p.aboutPageSubtitle = 'Software development, project planning, ICT support, and creative work.';
p.pageCopy.aboutAcademicIntro = 'I hold a Master of Science in Project Management & Planning and a Bachelor of Business Information Technology, complemented by studies in networking and cyber security. This background helps me connect technical implementation with real operational needs.';
p.pageCopy.skillsSubtitle = 'Tools and capabilities I use across software, systems, and creative projects.';
p.pageCopy.servicesSubtitle = 'Practical websites, applications, business systems, and creative support tailored to your workflow.';
p.services = [
  { title: 'Web Applications & Websites', icon: 'code', description: 'Responsive websites, storefronts, customer portals, and marketplaces using HTML, CSS, JavaScript, React, and Node.js. My projects include Kabo, CleanConnect, and Edwin’s Auto Hub.' },
  { title: 'Business & Community Systems', icon: 'project', description: 'Custom tools for registration, inventory, appointments, reporting, and administration. I build shared workflows, role-based access, and database-backed dashboards, as demonstrated by Carepoint Hospital IMS and VWO Karati.' },
  { title: 'Android & Desktop Applications', icon: 'code', description: 'Android applications with Java and Kotlin, and desktop tools using Python/Tkinter and Electron. Examples include Status Gallery and Church Member Registration, with local file handling, search, and data exports.' },
  { title: 'Database & Backend Development', icon: 'code', description: 'Node.js APIs and SQLite or MongoDB data storage, with authentication, validation, permissions, and reporting. I connect public interfaces and staff dashboards to a shared source of data.' },
  { title: 'Project Planning & Coordination', icon: 'project', description: 'Requirements gathering, scope definition, task planning, documentation, and delivery coordination, informed by my postgraduate training in Project Management & Planning.' },
  { title: 'ICT Support & System Administration', icon: 'project', description: 'Technical troubleshooting, user support, server maintenance, and network configuration, drawing on my experience supporting ICT systems in a hospital environment.' },
  { title: 'Graphic Design & Video Editing', icon: 'creative', description: 'Brand graphics, marketing materials, and edited video content using Photoshop, Premiere Pro, and CapCut. I also support OBS-based streaming and content preparation.' },
  { title: 'Music & Digital Content', icon: 'creative', description: 'Instrumental and theme music production in FL Studio, plus writing and social media content support for individuals, businesses, and community organizations.' }
];
// Present capabilities without inventing proficiency percentages.
p.skills = [
  {name:'Web: HTML, CSS, JavaScript & React'},
  {name:'Backend: Node.js & Express'},
  {name:'Databases: SQLite & MongoDB'},
  {name:'Android: Java & Kotlin'},
  {name:'Desktop: Python, Tkinter & Electron'},
  {name:'APIs, authentication & role-based access'},
  {name:'Project planning & documentation'},
  {name:'ICT support & network administration'},
  {name:'Design: Adobe Photoshop'},
  {name:'Video: Premiere Pro & CapCut'},
  {name:'Streaming: OBS'},
  {name:'Music production: FL Studio'}
];
fs.writeFileSync('data/profile.json', JSON.stringify(p, null, 2) + '\n');
const esc = s => s.replaceAll('&','&amp;').replaceAll('<','&lt;');
for (const file of ['about.html','services.html','index.html']) {
  let html = fs.readFileSync(file,'utf8');
  html = html.replace(/(<(?:p|span)[^>]*data-profile="(aboutIntro|bio|aboutPageSubtitle)"[^>]*>)[\s\S]*?(<\/(?:p|span)>)/g, (_,open,key,close)=>open+esc(p[key])+close);
  html = html.replace(/(<p[^>]*data-profile-path="pageCopy\.(aboutAcademicIntro|skillsSubtitle|servicesSubtitle)"[^>]*>)[\s\S]*?(<\/p>)/g, (_,open,key,close)=>open+esc(p.pageCopy[key])+close);
  if (file==='about.html') {
    html = html.replace('Hi, below is some general information about me.', 'Building useful systems. Bringing ideas to life.');
    const start = html.indexOf('<div class="skills-grid" data-dynamic-skills>');
    const end = html.indexOf('</section>',start);
    html = html.slice(0,start)+'<div class="skills-grid" data-dynamic-skills>'+p.skills.map(s=>'<div class="skill-item"><div class="skill-name">'+esc(s.name)+'</div></div>').join('')+'</div></div>'+html.slice(end);
  } else {
    const start = html.indexOf(file==='index.html'?'<div class="expertise-grid" data-dynamic-services>':'<div class="services-grid" data-dynamic-services>');
    const end = html.indexOf('</section>',start);
    const list = file==='index.html' ? p.services.slice(0,3) : p.services;
    html = html.slice(0,start)+`<div class="${file==='index.html'?'expertise-grid':'services-grid'}" data-dynamic-services>`+list.map((s,i)=>`<div class="services-card"><div class="service-icon">${String(i+1).padStart(2,'0')}</div><h3>${esc(s.title)}</h3><p>${esc(s.description)}</p></div>`).join('')+'</div>'+html.slice(end);
  }
  fs.writeFileSync(file,html);
}
