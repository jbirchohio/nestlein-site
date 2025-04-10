import Fuse from 'https://cdn.skypack.dev/fuse.js';

const locations = JSON.parse(document.getElementById("location-data").textContent);
const container = document.getElementById("dynamic-sections");
const search = document.getElementById("search");
const distanceSelect = document.getElementById("distance-filter");

const fuse = new Fuse(locations, {
  keys: ['name', 'tags', 'address'],
  threshold: 0.35,
});

const tagColors = {
  'Coffee Shop': 'bg-yellow-100 text-yellow-700',
  'Study Spot': 'bg-blue-100 text-blue-700',
  'LGBTQ+ Friendly': 'bg-pink-100 text-pink-700',
  'Family-Friendly': 'bg-green-100 text-green-700',
  'Casual Dining': 'bg-red-100 text-red-700',
  'Quiet Space': 'bg-purple-100 text-purple-700',
  'Wi-Fi': 'bg-indigo-100 text-indigo-700',
  'Drive-Thru': 'bg-orange-200 text-orange-800',
  'Good for Groups': 'bg-lime-100 text-lime-700',
  'Black-Owned': 'bg-black text-white',
  'Vegan Options': 'bg-emerald-100 text-emerald-700',
  'Breakfast Spot': 'bg-amber-100 text-amber-700',
  'Trendy Cafe': 'bg-fuchsia-100 text-fuchsia-700',
  'Solo Dining': 'bg-cyan-100 text-cyan-700',
};

function getTagColor(tag) {
  return tagColors[tag] || 'bg-orange-100 text-orange-700';
}

function renderCards(data) {
  const cards = data.map(loc => {
    const statusIcon = loc.status?.status === 'open' ? '🟢' : loc.status?.status === 'closed' ? '🔴' : '🟡';
    const statusText = loc.status?.text || 'Unknown';

    return `
      <a href="/locations/${loc.slug}" class="flip-card block relative w-full max-w-sm h-[420px] mx-auto group [perspective:1000px]">
        <div class="flip-inner w-full h-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:rotate-y-180">
          <!-- Front -->
          <div class="card-front absolute inset-0 backface-hidden rounded-xl border border-orange-100 bg-white shadow overflow-hidden z-10">
            ${loc.logo_url ? `<img src="${loc.logo_url}" alt="${loc.name}" class="w-full h-40 object-cover" />` : ""}
            <div class="p-4 relative h-[calc(100%-10rem)]">
              <h3 class="text-xl font-bold text-orange-800 bg-white/80 px-2 py-0.5 rounded-md inline-block absolute top-2 left-2">${loc.name}</h3>
              <div class="absolute bottom-2 right-2 bg-white/90 px-3 py-0.5 rounded-full text-xs font-semibold border border-orange-200 shadow">
                ${statusIcon} ${statusText}
              </div>
            </div>
          </div>

          <!-- Back -->
          <div class="card-back absolute inset-0 backface-hidden rotate-y-180 rounded-xl bg-white shadow border border-orange-100 overflow-hidden z-0">
            <div class="p-4 flex flex-col justify-between h-full space-y-2 text-sm text-gray-800">
              <div>
                <p class="text-gray-600 font-medium truncate">${loc.address || ''}</p>
                <p class="flex items-center gap-2 mt-1">
                  <svg class="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2l2.9 6.26L22 9.27l-5.5 5.36L18.8 22 12 18.27 5.2 22l1.3-7.37L1 9.27l7.1-1.01L12 2z"/></svg>
                  <span class="font-medium">${loc.restaurant_score || 0}/10</span>
                </p>
                <p class="flex items-center gap-2 mt-1">
                  <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></path></svg>
                  <span>${loc.best_time_to_work_remotely || ''}</span>
                </p>
              </div>
              <div class="flex flex-wrap gap-1">
                ${(loc.tags || []).map(tag => `<span class="text-xs ${getTagColor(tag)} px-2 py-0.5 rounded-full">${tag}</span>`).join('')}
              </div>
            </div>
          </div>
        </div>
      </a>
    `;
  }).join("");

  container.innerHTML = cards;

  // Tap to flip behavior for mobile
  document.querySelectorAll('.flip-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (window.innerWidth < 768) {
        e.preventDefault();
        card.querySelector('.flip-inner').classList.toggle('rotate-y-180');
      }
    });
  });
}

function filter() {
  const q = search.value.trim();
  let results = q ? fuse.search(q).map(r => r.item) : locations;
  renderCards(results);
}

search.addEventListener("input", filter);
distanceSelect.addEventListener("change", filter);

renderCards(locations);
