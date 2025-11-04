// Configuration
const GITHUB_USERNAME = 'latif-abdul';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;
const PORTFOLIO_REPO_NAME = `${GITHUB_USERNAME}.github.io`;

// Language colors mapping (common languages)
const languageColors = {
    JavaScript: '#f1e05a',
    TypeScript: '#2b7489',
    Python: '#3572A5',
    Java: '#b07219',
    HTML: '#e34c26',
    CSS: '#563d7c',
    PHP: '#4F5D95',
    Ruby: '#701516',
    Go: '#00ADD8',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#178600',
    Swift: '#ffac45',
    Kotlin: '#F18E33',
    Rust: '#dea584',
    Dart: '#00B4AB',
    Shell: '#89e051',
    Vue: '#2c3e50',
    Blade: '#f7523f',
    Hack: '#878787',
    'Jupyter Notebook': '#DA5B0B',
};

// State
let allProjects = [];
let filteredProjects = [];

// DOM Elements
const projectsGrid = document.getElementById('projectsGrid');
const searchInput = document.getElementById('searchInput');
const languageFilter = document.getElementById('languageFilter');
const loading = document.getElementById('loading');
const noResults = document.getElementById('noResults');

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Fetch repositories from GitHub API
async function fetchRepositories() {
    try {
        loading.style.display = 'block';
        projectsGrid.innerHTML = '';
        noResults.style.display = 'none';

        const response = await fetch(`${GITHUB_API_URL}?per_page=100&sort=updated`);
        
        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Rate limit exceeded. Please try again later.');
            }
            throw new Error('Failed to fetch repositories');
        }

        const repos = await response.json();
        
        // Filter out the portfolio repo itself and sort by update date
        allProjects = repos
            .filter(repo => repo.name !== PORTFOLIO_REPO_NAME)
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        
        filteredProjects = [...allProjects];
        
        populateLanguageFilter();
        displayProjects();
        
    } catch (error) {
        console.error('Error fetching repositories:', error);
        loading.style.display = 'none';
        projectsGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>${error.message || 'Failed to load projects. Please try again later.'}</p>
            </div>
        `;
    }
}

// Populate language filter dropdown
function populateLanguageFilter() {
    const languages = [...new Set(allProjects
        .map(repo => repo.language)
        .filter(lang => lang !== null)
    )].sort();
    
    languages.forEach(language => {
        const option = document.createElement('option');
        option.value = language;
        option.textContent = language;
        languageFilter.appendChild(option);
    });
}

// Display projects in the grid
function displayProjects() {
    loading.style.display = 'none';
    
    if (filteredProjects.length === 0) {
        projectsGrid.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    projectsGrid.innerHTML = filteredProjects.map(repo => createProjectCard(repo)).join('');
}

// Create a project card HTML
function createProjectCard(repo) {
    const languageColor = languageColors[repo.language] || '#6b7280';
    const description = repo.description || 'No description available';
    const stars = repo.stargazers_count || 0;
    const forks = repo.forks_count || 0;
    const updatedDate = new Date(repo.updated_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    // Escape user-generated content
    const escapedName = escapeHtml(repo.name);
    const escapedDescription = escapeHtml(description);
    const escapedLanguage = repo.language ? escapeHtml(repo.language) : '';

    return `
        <div class="project-card" data-language="${escapedLanguage}" data-name="${repo.name.toLowerCase()}">
            <div class="project-header">
                <i class="fas fa-folder-open project-icon"></i>
                <div class="project-title">
                    <a href="${repo.html_url}" target="_blank" rel="noopener" class="project-name">
                        ${escapedName}
                    </a>
                </div>
            </div>
            
            <p class="project-description">${escapedDescription}</p>
            
            <div class="project-meta">
                ${repo.language ? `
                    <span class="meta-item language-badge">
                        <span class="language-dot" style="background-color: ${languageColor};"></span>
                        <span>${escapedLanguage}</span>
                    </span>
                ` : ''}
                
                ${stars > 0 ? `
                    <span class="meta-item">
                        <i class="fas fa-star"></i>
                        <span>${stars}</span>
                    </span>
                ` : ''}
                
                ${forks > 0 ? `
                    <span class="meta-item">
                        <i class="fas fa-code-branch"></i>
                        <span>${forks}</span>
                    </span>
                ` : ''}
                
                <span class="meta-item">
                    <i class="fas fa-calendar"></i>
                    <span>${updatedDate}</span>
                </span>
            </div>
            
            <div class="project-footer">
                <a href="${repo.html_url}" target="_blank" rel="noopener" class="project-link">
                    View Project <i class="fas fa-external-link-alt"></i>
                </a>
            </div>
        </div>
    `;
}

// Filter projects based on search and language
function filterProjects() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedLanguage = languageFilter.value;
    
    filteredProjects = allProjects.filter(repo => {
        const matchesSearch = searchTerm === '' || 
            repo.name.toLowerCase().includes(searchTerm) ||
            (repo.description && repo.description.toLowerCase().includes(searchTerm));
        
        const matchesLanguage = selectedLanguage === '' || repo.language === selectedLanguage;
        
        return matchesSearch && matchesLanguage;
    });
    
    displayProjects();
}

// Event Listeners
searchInput.addEventListener('input', filterProjects);
languageFilter.addEventListener('change', filterProjects);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchRepositories();
});
