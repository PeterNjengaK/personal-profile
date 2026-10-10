const fs = require('node:fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('portrait portrait-golden-gate', 'portrait portrait-edited').replace('images/portrait-golden-gate.jpg', 'images/hero-edited-v1.png').replace('width="3840" height="5120"', 'width="1672" height="941"').replace('portrait-blend-2', 'edited-hero-1');
fs.writeFileSync('index.html', html);
let css = fs.readFileSync('profile.css', 'utf8');
const start = css.indexOf('.portrait-golden-gate {');
const end = css.indexOf('.project-cover {', start);
css = css.slice(0, start) + `.portrait-edited { background: #382d3a; }
.portrait-edited > img { width: 100%; margin: 0; object-fit: cover; object-position: center; filter: none; }
.portrait-edited::after { background: linear-gradient(90deg, #382d3a66 0%, #382d3a33 45%, transparent 70%); }
@media (max-width: 768px) {
  .home-page .profile-hero { display: flex; flex-direction: column; gap: 24px; min-height: 0; padding-bottom: 0; }
  .portrait-edited { position: relative; inset: auto; width: calc(100% + 44px); height: 310px; flex: none; }
  .portrait-edited > img { object-position: right center; }
  .portrait-edited::after { background: linear-gradient(180deg, #382d3a 0%, transparent 28%); }
}
` + css.slice(end);
fs.writeFileSync('profile.css', css);
