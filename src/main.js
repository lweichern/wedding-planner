import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import './style.css';
import { wedding as w } from './wedding.js';

const icons = {
  arrow: '<path d="M7 17 17 7M7 7h10v10"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18m-12 4h3m3 0h3m-9 3h3"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="1"/><path d="m2 5 10 8L22 5M2 20l7-7m13 7-7-7"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  church: '<path d="M12 2v5M10 4h4M3 12l9-6 9 6v10H3V12Z"/><path d="M10 22v-7a2 2 0 0 1 4 0v7M6 13v3m12-3v3"/><circle cx="12" cy="10" r="1"/>',
  rings: '<circle cx="8" cy="14" r="6"/><circle cx="16" cy="14" r="6"/><path d="m14 7 2-4 2 4m-13 0 3-4 3 4"/>',
  glass: '<path d="M7 2h10l-1 9a4 4 0 0 1-8 0L7 2Zm5 13v7m-4 0h8M8 7h8"/>',
  sparkle: '<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/>',
  moon: '<path d="M20 15.5A9 9 0 0 1 8.5 4 9 9 0 1 0 20 15.5Z"/><path d="m17 2 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
};
const icon = (name, cls = '') => `<svg class="icon ${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.heart}</svg>`;

function sprig(cls = '') {
  return `<svg class="sprig ${cls}" viewBox="0 0 180 270" fill="none" aria-hidden="true"><g stroke="currentColor" stroke-width=".9"><path d="M88 263c8-53-4-78 8-122s28-57 20-126M94 171c-33-9-39-25-60-40m62 14c34-15 38-29 56-47M93 213c-25-8-43-28-57-44m68-63C76 91 62 72 62 54m48 30c23-12 31-29 37-43"/><g fill="currentColor" fill-opacity=".12"><path d="M93 211c-31 2-41-12-39-29 22 2 34 13 39 29Zm-11-27c-25 2-40-7-43-24 25-2 40 12 43 24Zm12-15c13-24 30-26 43-20-9 21-24 24-43 20Zm5-30c25-3 34-19 31-35-18 7-29 18-31 35Zm18-54c21 1 32-11 32-28-21 4-28 14-32 28Zm-7-4C87 79 81 66 86 49c19 8 23 18 24 32Zm5-28c17-10 20-26 12-40-14 12-16 24-12 40ZM88 134c-30 4-42-6-46-24 23-1 41 7 46 24ZM63 100C39 93 36 80 42 65c20 10 24 23 21 35ZM66 69c-19-8-24-21-18-36 18 9 23 21 18 36ZM50 147c-21 3-36-6-40-22 23-1 33 8 40 22Z"/></g><path d="m116 42 7-19m-13 53L91 59m30 18 21-14m-41 67 24-19m-42 17-33-12m39 90-28-19m39-22 29-13"/></g><g transform="translate(44 113)"><path d="M0-18C12-27 25-14 20-5 33 3 21 22 10 17 1 31-15 18-13 7-29 0-16-20-6-15Z" fill="#cfaaa7" fill-opacity=".65" stroke="#a5807b" stroke-width=".7"/><path d="M-8-9C4-20 21-3 11 8 0 18-13 6-7-3 1-13 13-2 6 5-1 11-8 2-1-3 4-5 7 1 2 3" stroke="#a5807b" stroke-width=".8"/></g><g transform="translate(141 99) scale(.68)"><path d="M0-18C12-27 25-14 20-5 33 3 21 22 10 17 1 31-15 18-13 7-29 0-16-20-6-15Z" fill="#cfaaa7" fill-opacity=".65" stroke="#a5807b"/><path d="M-8-9C4-20 21-3 11 8 0 18-13 6-7-3 1-13 13-2 6 5-1 11-8 2-1-3" stroke="#a5807b"/></g></svg>`;
}
const ornament = `<div class="ornament" aria-hidden="true"><span></span>${icon('sparkle')}<span></span></div>`;
const sectionLabel = (num, text) => `<div class="eyebrow"><span class="section-number">${num}</span>${text}</div>`;
const safe = str => String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
const names = w.names.map(safe);
const initials = w.initials.map(safe);
const monogram = `<span>${initials[0]}</span><i>&</i><span>${initials[1]}</span>`;
const attire = `<svg class="attire-art" viewBox="0 0 220 160" fill="none" aria-hidden="true"><g stroke="#676956" stroke-width="1.2"><path d="m45 28-22 12-8 58 15 3 9-36-4 83h42l-4-83 10 35 14-4-12-56-22-12" fill="#707763"/><path d="m45 28 11 35 11-35-11 7Z" fill="#faf6ef"/><path d="m42 33-5 17 12 5-8 11 15 19 14-19-8-11 12-5-5-17M55 84v61M39 103h10m14 0h10"/><path d="m50 35 6 4 6-4v8l-6-4-6 4Z" fill="#4c5142"/><path d="M48 10c1-12 18-12 18 0v9c-4 12-14 12-18 0Z" fill="#e4cab9" stroke="#ad9683"/><path d="M48 10c-6-17 22-17 18 0L58 5Z" fill="#716356" stroke="none"/></g><g stroke="#ae8583" stroke-width="1.1"><path d="m145 31-13 11 11 40-23 60c16 15 41 16 59 0l-23-60 13-40-14-11" fill="#ceb0ae"/><path d="m138 36 12 13 11-13m-18 45h13m-9 2-12 60m17-60 12 64m-34-8c16 9 32 9 47 0"/><path d="m133 42-13 47 7 4 13-37m28-14 14 47-7 4-12-36" fill="#e8cdbc"/><path d="M142 13c0-15 18-15 18 0v8c-4 11-14 11-18 0Z" fill="#e8cdbc"/><path d="M140 15c-6-17 25-23 21 0l-7-10c-2 6-8 8-14 10Z" fill="#8b7563" stroke="none"/></g></svg>`;

document.querySelector('#app').innerHTML = `
<a class="skip-link" href="#celebration">Skip to wedding details</a>
<header class="site-header">
  <a class="brand" href="#home" aria-label="${names.join(' and ')} home">${monogram}</a>
  <nav aria-label="Main navigation"><a href="#story">Our story</a><a href="#celebration">The celebration</a><a href="#details">The details</a></nav>
  <a class="button button-small button-outline" href="#rsvp">Kindly RSVP ${icon('arrow')}</a>
</header>
<main>
  <section class="hero" id="home" aria-labelledby="hero-title">
    <div class="hero-rule left"><span>A NEW CHAPTER</span><i></i></div>
    <div class="hero-rule right"><span>WITH OUR FAVOURITE PEOPLE</span><i></i></div>
    ${sprig('hero-sprig left')}${sprig('hero-sprig right')}
    <div class="hero-content">
      <p class="eyebrow hero-eyebrow">Together with our families</p>
      <h1 id="hero-title">${names[0]} <em>&</em> ${names[1]}</h1>
      <p class="hero-subtitle">A little French countryside. A whole lot of love.</p>
      <div class="hero-art-wrap"><div class="hero-arch"></div><img class="hero-art" src="/assets/chateau.webp" alt="An illustrated French château surrounded by cypress trees, roses, and a formal garden" fetchpriority="high" /></div>
      <div class="hero-date"><span>${safe(w.heroDate)}</span><span class="tiny-diamond">◇</span><span>${safe(w.region.toUpperCase())}</span></div>
      <button class="button button-primary open-invitation">Open our invitation ${icon('mail')}</button>
      <a class="scroll-cue" href="#welcome">A celebration awaits ${icon('down')}</a>
    </div>
    <span class="hero-bottom-note">A WEEKEND TO REMEMBER</span>
  </section>
  <section class="welcome section" id="welcome">
    <div class="welcome-inner reveal">
      <div class="little-monogram">${monogram}</div>
      <p class="eyebrow">With full hearts</p>
      <h2>Some days change<br>your life. <em>This is ours.</em></h2>
      <p class="prose">And it wouldn’t be the same without you.<br>Join us for a weekend of laughter, long dinners, a little dancing,<br class="desktop-only"> and the beginning of our forever.</p>
      <p class="script-note">Bienvenue à notre mariage</p>
      ${ornament}
      <div class="countdown" aria-label="Countdown to the wedding"><div><span id="days">—</span><small>Days</small></div><b>:</b><div><span id="hours">—</span><small>Hours</small></div><b>:</b><div><span id="minutes">—</span><small>Minutes</small></div></div>
      <p class="countdown-note">Until we say “I do”</p>
    </div>
    ${sprig('welcome-sprig left')}${sprig('welcome-sprig right')}
  </section>
  <section class="story section" id="story">
    <div class="story-illustration reveal"><div class="story-oval">${sprig('story-flower left')}${sprig('story-flower right')}<span class="story-quote">Of all the places<br>we’ve been,<br><em>my favourite<br>is with you.</em></span><span class="story-initials">${initials.join(' + ')}</span></div><span class="illustration-caption">A LOVE STORY, STILL BEING WRITTEN</span></div>
    <div class="story-copy reveal">${sectionLabel('01', 'Our story')}<h2>One little café.<br><em>A lifetime of us.</em></h2><p class="prose">${safe(w.story)}</p><p class="signature">${names[0]} & ${names[1]} <span>♡</span></p></div>
  </section>
  <section class="celebration section" id="celebration">
    <div class="section-heading reveal">${sectionLabel('02', 'The celebration')}<h2>Meet us <em>in Burgundy.</em></h2><p class="prose">An old château, a garden in bloom, and everyone we love.</p></div>
    <div class="event-card reveal">
      <div class="event-visual"><img src="/assets/chateau.webp" alt="French country estate and its garden" loading="lazy"/><div class="event-visual-caption"><span>THE SETTING FOR OUR FOREVER</span><p>${safe(w.venue)}</p></div></div>
      <div class="event-info"><span class="eyebrow">The wedding day</span><h3>Ceremony <em>&</em><br>Reception</h3><p class="event-date">${safe(w.dateLabel)}</p><div class="event-times"><div><strong>4:45 PM</strong><span>Guest arrival</span></div><span class="event-divider"></span><div><strong>5:00 PM</strong><span>We say “I do”</span></div></div><p class="venue-name">${safe(w.venue)}</p><p class="address">${safe(w.address)}</p><div class="event-links"><a href="${w.mapUrl}" target="_blank" rel="noopener noreferrer">${icon('pin')} View location ${icon('arrow')}</a><button class="calendar-action">${icon('calendar')} Save the date ${icon('arrow')}</button></div></div>
    </div>
    <div class="timeline-block reveal"><div class="timeline-heading"><p class="eyebrow">A beautiful day, unfolding</p><h3>The order <em>of the day</em></h3></div><ol class="timeline">${[['church','4:45 PM','Welcome drinks','Find your favourite faces.'],['rings','5:00 PM','The ceremony','A promise. A kiss. Forever.'],['glass','6:00 PM','Cocktail hour','A toast to what comes next.'],['sparkle','7:00 PM','Dinner & dancing','Good food. Better company.'],['moon','11:00 PM','A sweet farewell','One last dance, we promise.']].map(([i,t,h,p])=>`<li><span class="timeline-icon">${icon(i)}</span><span class="timeline-dot"></span><time>${t}</time><h4>${h}</h4><p>${p}</p></li>`).join('')}</ol></div>
  </section>
  <section class="details section" id="details">
    <div class="section-heading reveal">${sectionLabel('03', 'A few lovely details')}<h2>Make yourself <em>at home.</em></h2><p class="prose">A little planning, for a wonderfully carefree weekend.</p></div>
    <div class="detail-cards">
      <article class="detail-card reveal">${attire}<p class="eyebrow">Dressed for the occasion</p><h3>A black-tie <em>affair.</em></h3><p>Think flowing gowns, your favourite suit, and a little something special. We’ll celebrate on gravel and lawn, so choose your dancing shoes wisely.</p></article>
      <article class="detail-card reveal"><div class="brunch-art">${icon('sun')}<svg viewBox="0 0 180 95" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.2"><ellipse cx="84" cy="78" rx="52" ry="7"/><path d="M52 33h54v24c0 26-54 26-54 0V33Zm54 6h9c18 0 18 24-9 24M48 33h62M64 25c-12-10 13-13 1-23m15 23c-12-10 13-13 1-23m15 23c-12-10 13-13 1-23"/><path d="M22 70c-20-12-9-37 6-30 7-13 25-3 22 11-13-3-21 6-28 19Z" fill="#c4a67d" fill-opacity=".2"/><path d="m22 43 9 18m0-22 9 14"/></g></svg></div><p class="eyebrow">One more moment together</p><h3>The morning <em>after.</em></h3><p>For those staying a little longer, join us for coffee, croissants, and stories from the dance floor.</p><p class="brunch-time">Sunday, 13 June · 11:00 AM<br><span>In the château gardens</span></p></article>
      <article class="detail-card reveal"><div class="gift-art">${sprig()}<svg viewBox="0 0 100 90" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.1"><rect x="17" y="30" width="66" height="49"/><path d="m17 31 33 26 33-26M17 79l23-30m43 30L60 49"/><circle cx="50" cy="54" r="9" fill="#d6b4ad"/><path d="M50 58s-7-4-5-7c2-3 5 0 5 0s3-3 5 0c2 3-5 7-5 7Z"/></g></svg></div><p class="eyebrow">Your presence is our present</p><h3>Simply <em>be there.</em></h3><p>Sharing this day with you is the greatest gift. If you would like to give a little something more, a wishing well will be available at the reception.</p></article>
    </div>
    <div class="faq reveal"><h3>A little more <em>to know</em></h3>${[
      ['How do we get there?', 'The château is in Santenay, in the heart of Burgundy. The nearest convenient rail connections are through Dijon and Beaune. Use the location link above for the exact venue address. We recommend arranging your journey and accommodation in advance.'],
      ['Will there be transport?', 'We are planning a shuttle between Beaune and the venue. Let us know in your RSVP if you would like a seat. Pickup times and the meeting point will be shared with guests closer to the wedding.'],
      ['Can we bring our little ones?', 'We love your little ones, but our wedding day will be an adults-only celebration. Thank you for making arrangements to join us for an evening together.'],
      ['What if I have dietary requirements?', 'Please include any allergies or dietary requirements in your RSVP. If you are responding for two people, let us know who each requirement is for.'],
    ].map(([q,a])=>`<details><summary>${q}<span class="faq-plus" aria-hidden="true">+</span></summary><p>${a}</p></details>`).join('')}</div>
  </section>
  <section class="rsvp-section section" id="rsvp">
    <div class="rsvp-intro reveal">${sectionLabel('04', 'We saved you a seat')}<h2>Will you<br><em>celebrate with us?</em></h2><p class="prose">We can’t wait to make memories with you.<br>Kindly reply by <strong>${safe(w.deadlineLabel)}.</strong></p>${sprig('rsvp-sprig')}<div class="rsvp-note">${icon('heart')} A day made better by having you there.</div></div>
    <div class="rsvp-panel reveal">
      <div class="rsvp-success" hidden tabindex="-1"><div class="success-seal">${icon('check')}</div><p class="eyebrow">With love, received</p><h3 id="success-title">You’re on the guest list.</h3><p id="success-message"></p><button class="button button-primary calendar-action">${icon('calendar')} Add to calendar</button><button class="text-button edit-response">Edit my response</button></div>
      <form id="rsvp-form">
        ${w.isSample ? '<div class="sample-note">A little preview of your invitation. Sample details; responses are saved to this app, not sent to a couple.</div>' : ''}
        <div class="form-row"><div class="field"><label for="guest-name">Your full name <span>*</span></label><input id="guest-name" name="name" placeholder="First and last name" autocomplete="name" minlength="2" maxlength="120" required /></div><div class="field"><label for="guest-email">Email address <span>*</span></label><input id="guest-email" name="email" type="email" placeholder="you@example.com" autocomplete="email" maxlength="254" required /></div></div>
        <fieldset><legend>Will you be joining us? <span>*</span></legend><div class="attendance-options"><label class="radio-card"><input type="radio" name="attending" value="yes" required /><span>${icon('heart')} Joyfully accepts</span></label><label class="radio-card"><input type="radio" name="attending" value="no" required /><span>${icon('mail')} Regretfully declines</span></label></div></fieldset>
        <div id="attending-fields" hidden><div class="form-row"><div class="field"><label for="guest-count">Number of guests</label><select id="guest-count" name="guests"><option value="1">Just me</option><option value="2">Two of us</option></select></div><div class="field"><label for="shuttle">A seat on the shuttle?</label><select id="shuttle" name="shuttle"><option value="">Please choose</option><option value="yes">Yes, please</option><option value="no">I’ll arrange my transport</option></select></div></div><div class="field"><label for="dietary">Any dietary requirements? <small>Optional</small></label><input id="dietary" name="dietary" placeholder="Allergies, preferences, anything we should know" maxlength="1000" /></div><p class="guest-note">Please respond only for the guests named on your invitation.</p></div>
        <div class="field"><label for="message">A little note for us <small>Optional</small></label><textarea id="message" name="message" placeholder="A wish, a memory, or just a little love…" rows="3" maxlength="2000"></textarea></div>
        <p class="form-error" role="alert" hidden></p><button class="button button-primary submit-button" type="submit">Send with love ${icon('arrow')}</button><p class="form-footnote">Your details will only be used to plan our celebration.</p>
      </form>
    </div>
  </section>
</main>
<footer><div class="footer-flower">${sprig()}</div><p class="eyebrow">The best is yet to come</p><p class="footer-names">${names[0]} <em>&</em> ${names[1]}</p><p class="footer-date">${safe(w.shortDate)} <span>·</span> ${safe(w.region)}</p>${ornament}<div class="footer-bottom"><span>MADE WITH LOVE, FOR THE PEOPLE WE LOVE.</span><button class="replay-invitation">Replay the invitation ${icon('arrow')}</button></div></footer>
<div class="opening-scene" role="dialog" aria-modal="true" aria-label="Your invitation is opening" hidden><div class="opening-backdrop"><p class="eyebrow">You are warmly invited</p><p class="opening-names">${names[0]} <em>&</em><br>${names[1]}</p><img src="/assets/chateau.webp" alt=""/><p class="eyebrow">${safe(w.shortDate)}</p></div><div class="curtain curtain-left"><div class="curtain-swag"></div></div><div class="curtain curtain-right"><div class="curtain-swag"></div></div><div class="opening-door left"></div><div class="opening-door right"></div><div class="wax-seal">${monogram}</div><button class="skip-opening">Skip introduction ${icon('arrow')}</button></div>
<div class="toast" role="status" aria-live="polite"></div>
`;

// The first screen is immediately usable. The optional opening plays on a deliberate tap.
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const scene = document.querySelector('.opening-scene');
let openingTimer;
let openingTrigger;
let openingTimeouts = [];
function finishOpening() {
  clearTimeout(openingTimer);
  openingTimeouts.forEach(clearTimeout);
  openingTimeouts = [];
  scene.hidden = true;
  scene.classList.remove('doors-open', 'curtains-open', 'scene-fade');
  document.body.classList.remove('opening-active');
  document.querySelectorAll('header, main, footer').forEach(el => el.inert = false);
  openingTrigger?.focus({ preventScroll: true });
  document.querySelector('#welcome').scrollIntoView({ behavior: motionQuery.matches ? 'instant' : 'smooth' });
}
function openInvitation(e) {
  openingTrigger = e.currentTarget;
  if (motionQuery.matches) { finishOpening(); return; }
  scene.hidden = false;
  document.body.classList.add('opening-active');
  document.querySelectorAll('header, main, footer').forEach(el => el.inert = true);
  scene.querySelector('button').focus();
  openingTimeouts.push(setTimeout(() => scene.classList.add('doors-open'), 100));
  openingTimeouts.push(setTimeout(() => scene.classList.add('curtains-open'), 1250));
  openingTimeouts.push(setTimeout(() => scene.classList.add('scene-fade'), 3450));
  openingTimer = setTimeout(finishOpening, 4050);
}
document.querySelectorAll('.open-invitation, .replay-invitation').forEach(b => b.addEventListener('click', openInvitation));
document.querySelector('.skip-opening').addEventListener('click', finishOpening);
scene.addEventListener('keydown', e => { if (e.key === 'Escape') finishOpening(); if (e.key === 'Tab') { e.preventDefault(); scene.querySelector('button').focus(); } });

function updateCountdown() {
  const remaining = Math.max(0, new Date(w.date).getTime() - Date.now());
  document.querySelector('#days').textContent = String(Math.floor(remaining / 86400000)).padStart(2, '0');
  document.querySelector('#hours').textContent = String(Math.floor(remaining / 3600000) % 24).padStart(2, '0');
  document.querySelector('#minutes').textContent = String(Math.floor(remaining / 60000) % 60).padStart(2, '0');
  if (!remaining) document.querySelector('.countdown-note').textContent = 'Our forever starts here.';
}
updateCountdown(); setInterval(updateCountdown, 30000);

const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
}), { threshold: .08 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

let toastTimer;
function toast(message) { const el = document.querySelector('.toast'); el.textContent = message; el.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 4000); }
const icsEscape = str => str.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
function saveCalendar() {
  const start = new Date(w.date).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const end = new Date(new Date(w.date).getTime() + 6 * 3600000).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const text = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Garden Invitation//Wedding//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT',`UID:${new Date(w.date).getTime()}@garden-invitation.local`,`DTSTAMP:${stamp}`,`DTSTART:${start}`,`DTEND:${end}`,`SUMMARY:${icsEscape(w.names.join(' & ') + ' — Wedding')}`,`LOCATION:${icsEscape(w.venue + ', ' + w.address)}`,`DESCRIPTION:${icsEscape('Join us to celebrate! Please arrive at 4:45 PM local venue time. Ceremony begins at 5:00 PM. '+w.mapUrl)}`,'END:VEVENT','END:VCALENDAR'].join('\r\n');
  const url = URL.createObjectURL(new Blob([text], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = 'wedding-invitation.ics'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast('Your calendar invitation is ready. Open the file to save the date.');
}
document.querySelectorAll('.calendar-action').forEach(el => el.addEventListener('click', saveCalendar));

const form = document.querySelector('#rsvp-form');
const attendingFields = document.querySelector('#attending-fields');
const success = document.querySelector('.rsvp-success');
let savedResponse;
try { savedResponse = JSON.parse(localStorage.getItem('garden-rsvp-v1') || 'null'); } catch { savedResponse = null; }
function toggleAttending() {
  const attending = form.elements.attending.value === 'yes';
  attendingFields.hidden = !attending;
  attendingFields.querySelectorAll('input, select').forEach(el => el.disabled = !attending);
  form.elements.shuttle.required = attending;
}
form.querySelectorAll('[name="attending"]').forEach(el => el.addEventListener('change', toggleAttending));
toggleAttending();
function showSuccess(data, focus = true) {
  form.hidden = true; success.hidden = false;
  document.querySelector('#success-title').textContent = data.attending === 'yes' ? 'We saved you a seat.' : 'You’ll be there in spirit.';
  document.querySelector('#success-message').textContent = data.attending === 'yes' ? `Thank you, ${data.name.split(' ')[0]}. Your response has been saved. We can’t wait to celebrate with you in Burgundy.` : `Thank you for letting us know, ${data.name.split(' ')[0]}. We’ll miss you, and we’re sending a little love your way.`;
  success.querySelector('.calendar-action').hidden = data.attending !== 'yes';
  if (focus) success.focus({ preventScroll: true });
}
if (savedResponse?.responseId) showSuccess(savedResponse, false);
document.querySelector('.edit-response').addEventListener('click', () => {
  form.hidden = false; success.hidden = true;
  if (savedResponse) Object.entries(savedResponse).forEach(([key, value]) => { if (form.elements[key]) form.elements[key].value = value; });
  toggleAttending(); form.elements.name.focus({ preventScroll: true });
});
form.addEventListener('submit', async e => {
  e.preventDefault();
  const error = form.querySelector('.form-error'); error.hidden = true;
  const btn = form.querySelector('.submit-button'); btn.disabled = true; btn.textContent = 'Sending your love…';
  const data = Object.fromEntries(new FormData(form));
  if (savedResponse?.responseId) data.responseId = savedResponse.responseId;
  try {
    const response = await fetch('/api/rsvp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Your response could not be saved. Please try again.');
    savedResponse = { ...data, responseId: result.id };
    try { localStorage.setItem('garden-rsvp-v1', JSON.stringify(savedResponse)); } catch { /* The server response is still saved if browser storage is unavailable. */ }
    showSuccess(data);
  } catch (err) { error.textContent = err instanceof TypeError ? 'We couldn’t connect. Your answers are still here — please try again.' : err.message; error.hidden = false; }
  finally { btn.disabled = false; btn.innerHTML = `Send with love ${icon('arrow')}`; }
});

// Keep keyboard focus visible, and highlight the current section in the quiet navigation.
const navLinks = [...document.querySelectorAll('nav a')];
const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) navLinks.forEach(link => {
    if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}), { rootMargin: '-20% 0px -60% 0px' });
navLinks.forEach(link => sectionObserver.observe(document.querySelector(link.hash)));
