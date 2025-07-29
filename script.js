// Data structure
let categories = {
  "Company Searches": [
    { name: "Companies House", url: "https://find-and-update.company-information.service.gov.uk/" }
  ],
  "Court Case Searches": [
    { name: "CaseMine", url: "https://www.casemine.com/" }
  ],
  "Occupation Registers": [
    { name: "GDC UK", url: "https://www.gdc-uk.org/pages/searchregisters.aspx" },
    { name: "NMC", url: "https://www.nmc.org.uk/registration/search-the-register/" },
    { name: "GMC", url: "https://www.gmc-uk.org/registration-and-licensing/the-medical-register" },
    { name: "Solicitors Regulation Authority (SRA)", url: "https://www.sra.org.uk/consumers/register/" },
    { name: "ICO", url: "https://ico.org.uk/about-the-ico/contact-us/register-of-data-controllers/" }
  ],
  "Social Media": [
    { name: "LinkedIn", url: "https://www.linkedin.com/" },
    { name: "Facebook", url: "https://www.facebook.com/" }
  ]
};

const categoriesContainer = document.getElementById("categoriesContainer");
const manageCategoriesContainer = document.getElementById("manageCategoriesContainer");
const categorySelectForWebsites = document.getElementById("categorySelectForWebsites");
const newCategoryInput = document.getElementById("newCategoryInput");
const addCategoryBtn = document.getElementById("addCategoryBtn");
const newWebsiteName = document.getElementById("newWebsiteName");
const newWebsiteURL = document.getElementById("newWebsiteURL");
const addWebsiteBtn = document.getElementById("addWebsiteBtn");
const searchBtn = document.getElementById("searchBtn");
const keywordInput = document.getElementById("keywordInput");
const resultsContainer = document.getElementById("resultsContainer");
const exportReportBtn = document.getElementById("exportReportBtn");
const imageUploadInput = document.getElementById("imageUpload");
const imageSearchEngines = document.getElementById("imageSearchEngines");
const savedCasesContainer = document.getElementById("savedCasesContainer");
const searchSavedCasesInput = document.getElementById("searchSavedCases");
const clearSavedCasesBtn = document.getElementById("clearSavedCasesBtn");
const linkedinLocationInput = document.getElementById("linkedinLocation");
const linkedinJobTitleInput = document.getElementById("linkedinJobTitle");

// Store saved cases in localStorage key
const SAVED_CASES_KEY = "osint_saved_cases";

// --- Helper functions ---

function saveCasesToStorage(cases) {
  localStorage.setItem(SAVED_CASES_KEY, JSON.stringify(cases));
}

function loadSavedCases() {
  const saved = localStorage.getItem(SAVED_CASES_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

function renderSavedCases(filterText = "") {
  savedCasesContainer.innerHTML = "";
  const savedCases = loadSavedCases();

  const filteredCases = savedCases.filter(c =>
    c.keyword.toLowerCase().includes(filterText.toLowerCase())
  );

  if (filteredCases.length === 0) {
    savedCasesContainer.textContent = "No saved cases.";
    return;
  }

  filteredCases.forEach((c, idx) => {
    const div = document.createElement("div");
    div.className = "saved-case-item";
    div.innerHTML = `<strong>${c.keyword}</strong> - ${new Date(c.date).toLocaleString()}
      <button data-idx="${idx}" class="btn-brand btn-small load-case-btn">Load</button>
      <button data-idx="${idx}" class="btn-small delete-case-btn" style="background:#cc4444; margin-left: 10px;">Delete</button>`;
    savedCasesContainer.appendChild(div);
  });

  // Add listeners to load and delete buttons
  document.querySelectorAll(".load-case-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.idx, 10);
      loadCaseIntoSearch(filteredCases[idx]);
    });
  });
  document.querySelectorAll(".delete-case-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.idx, 10);
      deleteSavedCase(filteredCases[idx]);
    });
  });
}

function loadCaseIntoSearch(savedCase) {
  keywordInput.value = savedCase.keyword;
  // Restore selected websites by clearing all first
  categoriesContainer.querySelectorAll("input[type=checkbox]").forEach(cb => cb.checked = false);
  savedCase.selectedWebsites.forEach(sel => {
    const checkboxes = categoriesContainer.querySelectorAll(`input[data-category="${sel.category}"]`);
    checkboxes.forEach(cb => {
      if (parseInt(cb.dataset.index, 10) === sel.index) cb.checked = true;
    });
  });
  resultsContainer.innerHTML = savedCase.resultsHTML || "";
  alert("Case loaded into search. You can modify and search again.");
}

function deleteSavedCase(savedCase) {
  let savedCases = loadSavedCases();
  savedCases = savedCases.filter(c => c.date !== savedCase.date);
  saveCasesToStorage(savedCases);
  renderSavedCases(searchSavedCasesInput.value);
}

function saveCurrentCase(keyword, selectedWebsites, resultsHTML) {
  const savedCases = loadSavedCases();
  savedCases.push({
    keyword,
    selectedWebsites,
    resultsHTML,
    date: new Date().toISOString()
  });
  saveCasesToStorage(savedCases);
  renderSavedCases(searchSavedCasesInput.value);
}

// --- Rendering functions ---

// Render categories with dropdown toggle
function renderCategories() {
  categoriesContainer.innerHTML = "";
  for (const catName in categories) {
    const categoryDiv = document.createElement("div");
    categoryDiv.classList.add("category");

    const header = document.createElement("div");
    header.className = "category-header";
    header.textContent = catName;

    // Add dropdown arrow
    const toggleIcon = document.createElement("span");
    toggleIcon.textContent = "▼";
    toggleIcon.style.marginLeft = "auto";
    header.appendChild(toggleIcon);

    const websitesDiv = document.createElement("div");
    websitesDiv.className = "category-websites";

    categories[catName].forEach((site, idx) => {
      const websiteItem = document.createElement("div");
      websiteItem.className = "website-item";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = true;
      checkbox.dataset.category = catName;
      checkbox.dataset.index = idx;

      const label = document.createElement("label");
      label.style.flexGrow = "1";
      label.style.marginLeft = "8px";
      label.textContent = site.name;

      websiteItem.appendChild(checkbox);
      websiteItem.appendChild(label);

      websitesDiv.appendChild(websiteItem);
    });

    categoryDiv.appendChild(header);
    categoryDiv.appendChild(websitesDiv);
    categoriesContainer.appendChild(categoryDiv);

    // Toggle dropdown
    header.addEventListener("click", () => {
      const isVisible = websitesDiv.classList.toggle("visible");
      toggleIcon.textContent = isVisible ? "▲" : "▼";
    });
  }
}

// Render Manage Categories & Websites with edit/delete
function renderManageCategories() {
  manageCategoriesContainer.innerHTML = "";
  categorySelectForWebsites.innerHTML = "";

  Object.keys(categories).forEach(catName => {
    // Category line with edit/delete
    const catDiv = document.createElement("div");
    catDiv.className = "category";

    const nameSpan = document.createElement("span");
    nameSpan.textContent = catName;

    // Edit category name
    const editBtn = document.createElement("button");
    editBtn.className = "edit-btn";
    editBtn.textContent = "Edit";
    editBtn.title = "Edit category name";
    editBtn.addEventListener("click", () => {
      const newName = prompt("Edit category name:", catName);
      if (newName && newName.trim() !== "" && newName !== catName) {
        if (categories[newName]) {
          alert("Category name already exists.");
          return;
        }
        categories[newName] = categories[catName];
        delete categories[catName];
        renderCategories();
        renderManageCategories();
      }
    });

    // Delete category
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.title = "Delete category";
    deleteBtn.addEventListener("click", () => {
      if (confirm(`Delete category "${catName}"?`)) {
        delete categories[catName];
        renderCategories();
        renderManageCategories();
      }
    });

    catDiv.appendChild(nameSpan);
    catDiv.appendChild(editBtn);
    catDiv.appendChild(deleteBtn);
    manageCategoriesContainer.appendChild(catDiv);

    // Add to dropdown for adding websites
    const option = document.createElement("option");
    option.value = catName;
    option.textContent = catName;
    categorySelectForWebsites.appendChild(option);
  });
}

// Render websites list with edit/delete for manage section
function renderManageWebsites() {
  // For each category, show website list with edit/delete
  // We'll put this inside manageCategoriesContainer after categories

  // First clear old website lists inside manageCategoriesContainer
  document.querySelectorAll(".website-manage-list").forEach(el => el.remove());

  Object.keys(categories).forEach(catName => {
    const container = document.createElement("div");
    container.className = "website-manage-list";
    container.style.marginBottom = "15px";

    const header = document.createElement("h4");
    header.textContent = `Websites in "${catName}"`;
    container.appendChild(header);

    categories[catName].forEach((site, idx) => {
      const siteDiv = document.createElement("div");
      siteDiv.style.display = "flex";
      siteDiv.style.alignItems = "center";
      siteDiv.style.justifyContent = "space-between";
      siteDiv.style.marginBottom = "6px";

      const siteInfo = document.createElement("span");
      siteInfo.textContent = `${site.name} — ${site.url}`;
      siteInfo.style.flexGrow = "1";
      siteInfo.style.marginRight = "10px";
      siteInfo.style.wordBreak = "break-word";

      // Edit website button
      const editBtn = document.createElement("button");
      editBtn.className = "edit-btn";
      editBtn.textContent = "Edit";
      editBtn.title = "Edit website";
      editBtn.addEventListener("click", () => {
        const newName = prompt("Edit website name:", site.name);
        if (!newName || newName.trim() === "") return;
        const newUrl = prompt("Edit website URL:", site.url);
        if (!newUrl || newUrl.trim() === "") return;
        categories[catName][idx] = { name: newName, url: newUrl };
        renderCategories();
        renderManageCategories();
        renderManageWebsites();
      });

      // Delete website button
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "Delete";
      deleteBtn.title = "Delete website";
      deleteBtn.addEventListener("click", () => {
        if (confirm(`Delete website "${site.name}" from category "${catName}"?`)) {
          categories[catName].splice(idx, 1);
          renderCategories();
          renderManageCategories();
          renderManageWebsites();
        }
      });

      siteDiv.appendChild(siteInfo);
      siteDiv.appendChild(editBtn);
      siteDiv.appendChild(deleteBtn);

      container.appendChild(siteDiv);
    });

    manageCategoriesContainer.appendChild(container);
  });
}

function renderAllManageSections() {
  renderManageCategories();
  renderManageWebsites();
}

// --- Event handlers ---

addCategoryBtn.addEventListener("click", () => {
  const newCat = newCategoryInput.value.trim();
  if (!newCat) {
    alert("Category name cannot be empty.");
    return;
  }
  if (categories[newCat]) {
    alert("Category already exists.");
    return;
  }
  categories[newCat] = [];
  newCategoryInput.value = "";
  renderCategories();
  renderAllManageSections();
});

addWebsiteBtn.addEventListener("click", () => {
  const cat = categorySelectForWebsites.value;
  const name = newWebsiteName.value.trim();
  const url = newWebsiteURL.value.trim();
  if (!name || !url) {
    alert("Please enter website name and URL.");
    return;
  }
  if (!categories[cat]) {
    alert("Please select a category.");
    return;
  }
  // Basic URL validation
  try {
    new URL(url);
  } catch {
    alert("Please enter a valid URL.");
    return;
  }

  categories[cat].push({ name, url });
  newWebsiteName.value = "";
  newWebsiteURL.value = "";
  renderCategories();
  renderAllManageSections();
});

searchBtn.addEventListener("click", () => {
  const keyword = keywordInput.value.trim();
  if (!keyword) {
    alert("Please enter a keyword to search.");
    return;
  }

  const selectedSites = [];
  categoriesContainer.querySelectorAll("input[type=checkbox]").forEach(cb => {
    if (cb.checked) {
      selectedSites.push({
        category: cb.dataset.category,
        index: parseInt(cb.dataset.index, 10),
        site: categories[cb.dataset.category][cb.dataset.index]
      });
    }
  });

  if (selectedSites.length === 0) {
    alert("Please select at least one website to search.");
    return;
  }

  // Perform the simulated search and relevance scoring
  performSearch(keyword, selectedSites);
});

exportReportBtn.addEventListener("click", () => {
  if (!resultsContainer.innerHTML.trim()) {
    alert("No results to export.");
    return;
  }
  exportReport();
});

// Image upload and reverse image search handlers

imageUploadInput.addEventListener("change", () => {
  if (imageUploadInput.files.length > 0) {
    imageSearchEngines.style.display = "block";
  } else {
    imageSearchEngines.style.display = "none";
  }
});

imageSearchEngines.querySelectorAll(".engine-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const engine = btn.dataset.engine;
    const file = imageUploadInput.files[0];
    if (!file) {
      alert("Please upload an image first.");
      return;
    }
    // Create a URL for the image
    const imgURL = URL.createObjectURL(file);
    let searchURL = "";

    // Map search URL templates for engines
    switch(engine) {
      case "google":
        // Google requires image upload on their site, so we open the upload page (user has to upload manually)
        searchURL = "https://images.google.com/";
        break;
      case "bing":
        searchURL = "https://www.bing.com/images/search?q=imgurl:" + encodeURIComponent(imgURL) + "&view=detailv2&iss=sbi";
        break;
      case "yandex":
        searchURL = "https://yandex.com/images/search?rpt=imageview&url=" + encodeURIComponent(imgURL);
        break;
      case "tineye":
        searchURL = "https://tineye.com/search/?url=" + encodeURIComponent(imgURL);
        break;
      default:
        alert("Unknown search engine.");
        return;
    }
    window.open(searchURL, "_blank");
  });
});

// Search saved cases input filter
searchSavedCasesInput.addEventListener("input", () => {
  renderSavedCases(searchSavedCasesInput.value);
});

// Clear all saved cases
clearSavedCasesBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all saved cases?")) {
    localStorage.removeItem(SAVED_CASES_KEY);
    renderSavedCases();
  }
});

// --- Search logic ---

function performSearch(keyword, selectedSites) {
  resultsContainer.innerHTML = "<p>Searching...</p>";

  // Demo: simulate async search with setTimeout
  setTimeout(() => {
    const lowerKeyword = keyword.toLowerCase();
    const locationFilter = linkedinLocationInput.value.trim().toLowerCase();
    const jobTitleFilter = linkedinJobTitleInput.value.trim().toLowerCase();

    const results = selectedSites.map(({category, index, site}) => {
      // Simulated result text: we pretend site URL + keyword + filters appear in results
      let baseText = `Results for "${keyword}" on ${site.name} (${site.url})`;

      // Apply advanced filter effects on LinkedIn only (simulate)
      if (site.name.toLowerCase() === "linkedin") {
        if (locationFilter) baseText += ` | Location: ${locationFilter}`;
        if (jobTitleFilter) baseText += ` | Job Title: ${jobTitleFilter}`;
      }

      // Relevance scoring demo: count keyword occurrences in name + url + filters
      let score = 0;
      if (site.name.toLowerCase().includes(lowerKeyword)) score += 5;
      if (site.url.toLowerCase().includes(lowerKeyword)) score += 3;
      if (locationFilter && baseText.toLowerCase().includes(locationFilter)) score += 2;
      if (jobTitleFilter && baseText.toLowerCase().includes(jobTitleFilter)) score += 2;

      return {
        category,
        site,
        text: baseText,
        score
      };
    });

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    // Display results
    resultsContainer.innerHTML = "";
    results.forEach(r => {
      const div = document.createElement("div");
      div.className = "result-item";
      div.innerHTML = `
        <strong>${r.site.name}</strong> (Category: ${r.category})<br/>
        ${r.text}<br/>
        <em>Relevance score: ${r.score}</em>
        <br/>
        <a href="${r.site.url}" target="_blank" rel="noopener noreferrer">${r.site.url}</a>
      `;
      resultsContainer.appendChild(div);
    });

    // Save case automatically for demonstration
    const selectedWebsitesForSave = selectedSites.map(s => ({
      category: s.category,
      index: s.index
    }));
    saveCurrentCase(keyword, selectedWebsitesForSave, resultsContainer.innerHTML);

  }, 700);
}

// Export report as HTML file
function exportReport() {
  const keyword = keywordInput.value.trim();
  const htmlContent = `
  <html>
  <head>
    <title>OSINT Search Report - ${keyword}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h1 { color: #B13F17; }
      a { color: #B13F17; text-decoration: none; }
      a:hover { text-decoration: underline; }
      .result-item { margin-bottom: 15px; }
    </style>
  </head>
  <body>
    <h1>OSINT Search Report for: ${keyword}</h1>
    ${resultsContainer.innerHTML}
  </body>
  </html>
  `;

  const blob = new Blob([htmlContent], {type: "text/html"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `OSINT_Report_${keyword.replace(/\s+/g,"_")}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Initial rendering
renderCategories();
renderAllManageSections();
renderSavedCases();
