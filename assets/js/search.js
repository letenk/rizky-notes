// Search functionality with Fuse.js
(function() {
  let fuse = null;
  let searchData = [];
  
  // Load search index
  async function loadSearchIndex() {
    try {
      const response = await fetch('/index.json');
      searchData = await response.json();
      
      // Initialize Fuse.js
      const options = {
        keys: [
          { name: 'title', weight: 3 },
          { name: 'description', weight: 2 },
          { name: 'content', weight: 1 },
          { name: 'tags', weight: 2 },
          { name: 'categories', weight: 1.5 }
        ],
        threshold: 0.3,
        includeScore: true,
        includeMatches: true,
        minMatchCharLength: 2,
      };
      
      fuse = new Fuse(searchData, options);
      console.log('Search index loaded:', searchData.length, 'posts');
    } catch (error) {
      console.error('Failed to load search index:', error);
    }
  }
  
  // Perform search
  function performSearch(query) {
    if (!fuse || query.trim().length < 2) {
      return [];
    }
    
    const results = fuse.search(query);
    return results.slice(0, 10); // Max 10 results
  }
  
  // Open search modal
  function openSearch() {
    const modal = document.getElementById('search-modal');
    const input = document.getElementById('search-input');
    
    if (modal && input) {
      modal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
      
      // Focus input with slight delay
      setTimeout(() => input.focus(), 100);
    }
  }
  
  // Close search modal
  function closeSearch() {
    const modal = document.getElementById('search-modal');
    const input = document.getElementById('search-input');
    const results = document.getElementById('search-results');
    
    if (modal) {
      modal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
      
      // Clear search
      if (input) input.value = '';
      if (results) results.innerHTML = '';
    }
  }
  
  // Render search results
  function renderResults(results) {
    const container = document.getElementById('search-results');
    if (!container) return;
    
    if (results.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 text-gray-500 dark:text-gray-400">
          <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p class="text-lg font-medium">No results found</p>
          <p class="text-sm mt-2">Try different keywords</p>
        </div>
      `;
      return;
    }
    
    const html = results.map(result => {
      const item = result.item;
      const date = new Date(item.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      // Get first tag
      const tag = item.tags && item.tags.length > 0 ? item.tags[0] : '';
      
      return `
        <a href="${item.permalink}" class="block p-4 rounded-lg border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200 group">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              ${tag ? `<span class="inline-block px-2 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded mb-2">${tag}</span>` : ''}
              <h3 class="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2 truncate">
                ${item.title}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                ${item.description || item.content.substring(0, 150) + '...'}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-500">
                ${date}
              </p>
            </div>
            <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
        </a>
      `;
    }).join('');
    
    container.innerHTML = html;
  }
  
  // Handle search input
  function handleSearchInput(event) {
    const query = event.target.value;
    const results = performSearch(query);
    renderResults(results);
  }
  
  // Initialize search
  function initSearch() {
    // Load search index
    loadSearchIndex();
    
    // Search input handler
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', handleSearchInput);
    }
    
    // Close modal on backdrop click
    const modal = document.getElementById('search-modal');
    if (modal) {
      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          closeSearch();
        }
      });
    }
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeSearch();
      }
    });
    
    // Keyboard shortcut (Ctrl+K or Cmd+K)
    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
    });
  }
  
  // Expose functions globally
  window.openSearch = openSearch;
  window.closeSearch = closeSearch;
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
  } else {
    initSearch();
  }
})();