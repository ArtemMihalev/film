// js/MovieSearchWidget.js
import { UIComponent } from './UIComponent.js';

export class MovieSearchWidget extends UIComponent {
    constructor(config) {
        super(config);
        this.searchResults = null;
        this.isLoading = false;
        this.error = null;
        // ВСТАВЬТЕ СВОЙ КЛЮЧ ЗДЕСЬ
        this.apiKey = '2d83b5c3'; 
        this.lastSearch = '';
        
        console.log('MovieSearchWidget created with API key:', this.apiKey);
    }
    
    async searchMovie(title) {
        if (!title || !title.trim()) {
            this.error = 'Please enter a movie title';
            this.renderContent();
            return;
        }
        
        const searchTerm = title.trim();
        console.log('Searching for movie:', searchTerm);
        
        this.isLoading = true;
        this.error = null;
        this.renderContent();
        
        try {
            // Используем JSONP или прокси для обхода CORS
            const url = `https://www.omdbapi.com/?t=${encodeURIComponent(searchTerm)}&apikey=${this.apiKey}`;
            console.log('Fetching URL:', url);
            
            const response = await fetch(url);
            const data = await response.json();
            
            console.log('OMDB Response:', data);
            
            if (data.Response === 'True') {
                this.searchResults = data;
                this.lastSearch = searchTerm;
                this.error = null;
            } else {
                this.error = data.Error || 'Movie not found';
                this.searchResults = null;
            }
        } catch (error) {
            console.error('OMDB API Error:', error);
            this.error = 'Failed to fetch movie data. Check console for details.';
            this.searchResults = null;
        } finally {
            this.isLoading = false;
            this.renderContent();
        }
    }
    
    render() {
        console.log('Rendering MovieSearchWidget');
        this.element = this.createContainer();
        
        // Создаем шапку
        const { header } = this.createHeader();
        this.element.appendChild(header);
        
        // Создаем контент
        this.contentDiv = document.createElement('div');
        this.contentDiv.className = 'widget-content';
        this.element.appendChild(this.contentDiv);
        
        // Рендерим начальное состояние
        this.renderContent();
        
        return this.element;
    }
    
    renderContent() {
        if (!this.contentDiv) return;
        
        // Создаем уникальные ID для элементов
        const inputId = `${this.id}-search-input`;
        const btnId = `${this.id}-search-btn`;
        
        this.contentDiv.innerHTML = `
            <div class="search-container">
                <div class="search-input-group">
                    <input type="text" 
                           class="search-input" 
                           placeholder="ENTER MOVIE TITLE..."
                           value="${this.lastSearch}"
                           id="${inputId}">
                    <button class="search-btn" id="${btnId}">
                        SEARCH
                    </button>
                </div>
                
                <div class="movie-results">
                    ${this.renderMovieContent()}
                </div>
            </div>
        `;
        
        // Добавляем обработчики с задержкой, чтобы гарантировать, что DOM обновился
        setTimeout(() => {
            const searchInput = document.getElementById(inputId);
            const searchBtn = document.getElementById(btnId);
            
            if (searchBtn && searchInput) {
                console.log('Adding event listeners to search widget');
                
                // Удаляем старые обработчики, если они были
                const newSearchBtn = searchBtn.cloneNode(true);
                searchBtn.parentNode.replaceChild(newSearchBtn, searchBtn);
                
                const newSearchInput = searchInput.cloneNode(true);
                searchInput.parentNode.replaceChild(newSearchInput, searchInput);
                
                // Добавляем новые обработчики
                newSearchBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Search button clicked, value:', newSearchInput.value);
                    this.searchMovie(newSearchInput.value);
                });
                
                newSearchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        console.log('Enter pressed, value:', newSearchInput.value);
                        this.searchMovie(newSearchInput.value);
                    }
                });
            } else {
                console.error('Search elements not found:', { inputId, btnId });
            }
        }, 0);
    }
    
    renderMovieContent() {
        if (this.isLoading) {
            return `
                <div class="movie-card skeleton">
                    <div style="width:120px;height:180px;background:var(--bg-tertiary);"></div>
                    <div style="flex:1;">
                        <div style="height:30px;width:70%;background:var(--bg-tertiary);margin-bottom:10px;"></div>
                        <div style="height:20px;width:50%;background:var(--bg-tertiary);margin-bottom:10px;"></div>
                        <div style="height:60px;width:100%;background:var(--bg-tertiary);"></div>
                    </div>
                </div>
            `;
        }
        
        if (this.error) {
            return `
                <div class="movie-card" style="border-left-color: var(--secondary);">
                    <div class="movie-info">
                        <div class="movie-title" style="color: var(--secondary);">⚠️ ERROR</div>
                        <div class="movie-plot">${this.error}</div>
                        <div style="margin-top:10px; font-size:12px; color:var(--text-secondary);">
                            Try: "Inception", "Matrix", "Avatar"
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (this.searchResults) {
            // Проверяем, что постер не "N/A"
            const posterUrl = this.searchResults.Poster && this.searchResults.Poster !== 'N/A' 
                ? this.searchResults.Poster 
                : 'https://via.placeholder.com/300x450?text=No+Poster';
            
            return `
                <div class="movie-card">
                    <img src="${posterUrl}" 
                         alt="${this.searchResults.Title}" 
                         class="movie-poster"
                         onerror="this.src='https://via.placeholder.com/300x450?text=No+Poster'">
                    <div class="movie-info">
                        <div class="movie-title">${this.searchResults.Title}</div>
                        <div class="movie-meta">
                            <span>📅 ${this.searchResults.Year}</span>
                            <span>⭐ ${this.searchResults.imdbRating}</span>
                            <span>⏱️ ${this.searchResults.Runtime}</span>
                        </div>
                        <div class="movie-plot">
                            ${this.searchResults.Plot || 'No plot available'}
                        </div>
                        <div style="margin-top:10px;color:var(--text-secondary);">
                            🎭 ${this.searchResults.Genre || 'N/A'}
                        </div>
                        <div style="margin-top:5px;color:var(--text-secondary);font-size:12px;">
                            👥 ${this.searchResults.Actors || 'N/A'}
                        </div>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="movie-card" style="justify-content:center;text-align:center; min-height:200px;">
                <div class="movie-info">
                    <div style="font-size:3rem;margin-bottom:1rem;">🎬</div>
                    <div class="movie-plot">SEARCH FOR A MOVIE TO BEGIN</div>
                    <div style="margin-top:10px; color:var(--text-secondary);">
                        Try: "Inception", "The Matrix", "Avatar"
                    </div>
                </div>
            </div>
        `;
    }
}