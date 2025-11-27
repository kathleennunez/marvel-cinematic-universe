const galleryEl = document.getElementById('moviesGallery');
const emptyStateEl = document.getElementById('emptyState');
const sortSelect = document.getElementById('sortSelect');
const characterFilter = document.getElementById('characterFilter');
const phaseFilter = document.getElementById('phaseFilter');
const PLACEHOLDER_POSTER =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600'%3E%3Crect fill='%2314181f' width='400' height='600'/%3E%3Ctext x='50%25' y='50%25' fill='%23ffffff' font-size='28' font-family='Helvetica' text-anchor='middle'%3ENo%20Image%3C/text%3E%3C/svg%3E";

let movies = [];

document.addEventListener('DOMContentLoaded', () => {
  loadMovies();
  sortSelect.addEventListener('change', applyFiltersAndSort);
  characterFilter.addEventListener('change', applyFiltersAndSort);
  phaseFilter.addEventListener('change', applyFiltersAndSort);
});

async function loadMovies() {
  const response = await fetch('movies.json');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  movies = await response.json();

  populateFilters(movies);
  applyFiltersAndSort();
}

function populateFilters(list) {
  const characters = Array.from(new Set(list.map((m) => m.main_character).filter(Boolean))).sort();
  const phases = Array.from(new Set(list.map((m) => m.phase).filter(Boolean))).sort();

  characters.forEach((character) => {
    characterFilter.insertAdjacentHTML('beforeend', `<option value="${character}">${character}</option>`);
  });

  phases.forEach((phase) => {
    phaseFilter.insertAdjacentHTML('beforeend', `<option value="${phase}">${phase}</option>`);
  });
}

function applyFiltersAndSort() {
  const sortBy = sortSelect.value;
  const character = characterFilter.value;
  const phase = phaseFilter.value;

  let filtered = [...movies];

  if (character !== 'all') {
    filtered = filtered.filter((movie) => movie.main_character === character);
  }

  if (phase !== 'all') {
    filtered = filtered.filter((movie) => movie.phase === phase);
  }

  filtered.sort((a, b) => {
    if (sortBy === 'chronological') {
      return a.chronological_order - b.chronological_order;
    }
    return new Date(a.release_date) - new Date(b.release_date);
  });

  renderMovies(filtered);
}

function renderMovies(list) {
  if (!list.length) {
    galleryEl.innerHTML = '';
    emptyStateEl.classList.remove('d-none');
    return;
  }

  emptyStateEl.classList.add('d-none');
  const cards = list
    .map(
      (movie) => `
        <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
          <div class="movie-card h-100">
            <img src="${movie.poster_url || PLACEHOLDER_POSTER}" alt="Poster for ${movie.title}" onerror="this.onerror=null;this.src='${PLACEHOLDER_POSTER}';">
            <div class="p-3 d-flex flex-column gap-2">
              <div class="d-flex justify-content-between align-items-center">
                <span class="badge badge-phase">${movie.phase}</span>
                <span class="badge badge-character">${movie.main_character || 'MCU'}</span>
              </div>
              <h5 class="mb-1">${movie.title}</h5>
              <div class="movie-meta">
                <div>Release: ${formatDate(movie.release_date)}</div>
                <div>Story Order: #${movie.chronological_order}</div>
              </div>
            </div>
          </div>
        </div>
      `
    )
    .join('');

  galleryEl.innerHTML = cards;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
