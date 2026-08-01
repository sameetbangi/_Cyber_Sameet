const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

const storage = {
  get(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch {
      try { localStorage.removeItem(key); } catch {}
      return fallback;
    }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
};

let toastTimer;
function alertUser(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

const lessons = [
  ['â—‰', 'Password Security', 'Build long, unique passwords and store them in a password manager.'],
  ['âœ‰', 'Phishing', 'Spot pressure tactics, mismatched links, and impersonation.'],
  ['âš ', 'Malware', 'Keep systems patched and software sources trusted.'],
  ['âŠ—', 'Ransomware', 'Use tested backups and limit access to sensitive data.'],
  ['â–£', 'Mobile Security', 'Protect the device in your pocket with updates and locks.'],
  ['â˜', 'Cloud Security', 'Review sharing permissions before sensitive files spread.'],
  ['âœ¦', 'AI Security', 'Treat synthetic voice and messages with healthy skepticism.'],
  ['â™§', 'Social Engineering', 'Pause when an unusual request creates urgency.'],
  ['âŒ', 'Wi-Fi Security', 'Avoid sensitive work on untrusted public networks.'],
  ['â—Œ', 'Digital Privacy', 'Minimize data sharing and review account settings.']
];

$('#lessons').innerHTML = lessons.map(([icon, title, description]) => `
  <article class="lesson"><div class="icon">${icon}</div><h3>${title}</h3><p>${description}</p>
  <details><summary>Open lesson + quick check</summary><p><b>Prevention:</b> Verify sources, reduce permissions, keep software updated, and pause before taking urgent action.</p><button class="lesson-check">Quick check: Is urgency a warning sign?</button></details></article>
`).join('');
$$('.lesson-check').forEach(button => button.addEventListener('click', () => alertUser('Correct â€” urgency is a common social-engineering signal.')));

const defaultNews = [
  ['Zero-Day Vulnerabilities', 'Critical patch guidance for enterprise teams', 'Prioritize exposed edge services and validate emergency patch deployment.'],
  ['AI Security', 'AI-assisted phishing is targeting inboxes', 'Use out-of-band verification for payment and credential requests.'],
  ['Ransomware', 'Ransomware resilience checklist updated', 'Test immutable backups and incident communications plans this quarter.']
];
const scams = [['High', 'Fake UPI collect requests'], ['High', 'WhatsApp OTP takeover'], ['Medium', 'QR code payment swap'], ['High', 'Fake banking apps'], ['Medium', 'Fake job offers'], ['High', 'Deepfake calls']];
const journalPosts = [['Awareness', 'The CyberShield journal is warming up.', 'New educational articles will appear here soon.']];
const escapeHtml = value => { const node = document.createElement('div'); node.textContent = value; return node.innerHTML; };

function renderCards(target, cards) {
  $(target).innerHTML = cards.map(([category, title, content]) => `<article><div class="tag">${escapeHtml(category)}</div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(content)}</p></article>`).join('');
}
renderCards('#newsCards', defaultNews);
renderCards('#blogPosts', journalPosts);
$('#scamCards').innerHTML = scams.map(([risk, title]) => `<article><div class="tag" style="color:${risk === 'High' ? '#ff6175' : '#ffc65d'}">${risk} RISK</div><h3>${title}</h3><p>Fraudsters use urgency and impersonation. Never share OTPs, payment approvals, or remote access under pressure.</p><a class="plain" href="#learn">How to stay safe â†’</a></article>`).join('');

$('.menu').addEventListener('click', () => $('nav').classList.toggle('open'));
$$('nav a').forEach(link => link.addEventListener('click', () => $('nav').classList.remove('open')));
$('#theme').addEventListener('click', () => {
  document.body.classList.toggle('light');
  storage.set('csTheme', document.body.classList.contains('light') ? 'light' : 'dark');
});
if (storage.get('csTheme') === 'light') document.body.classList.add('light');

function randomPassword(length = 18) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
  const limit = 256 - (256 % alphabet.length);
  const bytes = new Uint8Array(length);
  let password = '';
  while (password.length < length) {
    crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      if (byte < limit) password += alphabet[byte % alphabet.length];
      if (password.length === length) break;
    }
  }
  return password;
}

function setOutput(button, value) { button.closest('article').querySelector('output').textContent = value; }
$$('[data-action]').forEach(button => button.addEventListener('click', async () => {
  const action = button.dataset.action;
  try {
    if (action === 'password') setOutput(button, randomPassword());
    if (action === 'username') setOutput(button, `${['cyber', 'nova', 'secure', 'zero', 'byte'][Math.floor(Math.random() * 5)]}_${1000 + Math.floor(Math.random() * 9000)}`);
    if (action === 'encode') setOutput(button, btoa(unescape(encodeURIComponent($('#base64').value))));
    if (action === 'decode') setOutput(button, decodeURIComponent(escape(atob($('#base64').value))));
    if (action === 'hash') {
      const bytes = new TextEncoder().encode($('#hash').value);
      const hash = await crypto.subtle.digest('SHA-256', bytes);
      setOutput(button, [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, '0')).join(''));
    }
    if (action === 'urlencode') setOutput(button, encodeURIComponent($('#urlcode').value));
    if (action === 'urldecode') setOutput(button, decodeURIComponent($('#urlcode').value));
    if (action === 'qr') {
      const url = $('#qr').value.trim();
      new URL(url);
      if (!confirm('This sends the URL to api.qrserver.com to create the QR image. Continue?')) return;
      const output = button.closest('article').querySelector('output');
      output.replaceChildren();
      const image = document.createElement('img');
      image.alt = 'QR code for the supplied URL'; image.width = 170;
      image.src = `https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(url)}`;
      output.append(image);
    }
  } catch { setOutput(button, 'That input could not be processed.'); }
}));

$('#strength').addEventListener('input', event => {
  const value = event.target.value;
  const score = Math.min(100, value.length * 7 + (/[A-Z]/.test(value) ? 15 : 0) + (/\d/.test(value) ? 15 : 0) + (/[^\w]/.test(value) ? 20 : 0));
  const card = event.target.closest('article');
  const bar = card.querySelector('.bar i');
  bar.style.width = `${score}%`; bar.style.background = score > 75 ? '#00ffb3' : score > 45 ? '#ffc65d' : '#ff6175';
  card.querySelector('output').textContent = score > 75 ? 'Strong â€” great protection.' : score > 45 ? 'Moderate â€” add length and variety.' : 'Weak â€” make it longer and unique.';
});

$('.scan').addEventListener('submit', event => {
  event.preventDefault();
  const raw = $('#scanurl').value.trim(); let url;
  try { url = new URL(raw); } catch { $('#scanresults').textContent = 'Enter a valid HTTPS URL.'; return; }
  const suspicious = /login|verify|free|gift|secure-|wallet|upi/i.test(url.hostname + url.pathname) || url.protocol !== 'https:';
  const entries = [['HTTPS', url.protocol === 'https:' ? 'Secure' : 'Not secure'], ['Domain age', 'Unavailable offline'], ['SSL certificate', url.protocol === 'https:' ? 'Present' : 'Not detected'], ['Reputation', suspicious ? 'Caution' : 'No immediate indicators'], ['Risk percentage', `${suspicious ? 68 : 14}%`], ['Recommendation', suspicious ? 'Do not enter credentials until independently verified.' : 'No immediate red flags; still verify the source.']];
  const results = $('#scanresults'); results.replaceChildren(); const grid = document.createElement('div'); grid.className = 'result-grid';
  entries.forEach(([label, value]) => { const cell = document.createElement('div'); const heading = document.createTextNode(label); const bold = document.createElement('b'); bold.textContent = value; cell.append(heading, bold); grid.append(cell); });
  results.append(grid);
});

const habits = [['Two-factor authentication', 'Enabled for important accounts'], ['Device updates', 'Automatic updates are on'], ['Password manager', 'Unique passwords are managed'], ['Secure backup', 'Backups are current and tested'], ['Endpoint protection', 'Trusted protection is active'], ['Screen lock', 'PIN, password, or biometrics are used']];
$('#checks').innerHTML = habits.map(([title, detail], index) => `<label class="check"><input type="checkbox" value="${index}"><span><b>${title}</b><small>${detail}</small></span></label>`).join('');
function updateScore() {
  const inputs = $$('#checks input'); const checked = inputs.filter(input => input.checked).length; const score = Math.round((checked / inputs.length) * 100);
  $('#scoreNumber').textContent = score;
  $('#scoreTitle').textContent = score >= 84 ? 'Excellent resilience' : score >= 52 ? 'Good foundation' : score ? 'Strengthen your basics' : 'Start your check';
  $('#scoreAdvice').textContent = score >= 84 ? 'Keep reviewing recovery plans and privacy settings.' : score >= 52 ? 'Prioritize the unchecked habits next.' : score ? 'Start with 2FA, updates, and a password manager.' : 'Select the habits already in place.';
}
$$('#checks input').forEach(input => input.addEventListener('change', updateScore));
updateScore();

const questionsByLevel = {
  Beginner: [['What is the safest response to an unexpected OTP request?', 'Ignore it and contact the service through its official app/site.', 'Share it only if the caller sounds legitimate.', 'Forward it to a friend.'], ['Which password is strongest?', 'A unique 16+ character password created by a password manager.', 'Your name plus birth year.', 'One password reused everywhere.'], ['A QR payment code may be risky whenâ€¦', 'You are asked to scan it to receive money.', 'It appears in your own banking app.', 'It belongs to a known merchant.']],
  Intermediate: [['What should you verify before approving a payment request?', 'The request through a known, independent contact channel.', 'That the message uses your company logo.', 'That it arrived during business hours.'], ['Why are software updates important?', 'They often fix security vulnerabilities.', 'They make every password stronger.', 'They prevent all phishing.'], ['What is the safest public Wi-Fi practice?', 'Use HTTPS and avoid sensitive transactions when possible.', 'Disable your device lock.', 'Share your hotspot password publicly.']],
  Advanced: [['What best limits ransomware impact?', 'Tested, isolated backups and least-privilege access.', 'Paying immediately.', 'Keeping every account as an administrator.'], ['What does MFA fatigue exploit?', 'Repeated prompts that pressure a user to approve one.', 'A weak Wi-Fi signal.', 'A slow password manager.'], ['What is an out-of-band verification?', 'Confirming through a different trusted channel.', 'Replying to the same suspicious email.', 'Checking only the sender display name.']]
};
let level = 'Beginner'; let questionIndex = 0; let correct = 0;
function showQuestion() {
  const questions = questionsByLevel[level]; const question = questions[questionIndex];
  $('#question').innerHTML = `<small>QUESTION ${questionIndex + 1} OF ${questions.length}</small><h3>${question[0]}</h3>${question.slice(1).map((answer, index) => `<button data-answer="${index === 0}">${answer}</button>`).join('')}`;
  $$('#question button').forEach(button => button.addEventListener('click', () => { if (button.dataset.answer === 'true') correct++; questionIndex++; $('#progress').style.width = `${(questionIndex / questions.length) * 100}%`; questionIndex < questions.length ? showQuestion() : finishQuiz(); }));
}
function finishQuiz() {
  const score = Math.round((correct / questionsByLevel[level].length) * 100);
  $('#question').hidden = true; $('#quizDone').hidden = false; $('#quizScore').textContent = `${score}/100`;
  $('#certText').textContent = `Certificate CYBER-${crypto.getRandomValues(new Uint32Array(1))[0].toString(16).slice(0, 8).toUpperCase()} Â· ${level} level Â· ${score >= 66 ? 'Threat-aware and ready.' : 'Keep learningâ€”every secure choice counts.'}`;
}
function startQuiz() { questionIndex = 0; correct = 0; $('#progress').style.width = '0%'; $('#question').hidden = false; $('#quizDone').hidden = true; showQuestion(); }
$$('.levels button').forEach(button => button.addEventListener('click', () => { $$('.levels .active').forEach(active => active.classList.remove('active')); button.classList.add('active'); level = button.dataset.level; startQuiz(); }));
startQuiz();

$('#subscribe').addEventListener('submit', event => { event.preventDefault(); event.target.reset(); alertUser('This browser-only demo does not store subscriptions.'); });

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
