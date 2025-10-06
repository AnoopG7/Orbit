/**
 * COMPONENT LOADER - Dynamic HTML Component System
 * 
 * This system enables modular, component-based architecture by dynamically loading
 * reusable HTML components (navbar, footer, etc.) into pages. It provides caching,
 * script execution, and auto-loading capabilities for maintainable web applications.
 * 
 * Key Features:
 * - Dynamic HTML component loading with intelligent caching
 * - Auto-loading via data attributes (data-component="path")
 * - Script execution within loaded components
 * - Parallel component loading for performance
 * - Loading states, error handling, and fallback support
 * - Event system for component lifecycle management
 * 
 * Used by: All pages for navbar/footer, modular UI components
 * Global Access: window.componentLoader, window.loadComponent
 */

// Component Loader - Dynamically loads HTML components
class ComponentLoader {
    constructor() {
        this.cache = new Map();
        this.loadingPromises = new Map();
    }
    
    /**
     * Load and inject a component into the specified container
     * @param {string} componentPath - Path to the component HTML file
     * @param {string|HTMLElement} container - Selector string or DOM element
     * @param {Object} options - Configuration options
     */
    async loadComponent(componentPath, container, options = {}) {
        try {
            const containerElement = typeof container === 'string' 
                ? document.querySelector(container) 
                : container;
                
            if (!containerElement) {
                throw new Error(`Container not found: ${container}`);
            }
            
            // Show loading state if specified
            if (options.showLoading) {
                containerElement.innerHTML = this.getLoadingHTML();
            }
            
            // Get component HTML
            const html = await this.fetchComponent(componentPath);
            
            // Inject the component
            containerElement.innerHTML = html;
            
            // Execute any scripts in the component
            this.executeScripts(containerElement);
            
            // Trigger loaded event
            this.triggerLoadedEvent(containerElement, componentPath);
            
            return containerElement;
        } catch (error) {
            console.error(`Failed to load component ${componentPath}:`, error);
            
            if (options.fallback) {
                const containerElement = typeof container === 'string' 
                    ? document.querySelector(container) 
                    : container;
                containerElement.innerHTML = options.fallback;
            }
            
            throw error;
        }
    }
    
    /**
     * Fetch component HTML with caching
     */
    async fetchComponent(componentPath) {
        // Return cached version if available
        if (this.cache.has(componentPath)) {
            return this.cache.get(componentPath);
        }
        
        // Return existing promise if already loading
        if (this.loadingPromises.has(componentPath)) {
            return this.loadingPromises.get(componentPath);
        }
        
        // Create new loading promise
        const loadingPromise = fetch(componentPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.text();
            })
            .then(html => {
                // Cache the result
                this.cache.set(componentPath, html);
                this.loadingPromises.delete(componentPath);
                return html;
            })
            .catch(error => {
                this.loadingPromises.delete(componentPath);
                throw error;
            });
        
        this.loadingPromises.set(componentPath, loadingPromise);
        return loadingPromise;
    }
    
    /**
     * Execute scripts within a container element
     */
    executeScripts(container) {
        const scripts = container.querySelectorAll('script');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            
            // Copy attributes
            Array.from(script.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });
            
            // Copy content
            newScript.textContent = script.textContent;
            
            // Replace old script with new one to execute it
            script.parentNode.replaceChild(newScript, script);
        });
    }
    
    /**
     * Trigger custom loaded event
     */
    triggerLoadedEvent(container, componentPath) {
        const event = new CustomEvent('componentLoaded', {
            detail: { componentPath, container }
        });
        container.dispatchEvent(event);
        document.dispatchEvent(event);
    }
    
    /**
     * Get loading HTML template
     */
    getLoadingHTML() {
        return `
            <div class="flex items-center justify-center p-4">
                <div class="spinner"></div>
                <span class="ml-2 text-secondary">Loading...</span>
            </div>
        `;
    }
    
    /**
     * Load multiple components in parallel
     */
    async loadComponents(components) {
        const promises = components.map(({ path, container, options }) => 
            this.loadComponent(path, container, options)
        );
        
        return Promise.all(promises);
    }
    
    /**
     * Preload components for faster future loading
     */
    async preloadComponents(componentPaths) {
        const promises = componentPaths.map(path => this.fetchComponent(path));
        return Promise.all(promises);
    }
    
    /**
     * Clear cache for a specific component or all components
     */
    clearCache(componentPath = null) {
        if (componentPath) {
            this.cache.delete(componentPath);
        } else {
            this.cache.clear();
        }
    }
}

// Create global instance
window.componentLoader = new ComponentLoader();

// Utility functions for easy component loading
window.loadComponent = (path, container, options) => 
    window.componentLoader.loadComponent(path, container, options);

window.loadComponents = (components) => 
    window.componentLoader.loadComponents(components);

// Auto-load components with data attributes when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const componentsToLoad = [];
    
    // Find elements with data-component attribute
    document.querySelectorAll('[data-component]').forEach(element => {
        const componentPath = element.getAttribute('data-component');
        const showLoading = element.hasAttribute('data-show-loading');
        const fallback = element.getAttribute('data-fallback');
        
        componentsToLoad.push({
            path: componentPath,
            container: element,
            options: { showLoading, fallback }
        });
    });
    
    // Load all components
    if (componentsToLoad.length > 0) {
        window.componentLoader.loadComponents(componentsToLoad)
            .catch(error => {
                console.error('Failed to load some components:', error);
            });
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComponentLoader;
}