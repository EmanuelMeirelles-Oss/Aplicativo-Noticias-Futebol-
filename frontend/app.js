/* ============================================================
   SAQUE.  —  Match Night Editorial
   ============================================================ */

const state = {
  data: null,
  category: 'world',
};

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ───── Date formatting ───── */
function formatDate(input, opts = {}) {
  if (!input) return '';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: opts.year ? 'numeric' : undefined,
    hour: opts.time ? '2-digit' : undefined,
    minute: opts.time ? '2-digit' : undefined,
  }).replace(/\.$/, '');
}

function todayLabel() {
  const d = new Date();
  const weekday = d.toLocaleDateString('pt-BR', { weekday: 'long' });
  const cap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  const rest = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  return `${cap} · ${rest}`;
}

/* ───── Source extraction (Google News titles end with "- Source") ───── */
function extractSource(title) {
  if (!title) return { title: '', source: '' };
  const m = title.match(/^(.+?)\s+-\s+([^-]+)$/);
  if (m) return { title: m[1].trim(), source: m[2].trim() };
  return { title, source: '' };
}

/* ───── Data load ───── */
async function loadData() {
  try {
    const res = await fetch('data.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    state.data = await res.json();
  } catch (err) {
    console.error('Falha ao carregar data.json:', err);
    state.data = { current_world: [], current_brazil: [], history_world: [], history_brazil: [], reddit_posts: [], match_ticker: [] };
  }
  render();
}

function renderTicker(matches) {
  const container = $('#ticker-content');
  if (!container) return;
  container.innerHTML = '';
  
  const list = matches && matches.length ? matches : [
    "BRASILEIRÃO: Flamengo 2 × 1 Corinthians (Encerrado)",
    "LALIGA: Real Madrid 2 × 0 Real Betis (Encerrado)",
    "PREMIER LEAGUE: Chelsea 1 × 1 Crystal Palace (Encerrado)"
  ];
  
  const loopedList = [...list, ...list, ...list];
  
  loopedList.forEach((match) => {
    const item = document.createElement('div');
    item.className = 'ticker-item';
    item.textContent = match;
    container.appendChild(item);
  });
}

/* ───── Render ───── */
function render() {
  const key = state.category === 'world' ? 'current_world' : 'current_brazil';
  const histKey = state.category === 'world' ? 'history_world' : 'history_brazil';
  const items = state.data[key] || [];
  const history = state.data[histKey] || [];

  renderHero(items[0]);
  renderTopGrid(items.slice(1, 5));
  renderReddit(state.data.reddit_posts || []);
  renderTicker(state.data.match_ticker || []);
  renderArchive(history.slice(0, 12));
  renderCategoryLabel();
}

function renderReddit(posts) {
  const grid = $('#reddit-grid');
  if (!grid) return;
  grid.innerHTML = '';

  if (!posts || !posts.length) {
    grid.innerHTML = `<p class="empty" style="grid-column: 1/-1; text-align: center; color: var(--ink-3); font-family: var(--mono); font-size: 0.8rem; padding: 24px 0; text-transform: uppercase; letter-spacing: 0.1em;">Nenhuma discussão relevante hoje.</p>`;
    return;
  }

  posts.forEach((post) => {
    const card = document.createElement('a');
    card.className = 'reddit-card';
    card.href = post.url || '#';
    card.target = '_blank';
    card.rel = 'noopener';
    
    const title = escapeHtml(post.title);
    const score = post.score || 0;

    card.innerHTML = `
      <div class="reddit-card-top">
        <svg class="reddit-card-icon" viewBox="0 0 20 20" fill="currentColor" style="width:14px;height:14px;color:#ff4500;">
          <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
        </svg>
        <span>Discussão ativa</span>
      </div>
      <h3 class="reddit-card-title">${title}</h3>
      <div class="reddit-card-foot">
        <span>r/futebol</span>
        <span class="reddit-score">▲ ${score}</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderHero(item) {
  const headlineEl = $('#hero-headline');
  const dateEl = $('#hero-date');
  const sourceEl = $('#hero-source');
  const timeEl = $('#hero-time');
  const linkEl = $('#hero-link');

  dateEl.textContent = todayLabel();

  if (!item) {
    headlineEl.textContent = 'Nenhuma manchete disponível ainda.';
    sourceEl.textContent = 'aguardando bot';
    timeEl.textContent = '—';
    linkEl.removeAttribute('href');
    return;
  }

  const { title, source } = extractSource(item.title);
  headlineEl.textContent = title;
  sourceEl.textContent = source ? `via ${source}` : 'curadoria';
  timeEl.textContent = formatDate(item.date, { time: true });
  linkEl.href = item.url || '#';
}

function renderTopGrid(items) {
  const grid = $('#top-grid');
  grid.innerHTML = '';

  if (!items.length) {
    grid.innerHTML = `<p class="empty">Nenhuma notícia adicional esta semana.</p>`;
    return;
  }

  items.forEach((item, i) => {
    const { title, source } = extractSource(item.title);
    const n = String(i + 2).padStart(2, '0');

    const a = document.createElement('a');
    a.className = 'story';
    a.href = item.url || '#';
    a.target = '_blank';
    a.rel = 'noopener';
    a.style.animation = `fadeUp 0.9s var(--ease-out) ${0.6 + i * 0.08}s both`;
    a.innerHTML = `
      <div class="story-top">
        <span class="story-num">${n}</span>
        <span class="story-cat">${source || 'notícia'}</span>
      </div>
      <h3 class="story-title">${escapeHtml(title)}</h3>
      <div class="story-foot">
        <span>${formatDate(item.date)}</span>
        <span class="story-arrow">→</span>
      </div>
    `;
    grid.appendChild(a);
  });
}

function renderArchive(items) {
  const list = $('#archive-list');
  list.innerHTML = '';

  if (!items.length) {
    list.innerHTML = `<p class="empty" style="padding:24px 0;color:var(--ink-3);font-family:var(--mono);font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;">Arquivo vazio. Volte amanhã.</p>`;
    return;
  }

  items.forEach((item) => {
    const { title, source } = extractSource(item.title);
    const a = document.createElement('a');
    a.className = 'arch-row';
    a.href = item.url || '#';
    a.target = '_blank';
    a.rel = 'noopener';
    a.innerHTML = `
      <span class="arch-date">${item.fetch_date || formatDate(item.date)}</span>
      <h4 class="arch-title">${escapeHtml(title)}</h4>
      <span class="arch-cat">${source || ''}</span>
      <span class="arch-arrow">→</span>
    `;
    list.appendChild(a);
  });
}

function renderCategoryLabel() {
  const lbl = $('#section-cat-label');
  if (lbl) lbl.textContent = state.category === 'world' ? 'Mundo' : 'Brasil';
}

/* ───── Utils ───── */
function escapeHtml(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ───── Wire up controls ───── */
function wireCategoryToggle() {
  $$('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.category;
      if (cat === state.category) return;
      state.category = cat;
      $$('.cat-btn').forEach(b => b.classList.toggle('active', b === btn));
      render();
    });
  });
}

function wireMobileNav() {
  $$('.mnav-link').forEach(link => {
    link.addEventListener('click', () => {
      $$('.mnav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

function wireTopNav() {
  // Highlight section in topnav while scrolling
  const sections = ['hero', 'hoje', 'arquivo', 'sobre'].map(id => document.getElementById(id)).filter(Boolean);
  const links = $$('.topnav-link');

  if (!('IntersectionObserver' in window)) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      const targetHash = id === 'hero' ? '#hoje' : `#${id}`;
      links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === targetHash));
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  sections.forEach(s => obs.observe(s));
}

/* ───── Lógica do Chute a Gol (Pênalti) ───── */
function wirePenaltyGame() {
  const goalsEl = $('#score-goals');
  const savesEl = $('#score-saves');
  const kickBtn = $('#kick-button');
  const ball = $('#soccer-ball');
  const gk = $('#gk-player');
  const resultOverlay = $('#game-result');
  const resultTitle = $('#result-title');
  const resultText = $('#result-text');
  const resetBtn = $('#reset-score');
  const aimButtons = $$('.aim-btn');

  let currentAim = 'center';
  let isKicking = false;

  // Carregar placar do localStorage
  let score = {
    goals: parseInt(localStorage.getItem('zm_goals') || '0', 10),
    saves: parseInt(localStorage.getItem('zm_saves') || '0', 10)
  };

  function updateScoreboard() {
    if (goalsEl) goalsEl.textContent = score.goals;
    if (savesEl) savesEl.textContent = score.saves;
  }

  updateScoreboard();

  // Selecionar mira do chute
  aimButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isKicking) return;
      aimButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentAim = btn.dataset.aim;
    });
  });

  // Função para criar partículas de comemoração (Confetes de Gol)
  function createConfetti() {
    const pitch = $('.game-pitch');
    if (!pitch) return;
    const colors = ['#00ff87', '#3B82F6', '#FF4D4D', '#ffdc96', '#ffffff'];
    for (let i = 0; i < 45; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const angle = Math.random() * Math.PI * 2;
      const velocity = 60 + Math.random() * 160;
      const x = Math.cos(angle) * velocity;
      const y = -120 - Math.random() * 160;
      
      p.style.setProperty('--x', `${x}px`);
      p.style.setProperty('--y', `${y}px`);
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      
      p.style.left = '50%';
      p.style.top = '25%';
      pitch.appendChild(p);
      
      setTimeout(() => p.remove(), 1200);
    }
  }

  // Lógica de chute
  kickBtn.addEventListener('click', () => {
    if (isKicking) return;
    isKicking = true;
    kickBtn.disabled = true;

    // Decidir ação do goleiro
    const options = ['left', 'center', 'right'];
    const gkChoice = options[Math.floor(Math.random() * options.length)];

    // Limpar estados anteriores
    gk.classList.remove('dive-left', 'dive-right', 'dive-center');
    ball.style.transform = 'none';

    // Animar mergulho do goleiro após breve reação
    setTimeout(() => {
      gk.classList.add(`dive-${gkChoice}`);
    }, 120);

    // Calcular translação
    let targetX = 0;
    let targetY = -240;
    
    const isMobile = window.innerWidth <= 768;
    const scaleFactor = isMobile ? 0.75 : 1.0;
    
    if (currentAim === 'left') targetX = -65 * scaleFactor;
    if (currentAim === 'right') targetX = 65 * scaleFactor;
    if (isMobile) targetY = -180;

    // Chutar bola
    ball.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) scale(0.58) rotate(720deg)`;

    // Processar resultado (tempo de voo da bola = 800ms)
    setTimeout(() => {
      const isGoal = currentAim !== gkChoice;

      if (isGoal) {
        score.goals++;
        localStorage.setItem('zm_goals', score.goals);
        
        resultOverlay.className = 'result-overlay goal-effect';
        resultTitle.textContent = 'GOOOOL! ⚽';
        
        const goalMsgs = [
          'No ângulo! Golaço!',
          'Chute indefensável!',
          'Direto na gaveta!',
          'Com muita categoria!',
          'Fuzilou a rede!'
        ];
        resultText.textContent = goalMsgs[Math.floor(Math.random() * goalMsgs.length)];
        createConfetti();

        // Faz a trave tremer
        const goalPost = $('.goal-post');
        if (goalPost) {
          goalPost.classList.add('net-shake');
          setTimeout(() => goalPost.classList.remove('net-shake'), 500);
        }
      } else {
        score.saves++;
        localStorage.setItem('zm_saves', score.saves);
        
        resultOverlay.className = 'result-overlay save-effect';
        resultTitle.textContent = 'DEFENDEU! 🧤';
        
        const saveMsgs = [
          'Defesa espetacular do goleiro!',
          'Espalmou para longe!',
          'Goleiro buscou no cantinho!',
          'Paredão intransponível!',
          'Sem moleza pro batedor!'
        ];
        resultText.textContent = saveMsgs[Math.floor(Math.random() * saveMsgs.length)];
        
        // Efeito físico: rebote da defesa
        ball.style.transform = `translate3d(${targetX * 1.15}px, ${targetY + 40}px, 0) scale(0.72) rotate(480deg)`;
      }

      updateScoreboard();
      resultOverlay.classList.remove('hidden');

      // Resetar estados
      setTimeout(() => {
        resultOverlay.classList.add('hidden');
        gk.classList.remove('dive-left', 'dive-right', 'dive-center');
        ball.style.transform = 'none';
        isKicking = false;
        kickBtn.disabled = false;
      }, 2500);

    }, 800);
  });

  // Zerar placar
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      score.goals = 0;
      score.saves = 0;
      localStorage.setItem('zm_goals', '0');
      localStorage.setItem('zm_saves', '0');
      updateScoreboard();
    });
  }
}

/* ───── Boot ───── */
document.addEventListener('DOMContentLoaded', () => {
  wireCategoryToggle();
  wireMobileNav();
  wireTopNav();
  wirePenaltyGame();
  loadData();
});

