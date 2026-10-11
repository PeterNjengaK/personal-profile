const fs = require('node:fs');
const p = JSON.parse(fs.readFileSync('data/profile.json','utf8'));
for (const key of ['birthday','age','phone','location']) delete p[key];
p.aboutIntro = p.aboutIntro.replace(' based in California','');
fs.writeFileSync('data/profile.json',JSON.stringify(p,null,2)+'\n');
function removeInfoItem(html, marker) {
  let position = html.indexOf(marker);
  while(position >= 0) {
    const start = html.lastIndexOf('<div class="info-item">',position);
    if(start < 0) break;
    const tags = /<div\b[^>]*>|<\/div>/g;
    tags.lastIndex = start;
    let depth=0, token, end;
    while((token=tags.exec(html))) {
      depth += token[0].startsWith('</') ? -1 : 1;
      if(depth===0) { end=tags.lastIndex;break; }
    }
    if(!end) throw Error('Unbalanced information card');
    html=html.slice(0,start)+html.slice(end);
    position=html.indexOf(marker);
  }
  return html;
}
for(const file of ['index.html','about.html','resume.html','services.html','portfolio.html','contact.html']) {
  let html=fs.readFileSync(file,'utf8');
  for(const marker of ['data-profile="birthday"','data-profile="age"','data-profile="phone"','data-profile-phone','data-profile="location"']) {
    if(file==='about.html'||file==='contact.html') html=removeInfoItem(html,marker);
  }
  html=html.replace(/<span data-profile="location">[^<]*<\/span>/g,'').replaceAll(' based in California','').replace('Personal Info','Professional Overview');
  html=html.replace(/profile\.css\?v=[^"']+/,'profile.css?v=professional-profile-1');
  fs.writeFileSync(file,html);
}
let admin=fs.readFileSync('admin/admin.js','utf8');
admin=admin.replace("['phone', 'Phone number', 'tel'], ['location', 'Location', 'text'], ",'').replace("['birthday', 'Birthday', 'text'], ['age', 'Age', 'text'], ",'');
fs.writeFileSync('admin/admin.js',admin);
