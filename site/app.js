// Handle Navigation Tabs
const navItems = document.querySelectorAll('.bottom-nav .nav-item');
const tabContents = document.querySelectorAll('.tab-content');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        // Remove active class from all tabs & navs
        navItems.forEach(nav => nav.classList.remove('active'));
        tabContents.forEach(tab => {
            tab.classList.remove('active');
            tab.style.display = 'none';
        });

        // Add active to clicked nav
        item.classList.add('active');

        // Show target tab
        const targetId = item.getAttribute('data-target');
        if (targetId) {
            const targetTab = document.getElementById(targetId);
            targetTab.style.display = 'block';
            setTimeout(() => targetTab.classList.add('active'), 10);
        }
    });
});

// Global memory
let globalData = {};
let currentCategory = 'world';

// Category Bubbles interaction
const categories = document.querySelectorAll('.category-btn');
categories.forEach(btn => {
    btn.addEventListener('click', () => {
        categories.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        
        const cat = btn.getAttribute('data-category');
        if(cat) {
            currentCategory = cat;
            updateDisplay();
        }
    });
});

// Fetch and Render Data
async function loadNewsData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Data not found');
        
        globalData = await response.json();
        updateDisplay();
    } catch (error) {
        console.error('Error loading news:', error);
        document.getElementById('current-news-container').innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 2rem;">
                <p>Nenhuma notícia encontrada ou bot ainda não foi rodado.</p>
            </div>`;
    }
}

function updateDisplay() {
    let current = [];
    let history = [];
    if (currentCategory === 'world') {
        current = globalData.current_world || [];
        history = globalData.history_world || [];
    } else if (currentCategory === 'brazil') {
        current = globalData.current_brazil || [];
        history = globalData.history_brazil || [];
    }
    
    renderCurrentNews(current);
    renderHistoryNews(history);
}

function renderCurrentNews(newsArray) {
    const container = document.getElementById('current-news-container');
    container.innerHTML = '';
    
    if (newsArray.length === 0) {
        container.innerHTML = '<p style="color: grey;">Nenhuma notícia para esta semana.</p>';
        return;
    }

    newsArray.forEach((news, idx) => {
        const isLive = idx === 0; // Just to simulate the UI from reference
        const card = document.createElement('a');
        card.href = news.url;
        card.target = '_blank';
        card.className = 'news-card';
        card.style.animation = `fadeUp ${0.1 * (idx + 1)}s ease forwards`;
        
        card.innerHTML = `
            <div class="card-top">
                ${isLive ? '<span class="live-badge">Top 1</span>' : '<span></span>'}
                <i data-feather="bookmark" style="color: var(--text-muted); width: 18px;"></i>
            </div>
            <h3>${news.title}</h3>
            <p>${news.description}</p>
            <div class="card-footer">
                <span class="date">${news.date}</span>
                <i data-feather="chevron-right" style="color: var(--accent); width: 18px;"></i>
            </div>
        `;
        container.appendChild(card);
    });
    
    feather.replace();
}

function renderHistoryNews(historyArray) {
    const container = document.getElementById('history-news-container');
    container.innerHTML = '';
    
    if (historyArray.length === 0) {
        container.innerHTML = '<p style="color: grey; text-align:center;">Não há histórico recente.</p>';
        return;
    }

    historyArray.forEach((news, idx) => {
        const card = document.createElement('a');
        card.href = news.url;
        card.target = '_blank';
        card.className = 'news-card';
        card.innerHTML = `
            <h3>${news.title}</h3>
            <p>${news.description}</p>
            <div class="card-footer" style="opacity: 0.7;">
                <span class="date">Registrado em: ${news.fetch_date || 'Desconhecido'}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .news-list .news-card {
        opacity: 0;
    }
`;
document.head.appendChild(style);

// Initialize
document.addEventListener('DOMContentLoaded', loadNewsData);
