const state = {
  role: "customer",
  shops: [
    {
      id: 1,
      name: "Bean Harbor",
      city: "Cebu City",
      ambience: ["Quiet", "Study"],
      owner: "Mara Santos",
      rating: 4.8,
      image: "assets/coffee-lounge.png",
      description: "Soft seats, natural light, and reliable Wi-Fi for long study sessions.",
      comments: [
        { name: "Jessa", text: "The matcha latte is excellent and the staff are welcoming." },
        { name: "Nico", text: "Good sockets and calm music." }
      ]
    },
    {
      id: 2,
      name: "Roast District",
      city: "Makati",
      ambience: ["Live music", "Pet friendly"],
      owner: "Leo Cruz",
      rating: 4.6,
      image: "assets/coffee-counter.png",
      description: "Evening acoustic sets, open counter seating, and weekend pop-ups.",
      comments: [{ name: "Ari", text: "Great place to meet friends after work." }]
    },
    {
      id: 3,
      name: "Daily Grind Studio",
      city: "Quezon City",
      ambience: ["Study", "Quiet"],
      owner: "Sam Rivera",
      rating: 4.9,
      image: "assets/coffee-hero.png",
      description: "A small espresso bar with photo-worthy corners and focused tables.",
      comments: [{ name: "Mika", text: "Their cold brew is smooth and strong." }]
    }
  ],
  jobs: [
    { id: 1, shop: "Bean Harbor", role: "Barista", city: "Cebu City", shift: "Morning", pay: "PHP 520/day", applicants: 8 },
    { id: 2, shop: "Roast District", role: "Bartender", city: "Makati", shift: "Evening", pay: "PHP 650/day", applicants: 5 },
    { id: 3, shop: "Daily Grind Studio", role: "Cashier", city: "Quezon City", shift: "Flexible", pay: "PHP 500/day", applicants: 3 }
  ],
  users: [
    { name: "Rhea Admin", role: "Admin", status: "Active" },
    { name: "Mara Santos", role: "Owner", status: "Verified" },
    { name: "Jun Pelaez", role: "Employee", status: "Applicant" },
    { name: "Jessa Lim", role: "Customer", status: "Active" }
  ],
  transactions: [
    { label: "Featured shop package", amount: 2500, status: "Paid" },
    { label: "Hiring post boost", amount: 900, status: "Paid" },
    { label: "Owner verification", amount: 350, status: "Pending" }
  ],
  applications: []
};

const roleNames = {
  superadmin: "Super Admin",
  admin: "Admin",
  owner: "Owner",
  employee: "Employee",
  customer: "Customer"
};

const shopGrid = document.querySelector("#shopGrid");
const jobList = document.querySelector("#jobList");
const roleSelect = document.querySelector("#roleSelect");
const shopSearch = document.querySelector("#shopSearch");
const jobSearch = document.querySelector("#jobSearch");
const ambienceFilter = document.querySelector("#ambienceFilter");
const workspacePanel = document.querySelector("#workspacePanel");
const workspaceTitle = document.querySelector("#workspaceTitle");
const roleBadge = document.querySelector("#roleBadge");
const commentDialog = document.querySelector("#commentDialog");
const commentForm = document.querySelector("#commentForm");
const closeComment = document.querySelector("#closeComment");
let activeShopId = null;

function money(value) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(value);
}

function renderStats() {
  document.querySelector("#shopCount").textContent = state.shops.length;
  document.querySelector("#jobCount").textContent = state.jobs.length;
  document.querySelector("#userCount").textContent = state.users.length;
  document.querySelector("#transactionTotal").textContent = money(state.transactions.reduce((sum, item) => sum + item.amount, 0));
}

function renderShops() {
  const query = shopSearch.value.trim().toLowerCase();
  const ambience = ambienceFilter.value;
  const shops = state.shops.filter((shop) => {
    const text = `${shop.name} ${shop.city} ${shop.description} ${shop.ambience.join(" ")}`.toLowerCase();
    const matchesQuery = !query || text.includes(query);
    const matchesAmbience = ambience === "all" || shop.ambience.includes(ambience);
    return matchesQuery && matchesAmbience;
  });

  shopGrid.innerHTML = shops.map((shop) => `
    <article class="shop-card">
      <img src="${shop.image}" alt="${shop.name} ambience" />
      <div class="shop-body">
        <div class="shop-meta">
          <span class="rating">${shop.rating.toFixed(1)} rating</span>
          <span class="muted">${shop.city}</span>
        </div>
        <h3>${shop.name}</h3>
        <p class="muted">${shop.description}</p>
        <div class="tag-row">${shop.ambience.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
        <div class="comments">
          ${shop.comments.slice(-2).map((comment) => `
            <div class="comment"><strong>${comment.name}</strong><span>${comment.text}</span></div>
          `).join("")}
        </div>
        <div class="card-actions">
          <button class="button primary" data-comment="${shop.id}">Comment</button>
          <a class="button ghost" href="#jobs">See jobs</a>
        </div>
      </div>
    </article>
  `).join("") || `<p class="muted">No coffee shops match the current filters.</p>`;
}

function renderJobs() {
  const query = jobSearch.value.trim().toLowerCase();
  const jobs = state.jobs.filter((job) => `${job.shop} ${job.role} ${job.city}`.toLowerCase().includes(query));
  jobList.innerHTML = jobs.map((job) => `
    <article class="job-card">
      <div>
        <span class="tag clay">${job.shift} shift</span>
        <h3>${job.role}</h3>
        <p class="muted">${job.shop} - ${job.city}</p>
      </div>
      <div class="job-meta">
        <span class="tag">${job.pay}</span>
        <span class="tag">${job.applicants} applicants</span>
      </div>
      <button class="button primary" data-apply="${job.id}">Apply now</button>
    </article>
  `).join("") || `<p class="muted">No jobs match your search.</p>`;
}

function panel(title, body) {
  return `<article class="panel"><h3>${title}</h3>${body}</article>`;
}

function renderWorkspace() {
  const roleLabel = roleNames[state.role];
  workspaceTitle.textContent = `${roleLabel} tools`;
  roleBadge.textContent = roleLabel;

  const usersList = state.users.map((user) => `
    <div class="admin-row">
      <div><strong>${user.name}</strong><div class="muted">${user.role}</div></div>
      <span class="tag">${user.status}</span>
    </div>
  `).join("");

  const transactionList = state.transactions.map((item) => `
    <div class="admin-row">
      <div><strong>${item.label}</strong><div class="muted">${item.status}</div></div>
      <span>${money(item.amount)}</span>
    </div>
  `).join("");

  const shopForm = `
    <form id="shopForm">
      <input name="name" required placeholder="Coffee shop name" />
      <input name="city" required placeholder="Location" />
      <input name="description" required placeholder="Ambience description" />
      <select name="ambience">
        <option>Quiet</option>
        <option>Study</option>
        <option>Live music</option>
        <option>Pet friendly</option>
      </select>
      <button class="button primary">Post coffee shop</button>
    </form>
  `;

  const jobForm = `
    <form id="jobForm">
      <input name="shop" required placeholder="Coffee shop" />
      <input name="role" required placeholder="Job role" />
      <input name="city" required placeholder="Location" />
      <input name="pay" required placeholder="Pay rate" />
      <button class="button primary">Post job</button>
    </form>
  `;

  const applicationList = state.applications.length
    ? state.applications.map((item) => `<div class="admin-row"><strong>${item.role}</strong><span class="tag">${item.shop}</span></div>`).join("")
    : `<p class="muted">Applications appear here after an employee applies for work.</p>`;

  const ownerEmployees = panel("Employee management", `
    <div class="mini-grid">
      <div class="mini-card"><strong>12</strong><p class="muted">Active staff</p></div>
      <div class="mini-card"><strong>4</strong><p class="muted">Pending applicants</p></div>
    </div>
    <div class="admin-row"><strong>Jun Pelaez</strong><span class="tag">Interview</span></div>
    <div class="admin-row"><strong>Kaye Mercado</strong><span class="tag">Training</span></div>
  `);

  const customerPanel = panel("Customer activity", `
    <p class="muted">Browse coffee shops and leave comments on ambience, service, drinks, and location.</p>
    <a class="button primary" href="#shops">Go to coffee shops</a>
  `);

  const workspaceByRole = {
    superadmin: [
      panel("Manage all users", usersList),
      panel("Manage all transactions", transactionList)
    ],
    admin: [
      panel("Manage users and owners", usersList),
      panel("Review coffee shop posts", state.shops.map((shop) => `<div class="admin-row"><strong>${shop.name}</strong><span class="tag">${shop.city}</span></div>`).join(""))
    ],
    owner: [
      panel("Post coffee shop ambience", shopForm),
      panel("Post hiring need", jobForm),
      ownerEmployees
    ],
    employee: [
      panel("Job applications", applicationList),
      panel("Suggested work", state.jobs.map((job) => `<div class="admin-row"><strong>${job.role}</strong><span class="tag">${job.city}</span></div>`).join(""))
    ],
    customer: [
      customerPanel,
      panel("Recent community comments", state.shops.flatMap((shop) => shop.comments.map((comment) => `<div class="comment"><strong>${comment.name} on ${shop.name}</strong><span>${comment.text}</span></div>`)).join(""))
    ]
  };

  workspacePanel.innerHTML = workspaceByRole[state.role].join("");
}

function bindDynamicActions() {
  document.body.addEventListener("click", (event) => {
    const commentButton = event.target.closest("[data-comment]");
    const applyButton = event.target.closest("[data-apply]");
    if (commentButton) {
      activeShopId = Number(commentButton.dataset.comment);
      const shop = state.shops.find((item) => item.id === activeShopId);
      document.querySelector("#commentTitle").textContent = `Comment on ${shop.name}`;
      commentDialog.showModal();
    }
    if (applyButton) {
      const job = state.jobs.find((item) => item.id === Number(applyButton.dataset.apply));
      job.applicants += 1;
      state.applications.push({ role: job.role, shop: job.shop });
      state.role = "employee";
      roleSelect.value = "employee";
      renderAll();
      document.querySelector("#workspace").scrollIntoView({ behavior: "smooth" });
    }
  });

  workspacePanel.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);
    if (form.id === "shopForm") {
      state.shops.unshift({
        id: Date.now(),
        name: data.get("name"),
        city: data.get("city"),
        ambience: [data.get("ambience")],
        owner: "Current Owner",
        rating: 4.7,
        image: "assets/coffee-counter.png",
        description: data.get("description"),
        comments: []
      });
    }
    if (form.id === "jobForm") {
      state.jobs.unshift({
        id: Date.now(),
        shop: data.get("shop"),
        role: data.get("role"),
        city: data.get("city"),
        shift: "Flexible",
        pay: data.get("pay"),
        applicants: 0
      });
    }
    form.reset();
    renderAll();
  });
}

commentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const shop = state.shops.find((item) => item.id === activeShopId);
  shop.comments.push({
    name: document.querySelector("#commentName").value,
    text: document.querySelector("#commentText").value
  });
  commentForm.reset();
  commentDialog.close();
  renderAll();
});

closeComment.addEventListener("click", () => {
  commentForm.reset();
  commentDialog.close();
});

roleSelect.addEventListener("change", (event) => {
  state.role = event.target.value;
  renderWorkspace();
});

shopSearch.addEventListener("input", renderShops);
jobSearch.addEventListener("input", renderJobs);
ambienceFilter.addEventListener("change", renderShops);

function renderAll() {
  renderStats();
  renderShops();
  renderJobs();
  renderWorkspace();
}

bindDynamicActions();
renderAll();
