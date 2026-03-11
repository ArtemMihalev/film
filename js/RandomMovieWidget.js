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
            'Back to the Future', 'Gladiator', 'Braveheart', 'The Lion King', 'Alien'
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
                        <div style="height:300px;background:var(--bg-tertiary);margin-bottom:1rem;"></div>
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
                        <img src="${posterUrl}" 
                             alt="${this.movie.Title}" 
                             class="random-movie-poster"
                             onerror="this.src='https://via.placeholder.com/300x450?text=Нет+постера'">
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
        }, 0);
    }
}