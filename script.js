// Data structures for categories and websites
let categories = {
  "Company Searches": [
    { name: "Companies House", url: "https://find-and-update.company-information.service.gov.uk/" }
  ],
  "Court Case Searches": [
    { name: "CaseMine", url: "https://www.casemine.com/" }
  ],
  "Occupation Registers": [
    { name: "General Dental Council", url: "https://www.gdc-uk.org/pages/searchregisters.aspx" },
    { name: "Nursing & Midwifery Council", url: "https://www.nmc.org.uk/registration/search-the-register/" },
    { name: "Health & Care Professions Council", url: "https://www.hcpc-uk.org/check/" }
    // Add more occupation registers here
  ],
  "Genealogy": [
    { name: "UK Probate Search", url: "https://probatesearch.service.gov.uk/#wills" }
  ],
  "Transport": [
    { name: "Car Tax Check", url: "https://cartaxcheck.co.uk/" }
  ],
  "Sanctions, Watchlists, PEPs": [
    { name: "Insolvency Register", url: "https://www.insolvencydirect.bis.gov.uk/eiir/search" }
  ],
  "Social Media": [
    { name: "Facebook", url: "https://www.facebook.com/" }
  ],
  "Offshore Companies": [
    { name: "ICIJ Offshore Leaks", url: "https://offshoreleaks.icij.org/" }
  ],
  "Domain/Leaked/Cached": [
    { name: "Who.is", url: "https://who.is/" }
  ]
};

// Utility function to save data to localStorage
function saveData() {
  localStorage.setItem("osintCategories", JSON.stringify(categories));
}

// Utility function to load data from localStorage
function loadData() {
  const saved = localStorage.getItem("osintCategories");
  if (saved) {
    categories = JSON.parse(saved);
  }
}

// Toggle dropdown visibility
function toggleDropdown(e) {
  const content = e.currentTarget.nextElementSibling;
  const icon = e.currentTarget.querySelector(".toggle-icon");
  content.classList.toggle("show");
  icon.classList.toggle("rotated");
}

// Render category checkboxes for searching
function renderCategoryCheckboxes() {
  const container = document.getElementById("category-checkboxes");
  container.innerHTML = "";

  Object.keys(categories).forEach(cat => {
    const label = document.createElement("label");
    label.style.marginRight = "15px";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = cat;
    checkbox.checked = true; // default all checked

    label.appendChild(checkbox);
    label.append(" " + cat);

    container.appendChild(label);
  });
}

// Render manage categories panel
function renderManageCategories() {
  const container = document.getElementById("manage-categories");
  container.innerHTML = "<h3>Categories</h3>";

  Object.keys(categories).forEach(cat => {
    const catDiv = document.createElement("div");
    catDiv.className = "category-group";

    const header = document.createElement("div");
    header.className = "category-header";
    header.textContent = cat;

    const toggleIcon = document.createElement("span");
    toggleIcon.className = "toggle-icon";
    toggleIcon.textContent = "▶";
    header.appendChild(toggleIcon);

    header.onclick = toggleDropdown;

    const content = document.createElement("div");
    content.className = "category-content";

    const input = document.createElement("input");
    input.type = "text";
    input.value = cat;
    input.style.width = "70%";
    input.onchange = e => {
      const newName = e.target.value.trim();
      if (newName && newName !== cat && !categories[newName]) {
        categories[newName] = categories[cat];
        delete categories[cat];
        renderManageCategories();
        renderCategoryCheckboxes();
        saveData();
      } else if (categories[newName]) {
        alert("Category name already exists.");
        e.target.value = cat;
      }
    };

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = () => {
      if (confirm(`Delete category "${cat}"? This will also delete all its websites.`)) {
        delete categories[cat];
        renderManageCategories();
        renderCategoryCheckboxes();
        saveData();
      }
    };

    content.appendChild(input);
    content.appendChild(delBtn);
    catDiv.appendChild(header);
    catDiv.appendChild(content);
    container.appendChild(catDiv);
  });

  // Add new category input
  const addDiv = document.createElement("div");
  addDiv.style.marginTop = "10px";
  const newCatInput = document.createElement("input");
  newCatInput.type = "text";
  newCatInput.placeholder = "New category name";
  newCatInput.style.width = "70%";

  const addCatBtn = document.createElement("button");
  addCatBtn.textContent = "Add Category";
  addCatBtn.onclick = () => {
    const val = newCatInput.value.trim();
    if (val && !categories[val]) {
      categories[val] = [];
      renderManageCategories();
      renderCategoryCheckboxes();
      saveData();
      newCatInput.value = "";
    } else {
      alert("Invalid or duplicate category name.");
    }
  };

  addDiv.appendChild(newCatInput);
  addDiv.appendChild(addCatBtn);
  container.appendChild(addDiv);
}

// Render manage websites panel
function renderManageWebsites() {
  const container = document.getElementById("manage-websites");
  container.innerHTML = "<h3>Websites</h3>";

  Object.keys(categories).forEach(cat => {
    const catDiv = document.createElement("div");
    catDiv.className = "category-group";

    const header = document.createElement("div");
    header.className = "category-header";
    header.textContent = cat;

    const toggleIcon = document.createElement("span");
    toggleIcon.className = "toggle-icon";
    toggleIcon.textContent = "▶";
    header.appendChild(toggleIcon);

    header.onclick = toggleDropdown;

    const content = document.createElement("div");
    content.className = "category-content";

    categories[cat].forEach((site, idx) => {
      const siteDiv = document.createElement("div");
      siteDiv.className = "website-item";

      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.value = site.name;

      const urlInput = document.createElement("input");
      urlInput.type = "text";
      urlInput.value = site.url;

      nameInput.onchange = () => {
        categories[cat][idx].name = nameInput.value.trim();
        saveData();
      };

      urlInput.onchange = () => {
        categories[cat][idx].url = urlInput.value.trim();
        saveData();
      };

      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.onclick = () => {
        if (confirm(`Delete website "${site.name}"?`)) {
          categories[cat].splice(idx, 1);
          renderManageWebsites();
          saveData();
        }
      };

      siteDiv.appendChild(nameInput);
      siteDiv.appendChild(urlInput);
      siteDiv.appendChild(delBtn);

      content.appendChild(siteDiv);
    });

    // Add new website input for this category
    const addDiv = document.createElement("div");
    addDiv.style.marginTop = "10px";

    const newNameInput = document.createElement("input");
    newNameInput.type = "text";
    newNameInput.placeholder = "Website name";
    newNameInput.style.width = "30%";
    newNameInput.style.marginRight = "10px";

    const newUrlInput = document.createElement("input");
    newUrlInput.type = "text";
    newUrlInput.placeholder = "Website URL";
    newUrlInput.style.width = "50%";
    newUrlInput.style.marginRight = "10px";

    const addSiteBtn = document.createElement("button");
    addSiteBtn.textContent = "Add Website";
    addSiteBtn.onclick = () => {
      const n = newNameInput.value.trim();
      const u = newUrlInput.value.trim();
      if (n && u) {
        categories[cat].push({ name: n, url: u });
        renderManageWebsites();
        saveData();
        newNameInput.value = "";
        newUrlInput.value = "";
      } else {
        alert("Please enter both website name and URL.");
      }
    };

    addDiv.appendChild(newNameInput);
    addDiv.appendChild(newUrlInput);
    addDiv.appendChild(addSiteBtn);

    content.appendChild(addDiv);

    catDiv.appendChild(header);
    catDiv.appendChild(content);
    container.appendChild(catDiv);
  });
}

// Perform search based on keyword and checked categories
function performSearch() {
  const keyword = document.getElementById("keyword").value.trim().toLowerCase();
  const checkedCats = Array.from(document.querySelectorAll("#category-checkboxes input[type='checkbox']:checked")).map(cb => cb.value);

  const resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = "";

  if (!keyword) {
    resultsContainer.textContent = "Please enter a keyword to search.";
    return;
  }
  if (checkedCats.length === 0) {
    resultsContainer.textContent = "Please select at least one category.";
    return;
  }

  let results = [];

  checkedCats.forEach(cat => {
    categories[cat].forEach(site => {
      if (site.name.toLowerCase().includes(keyword) || site.url.toLowerCase().includes(keyword)) {
        results.push({ category: cat, ...site });
      }
    });
  });

  if (results.length === 0) {
    resultsContainer.textContent = "No results found.";
    return;
  }

  // Display results
  results.forEach(res => {
    const div = document.createElement("div");
    div.className = "search-result";
    div.innerHTML = `<strong>${res.category}</strong>: <a href="${res.url}" target="_blank" rel="noopener noreferrer">${res.name}</a>`;
    resultsContainer.appendChild(div);
  });
}

// Initialization function
function init() {
  loadData();
  renderCategoryCheckboxes();
  renderManageCategories();
  renderManageWebsites();

  document.getElementById("search-btn").onclick = performSearch;
  document.getElementById("save-changes").onclick = () => {
    saveData();
    alert("Changes saved!");
  };
}

window.onload = init;
