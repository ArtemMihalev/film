// js/UIComponent.js
export class UIComponent {
    constructor(config) {
        if (new.target === UIComponent) {
            throw new Error('UIComponent is an abstract class');
        }
        
        this.id = config.id || 'comp-' + Date.now() + Math.random();
        this.title = config.title || 'Component';
        this.element = null;
        this.eventListeners = [];
    }
    
    createContainer() {
        const container = document.createElement('div');
        container.className = 'cinema-widget';
        container.dataset.id = this.id;
        container.id = this.id;
        return container;
    }
    
    createHeader() {
        const header = document.createElement('div');
        header.className = 'widget-header';
        
        const title = document.createElement('h2');
        title.className = 'widget-title';
        title.textContent = this.title;
        
        const controls = document.createElement('div');
        controls.className = 'widget-controls';
        
        const minimizeBtn = this.createButton('−', 'minimize-btn');
        const closeBtn = this.createButton('×', 'close-btn');
        
        controls.appendChild(minimizeBtn);
        controls.appendChild(closeBtn);
        
        header.appendChild(title);
        header.appendChild(controls);
        
        return { header, minimizeBtn, closeBtn };
    }
    
    createButton(text, className) {
        const btn = document.createElement('button');
        btn.className = `widget-btn ${className}`;
        btn.innerHTML = text;
        return btn;
    }
    
    addEventListener(element, event, handler) {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }
    
    render() {
        throw new Error('Method render() must be implemented');
    }
    
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        
        // Очищаем слушатели событий
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
        
        this.element = null;
    }
    
    minimize() {
        if (this.element) {
            this.element.classList.toggle('minimized');
        }
    }
    
    close() {
        this.destroy();
    }
}