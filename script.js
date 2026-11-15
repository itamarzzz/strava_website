const initialActivities = [
  {
    id: 1,
    athlete: "Itamar Zehavy",
    initials: "IZ",
    avatarColor: "#fc5200",
    timeAgo: "Today at 06:45 AM • Haifa, Israel",
    sport: "Run",
    title: "Haifa Coastal Tempo Run",
    description: "Negative splits along Bat Galim promenade. Felt smooth in the Adios Pro 4s.",
    distance: 12.4,
    durationMin: 59,
    elevation: 84,
    kudos: 18,
    kudoed: false,
    routePoints: "30,130 95,115 165,95 245,82 325,65 410,48 490,35",
    comments: [
      { author: "Eitan Zehavy", text: "Strong pace! Ready for the half marathon." }
    ]
  },
  {
    id: 2,
    athlete: "Eitan Zehavy",
    initials: "EZ",
    avatarColor: "#2563eb",
    timeAgo: "Yesterday at 05:30 PM • Mount Carmel",
    sport: "Run",
    title: "Carmel Forest Ridge Trail",
    description: "Steady aerobic hill climbs before sunset.",
    distance: 10.0,
    durationMin: 52,
    elevation: 240,
    kudos: 14,
    kudoed: true,
    routePoints: "40,140 110,90 180,115 260,45 340,70 430,30 480,55",
    comments: []
  },
  {
    id: 3,
    athlete: "Noa Ben-David",
    initials: "NB",
    avatarColor: "#0d9488",
    timeAgo: "2 days ago • Jezreel Valley",
    sport: "Ride",
    title: "Morning Endurance Road Ride",
    description: "Fast group spin with low wind.",
    distance: 42.5,
    durationMin: 86,
    elevation: 390,
    kudos: 24,
    kudoed: false,
    routePoints: "35,60 120,40 210,85 290,125 390,95 475,50",
    comments: []
  },
  {
    id: 4,
    athlete: "Itamar Zehavy",
    initials: "IZ",
    avatarColor: "#fc5200",
    timeAgo: "3 days ago • Haifa",
    sport: "Strength",
    title: "Upper Body Heavy Pull & Press",
    description: "Weighted pull-ups (+25kg) and bench press progression.",
    distance: 0,
    durationMin: 65,
    elevation: 0,
    kudos: 11,
    kudoed: false,
    routePoints: "",
    comments: []
  }
];

let activities = JSON.parse(localStorage.getItem("stravaCloneActivities")) || initialActivities;
let activeFilter = "ALL";
let searchQuery = "";

const sportIcons = {
  Run: "🏃",
  Ride: "🚴",
  Strength: "🏋️"
};

function saveActivities() {
  localStorage.setItem("stravaCloneActivities", JSON.stringify(activities));
}

function formatDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatPaceOrSpeed(act) {
  if (act.distance <= 0) return { label: "Calories", value: `${Math.round(act.durationMin * 7.5)} kcal` };
  if (act.sport === "Ride") {
    const speed = (act.distance / (act.durationMin / 60)).toFixed(1);
    return { label: "Avg Speed", value: `${speed} km/h` };
  }
  const totalSec = act.durationMin * 60;
  const paceSec = Math.round(totalSec / act.distance);
  const min = Math.floor(paceSec / 60);
  const sec = String(paceSec % 60).padStart(2, "0");
  return { label: "Pace", value: `${min}:${sec} /km` };
}

function updateSidebarStats() {
  const userActs = activities.filter(a => a.athlete === "Itamar Zehavy");
  document.getElementById("totalActivitiesCount").textContent = userActs.length;

  if (userActs.length > 0) {
    document.getElementById("latestActivitySummary").innerHTML =
      `<strong>${userActs[0].title}</strong> • ${userActs[0].sport}`;
  }

  const runKm = userActs
    .filter(a => a.sport === "Run")
    .reduce((sum, a) => sum + Number(a.distance), 0);

  const goal = 40.0;
  const pct = Math.min(100, (runKm / goal) * 100);
  const remaining = Math.max(0, goal - runKm).toFixed(1);

  document.getElementById("weeklyKmText").textContent = `${runKm.toFixed(1)} km`;
  document.getElementById("weeklyProgressBar").style.width = `${pct}%`;
  document.getElementById("goalRemainingText").textContent =
    remaining > 0 ? `${remaining} km remaining to hit your weekly target` : "Weekly goal achieved! 🎉";
}

function renderFeed() {
  const feedEl = document.getElementById("activityFeed");
  const filtered = activities.filter(act => {
    const matchesSport = activeFilter === "ALL" || act.sport === activeFilter;
    const text = `${act.athlete} ${act.title} ${act.description} ${act.sport}`.toLowerCase();
    const matchesQuery = text.includes(searchQuery.toLowerCase());
    return matchesSport && matchesQuery;
  });

  document.getElementById("feedCountLabel").textContent =
    `Showing ${filtered.length} ${filtered.length === 1 ? "activity" : "activities"}`;

  if (filtered.length === 0) {
    feedEl.innerHTML = `<div class="card activity-card"><p>No matching activities found.</p></div>`;
    return;
  }

  feedEl.innerHTML = filtered.map(act => {
    const thirdMetric = formatPaceOrSpeed(act);
    const pointsArray = act.routePoints ? act.routePoints.split(" ") : [];
    const startPt = pointsArray[0] ? pointsArray[0].split(",") : null;
    const endPt = pointsArray.length ? pointsArray[pointsArray.length - 1].split(",") : null;

    const mapHtml = act.routePoints ? `
      <div class="route-map-wrap">
        <svg viewBox="0 0 520 175" preserveAspectRatio="none">
          <defs>
            <pattern id="grid-${act.id}" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#dce3d0" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="520" height="175" fill="url(#grid-${act.id})" />
          <polyline fill="none" stroke="#fc5200" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" points="${act.routePoints}" />
          ${startPt ? `<circle cx="${startPt[0]}" cy="${startPt[1]}" r="5" fill="#22c55e" stroke="#fff" stroke-width="2" />` : ""}
          ${endPt ? `<circle cx="${endPt[0]}" cy="${endPt[1]}" r="5" fill="#111827" stroke="#fff" stroke-width="2" />` : ""}
        </svg>
        <span class="map-badge">GPS Route • ${act.elevation}m Elev Gain</span>
      </div>
    ` : "";

    const commentsHtml = act.comments.map(c =>
      `<div class="comment-item"><strong>${c.author}:</strong> ${c.text}</div>`
    ).join("");

    return `
      <article class="card activity-card">
        <div class="act-header">
          <div class="avatar md" style="background:${act.avatarColor}">${act.initials}</div>
          <div class="act-meta">
            <h4>${act.athlete}</h4>
            <span>${act.timeAgo}</span>
          </div>
        </div>

        <div class="act-title-row">
          <span class="sport-icon">${sportIcons[act.sport] || "⚡"}</span>
          <h3 class="act-title">${act.title}</h3>
        </div>
        ${act.description ? `<p class="act-desc">${act.description}</p>` : ""}

        <div class="act-metrics">
          ${act.distance > 0 ? `
            <div class="metric-item">
              <span>Distance</span>
              <strong>${Number(act.distance).toFixed(1)} km</strong>
            </div>
          ` : ""}
          <div class="metric-item">
            <span>Time</span>
            <strong>${formatDuration(act.durationMin)}</strong>
          </div>
          <div class="metric-item">
            <span>${thirdMetric.label}</span>
            <strong>${thirdMetric.value}</strong>
          </div>
        </div>

        ${mapHtml}

        <div class="act-footer">
          <span class="kudos-summary">${act.kudos} kudos • ${act.comments.length} comments</span>
          <div class="social-btns">
            <button class="social-btn ${act.kudoed ? "kudoed" : ""}" data-kudo="${act.id}">
              👍 ${act.kudoed ? "Kudoed" : "Give Kudos"}
            </button>
          </div>
        </div>

        <div class="comments-section">
          ${commentsHtml}
          <form class="comment-form" data-comment-form="${act.id}">
            <input type="text" placeholder="Add a comment..." required />
            <button type="submit" class="btn-outline">Post</button>
          </form>
        </div>
      </article>
    `;
  }).join("");
}

// Filter & Search Listeners
document.querySelectorAll("[data-filter]").forEach(btn => {
  btn.addEventListener("click", () => {
    activeFilter = btn.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach(b => {
      b.classList.toggle("active", b.dataset.filter === activeFilter);
    });
    renderFeed();
  });
});

document.getElementById("searchInput").addEventListener("input", e => {
  searchQuery = e.target.value;
  renderFeed();
});

// Kudos & Comment Delegation
document.getElementById("activityFeed").addEventListener("click", e => {
  const kudoBtn = e.target.closest("[data-kudo]");
  if (kudoBtn) {
    const id = Number(kudoBtn.dataset.kudo);
    const act = activities.find(a => a.id === id);
    if (act) {
      act.kudoed = !act.kudoed;
      act.kudos += act.kudoed ? 1 : -1;
      saveActivities();
      renderFeed();
    }
  }
});

document.getElementById("activityFeed").addEventListener("submit", e => {
  const form = e.target.closest("[data-comment-form]");
  if (form) {
    e.preventDefault();
    const id = Number(form.dataset.commentForm);
    const input = form.querySelector("input");
    const text = input.value.trim();
    if (!text) return;
    const act = activities.find(a => a.id === id);
    if (act) {
      act.comments.push({ author: "Itamar Zehavy", text });
      saveActivities();
      renderFeed();
    }
  }
});

// Challenge Button
document.getElementById("joinChallengeBtn").addEventListener("click", function () {
  const joined = this.classList.toggle("joined");
  this.textContent = joined ? "✓ Challenge Joined" : "Join Challenge";
});

// Modal Controls
const modal = document.getElementById("activityModal");
document.getElementById("openModalBtn").addEventListener("click", () => { modal.hidden = false; });
document.getElementById("closeModalBtn").addEventListener("click", () => { modal.hidden = true; });
document.getElementById("cancelModalBtn").addEventListener("click", () => { modal.hidden = true; });

document.getElementById("activityForm").addEventListener("submit", e => {
  e.preventDefault();
  const sport = document.getElementById("sportInput").value;
  const distance = parseFloat(document.getElementById("distanceInput").value) || 0;
  const durationMin = parseInt(document.getElementById("durationInput").value, 10) || 30;
  const elevation = parseInt(document.getElementById("elevationInput").value, 10) || 0;
  const title = document.getElementById("titleInput").value.trim();
  const description = document.getElementById("descInput").value.trim();

  const newActivity = {
    id: Date.now(),
    athlete: "Itamar Zehavy",
    initials: "IZ",
    avatarColor: "#fc5200",
    timeAgo: "Just now • Haifa, Israel",
    sport,
    title,
    description,
    distance: sport === "Strength" ? 0 : distance,
    durationMin,
    elevation,
    kudos: 1,
    kudoed: true,
    routePoints: sport === "Strength" ? "" : "30,120 115,85 205,105 300,50 395,70 490,35",
    comments: []
  };

  activities.unshift(newActivity);
  saveActivities();
  updateSidebarStats();
  renderFeed();
  e.target.reset();
  modal.hidden = true;
});

// Initial Render
updateSidebarStats();
renderFeed();
