import Fuse from "https://cdn.jsdelivr.net/npm/fuse.js@7.1.0/+esm";

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}

document.addEventListener("DOMContentLoaded", () => {
  const locations = JSON.parse(document.getElementById("location-data").textContent);
  const container = document.getElementById("dynamic-sections");
  const search = document.getElementById("search");
  const distanceSelect = document.getElementById("distance-filter");
  const pillContainer = document.getElementById("tag-pills");
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  const fuse = new Fuse(locations, {
    keys: ['name', 'tags', 'address'],
    threshold: 0.35
  });

  function renderCards(data) {
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    const time = now.getHours() + now.getMinutes() / 60;

    const cards = data.map(loc => {
      const status = getOpenStatus(loc.hours_of_operation, day, time);
      const hours = escapeHTML(loc.hours_of_operation || 'Unknown hours');
      const statustext = escapeHTML(status.text);
      const tags = (loc.tags || []).map(tag => `<span class="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">${escapeHTML(tag)}</span>`).join("");

      console.log("Rendering Card:", loc.name, "Status:", statustext); // Logging for debugging

      return `
        <div class="perspective w-full max-w-sm mx-auto">
          <div class="relative flip-card transition-transform duration-500 transform-style-preserve-3d w-full h-full ${isTouch ? 'tap-flip' : 'group'}">
            <div class="flip-card-inner">
              <!-- Front -->
              <div class="card-front absolute inset-0 backface-hidden rounded-xl border border-orange-100 bg-white shadow overflow-hidden">
                ${loc.logo_url ? \`<img src="${escapeHTML(loc.logo_url)}" alt="${escapeHTML(loc.name)}" class="w-full h-40 object-cover">\` : ''}
                <div class="p-4 relative">
                  <h3 class="text-lg font-bold text-orange-800">${escapeHTML(loc.name)}</h3>
                  <div class="absolute bottom-2 right-2 bg-white/80 px-3 py-0.5 rounded-full text-xs font-semibold border border-orange-200 shadow" title="${hours}">
                    ${status.status === 'open' ? '🟢' : '🔴'} ${statustext}
                  </div>
                </div>
              </div>

              <!-- Back -->
              <div class="card-back absolute inset-0 backface-hidden rotate-y-180 rounded-xl p-4 bg-orange-50 flex flex-col justify-center space-y-2 text-sm text-gray-800">
                <p class="text-gray-600">${escapeHTML(loc.address || '')}</p>
                <p class="flex items-center gap-2">
                  <svg class="icon-sm text-yellow-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2l2.9 6.26L22 9.27l-5.5 5.36L18.8 22 12 18.27 5.2 22l1.3-7.37L1 9.27l7.1-1.01L12 2z"/></svg>
                  ${loc.restaurant_score || 0}/10
                </p>
                <p class="flex items-center gap-2">
                  <svg class="icon-sm text-orange-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                  ${escapeHTML(loc.best_time_to_work_remotely || '')}
                </p>
                <div class="flex flex-wrap gap-1">${tags}</div>
                <a href="/locations/${loc.slug}" class="text-orange-700 underline text-xs mt-2">View Details</a>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");

    container.innerHTML = cards;

    if (isTouch) {
      document.querySelectorAll(".tap-flip").forEach(card => {
        card.addEventListener("click", () => {
          card.classList.toggle("rotate-y-180");
        });
      });
    } else {
      document.querySelectorAll(".group").forEach(card => {
        card.addEventListener("mouseenter", () => card.classList.add("rotate-y-180"));
        card.addEventListener("mouseleave", () => card.classList.remove("rotate-y-180"));
      });
    }
  }

  function getOpenStatus(str, day, now) {
    if (!str || !coversDay(str.toLowerCase(), day.toLowerCase())) return { status: 'unknown', text: 'Unknown' };
    const m = str.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?\s*to\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
    if (!m) return { status: 'unknown', text: 'Unknown' };
    const to24 = (h, m, p) => (p?.toUpperCase() === 'PM' && h !== 12 ? h + 12 : h === 12 && p?.toUpperCase() === 'AM' ? 0 : h) + m / 60;
    const [_, h1, m1 = '0', ampm1, h2, m2 = '0', ampm2] = m;
    const open = to24(+h1, +m1, ampm1);
    const close = to24(+h2, +m2, ampm2);
    return now >= open && now <= close
      ? { status: 'open', text: `until ${formatTime(close)}` }
      : { status: 'closed', text: `opens at ${formatTime(open)}` };
  }

  function coversDay(text, day) {
    const w = ['monday','tuesday','wednesday','thursday','friday'];
    const e = ['saturday','sunday'];
    return text.includes(day) || text.includes('every day') || text.includes('daily') ||
           text.includes('monday through sunday') || text.includes('monday - sunday') ||
           (text.includes('weekdays') && w.includes(day)) || (text.includes('weekends') && e.includes(day));
  }

  function formatTime(decimal) {
    const h = Math.floor(decimal), m = Math.round((decimal - h) * 60);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = ((h + 11) % 12 + 1);
    return `${hr}${m > 0 ? ':' + m.toString().padStart(2, '0') : ''} ${ampm}`;
  }

  function filter() {
    const q = search.value.trim();
    const max = parseInt(distanceSelect.value);
    let results = q ? fuse.search(q).map(r => r.item) : locations;
    renderCards(results);
  }

  const allTags = [...new Set(locations.flatMap(l => l.tags || []))];
  const random = allTags.sort(() => 0.5 - Math.random()).slice(0, 3);
  pillContainer.innerHTML = random.map(tag =>
    `<button class="tag-pill bg-white border border-orange-300 text-orange-600 px-4 py-1 rounded-full text-sm hover:bg-orange-200 transition" data-tag="${escapeHTML(tag)}">${escapeHTML(tag)}</button>`
  ).join("");

  pillContainer.querySelectorAll(".tag-pill").forEach(btn => {
    btn.addEventListener("click", () => {
      search.value = btn.dataset.tag;
      filter();
    });
  });

  search.addEventListener("input", filter);
  distanceSelect.addEventListener("change", filter);
  filter();
});