// js/RandomMovieWidget.js
import { UIComponent } from './UIComponent.js';

export class RandomMovieWidget extends UIComponent {
    constructor(config) {
        super(config);
        this.movie = null;
        this.isLoading = false;
        this.error = null;
        this.apiKey = '2d83b5c3';
        
        // Список популярных фильмов для случайного выбора
        this.movieTitles = [
    'Inception', 'The Matrix', 'Avatar', 'Titanic', 'The Dark Knight',
    'Pulp Fiction', 'Forrest Gump', 'The Godfather', 'Star Wars', 'Jurassic Park',
    'Back to the Future', 'Gladiator', 'Braveheart', 'The Lion King', 'Alien',
    'Terminator 2', 'Fight Club', 'Goodfellas', 'The Shawshank Redemption', 'Interstellar',
    'The Green Mile', 'The Silence of the Lambs', 'Saving Private Ryan', 'The Prestige', 'Memento',
    'The Departed', 'Whiplash', 'Joker', 'Django Unchained', 'Inglourious Basterds',
    'The Wolf of Wall Street', 'Shutter Island', 'The Sixth Sense', 'A Beautiful Mind', 'Rocky',
    'Raging Bull', 'The Shining', 'Psycho', 'Casablanca', 'Gone with the Wind',
    'Lawrence of Arabia', 'Apocalypse Now', 'Full Metal Jacket', 'Platoon', 'Scarface',
    'The Big Lebowski', 'Fargo', 'No Country for Old Men', 'There Will Be Blood', 'American Beauty'
];
    }
    
    async getRandomMovie() {
        this.isLoading = true;
        this.error = null;
        this.renderContent();
        
        try {
            // Выбираем случайный фильм из списка
            const randomIndex = Math.floor(Math.random() * this.movieTitles.length);
            const randomTitle = this.movieTitles[randomIndex];
            
            const url = `https://www.omdbapi.com/?t=${encodeURIComponent(randomTitle)}&apikey=${this.apiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.Response === 'True') {
                this.movie = data;
            } else {
                this.error = 'Не удалось загрузить фильм';
            }
        } catch (error) {
            console.error('Random movie error:', error);
            this.error = 'Ошибка загрузки';
        } finally {
            this.isLoading = false;
            this.renderContent();
        }
    }

    addToWatchlist() {
        if (!this.movie) return;
        
        // Находим дашборд (он родительский компонент)
        const dashboard = window.dashboard; // Нужно будет добавить в main.js
        
        if (dashboard) {
            const watchlistWidget = dashboard.findWatchlistWidget();
            
            if (watchlistWidget) {
                // Добавляем фильм в существующий watchlist
                watchlistWidget.addItem(`${this.movie.Title} (${this.movie.Year})`);
                
                // Показываем уведомление
                this.showNotification('Фильм добавлен в список просмотра!');
            } else {
                // Если нет виджета watchlist, создаем новый
                const newWidget = dashboard.addWidget('watchlist');
                setTimeout(() => {
                    newWidget.addItem(`${this.movie.Title} (${this.movie.Year})`);
                }, 500);
                this.showNotification('Создан новый список и фильм добавлен!');
            }
        }
    }

    showNotification(message) {
        // Создаем временное уведомление
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--secondary);
            color: white;
            padding: 1rem 2rem;
            border-radius: 4px;
            font-family: var(--font-display);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }

    render() {
        this.element = this.createContainer();
        
        const { header } = this.createHeader();
        this.element.appendChild(header);
        
        this.contentDiv = document.createElement('div');
        this.contentDiv.className = 'widget-content';
        this.element.appendChild(this.contentDiv);
        
        // Сразу загружаем случайный фильм
        setTimeout(() => this.getRandomMovie(), 100);
        
        return this.element;
    }
    
    renderContent() {
        if (!this.contentDiv) return;
        
        const randomBtnId = `${this.id}-random-btn`;
        
        if (this.isLoading) {
            this.contentDiv.innerHTML = `
                <div class="random-movie-container">
                    <div class="random-movie-card skeleton">
                        <div style="height:400px;background:var(--bg-tertiary);margin-bottom:1rem;"></div>
                        <div style="height:40px;width:70%;background:var(--bg-tertiary);margin-bottom:10px;"></div>
                        <div style="height:20px;width:100%;background:var(--bg-tertiary);margin-bottom:5px;"></div>
                        <div style="height:20px;width:100%;background:var(--bg-tertiary);"></div>
                    </div>
                    <button class="random-btn" id="${randomBtnId}" disabled>ЗАГРУЗКА...</button>
                </div>
            `;
            return;
        }
        
        if (this.error) {
            this.contentDiv.innerHTML = `
                <div class="random-movie-container">
                    <div class="random-movie-card" style="border-right-color: var(--secondary);">
                        <div style="text-align:center;padding:2rem;">
                            <div style="font-size:3rem;margin-bottom:1rem;">🎬</div>
                            <div class="random-movie-title" style="color: var(--secondary);">ОШИБКА</div>
                            <div class="random-movie-overview">${this.error}</div>
                        </div>
                    </div>
                    <button class="random-btn" id="${randomBtnId}">ПОПРОБОВАТЬ СНОВА</button>
                </div>
            `;
            this.bindRandomButton(randomBtnId);
            return;
        }
        
        if (this.movie) {
            const posterUrl = this.movie.Poster && this.movie.Poster !== 'N/A' 
                ? this.movie.Poster 
                : 'https://via.placeholder.com/300x450?text=Нет+постера';
            
            this.contentDiv.innerHTML = `
                <div class="random-movie-container">
                    <div class="random-movie-card">
                        <div style="width:100%; height:400px; overflow:hidden; border-radius:4px; margin-bottom:1rem; display:flex; align-items:center; justify-content:center; background:var(--bg-tertiary);">
                        <img src="${posterUrl}" 
                            alt="${this.movie.Title}" 
                            style="width:100%; height:100%; object-fit:contain;"
                            onerror="this.src='https://via.placeholder.com/300x450?text=Нет+постера'; this.style.objectFit='cover';">
                        </div>
                        <div class="random-movie-title">${this.movie.Title}</div>
                        <div style="display:flex;gap:1rem;margin-bottom:0.5rem;color:var(--text-secondary);">
                            <span>📅 ${this.movie.Year}</span>
                            <span>⭐ ${this.movie.imdbRating}</span>
                            <span>⏱️ ${this.movie.Runtime}</span>
                        </div>
                        <div class="random-movie-overview">${this.movie.Plot || 'Нет описания'}</div>
                        <div style="margin-top:10px;color:var(--text-secondary);">
                            🎭 ${this.movie.Genre || 'N/A'}
                        </div>
                    </div>
                    <button class="random-btn" id="${this.id}-add-watchlist" style="background: var(--primary); color: var(--bg-primary);">➕ В СПИСОК ПРОСМОТРА</button>
                    <button class="random-btn" id="${randomBtnId}">🎲 СЛУЧАЙНЫЙ ФИЛЬМ</button>
                </div>
            `;
            this.bindRandomButton(randomBtnId);
        }
    }
    
    bindRandomButton(btnId) {
    setTimeout(() => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.getRandomMovie();
            };
        }
        
        // Добавляем обработчик для кнопки добавления в watchlist
        const addBtn = document.getElementById(`${this.id}-add-watchlist`);
        if (addBtn) {
            addBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.addToWatchlist();
            };
        }
    }, 0);
}
}