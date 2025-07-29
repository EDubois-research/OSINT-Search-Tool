// Part 3: script.js

// Initial Data
let categories = {
  "Company Searches": ["https://find-and-update.company-information.service.gov.uk/"],
  "Court Case Searches": ["https://www.casemine.com/"],
  "Occupation Registers": [
    "https://www.gdc-uk.org/pages/searchregisters.aspx",
    "https://www.nmc.org.uk/registration/the-register/",
    "https://www.gmc-uk.org/registration-and-licensing/the-medical-register",
    "https://www.gphc.org.uk/registration-and-registration-requirements/the-register/",
    "https://www.hcpc-uk.org/registration/",
    "https://www.rccp.co.uk/registration",
    "https://www.gmc-uk.org/registration-and-licensing/the-medical-register",
    "https://www.gdc-uk.org/pages/searchregisters.aspx",
    // add more here...
  ],
  "Genealogy": ["https://probatesearch.service.gov.uk/#wills"],
  "Transport": ["https://cartaxcheck.co.uk/"],
  "Sanctions, Watchlists, PEPs": ["https://www.insolvencydirect.bis.gov.uk/eiir/search"],
  "Social Media": ["https://www.facebook.com/"],
  "Offshore Companies": ["https://offshoreleaks.icij.org/"],
  "Domain/Leaked/Cached": ["https://who.is/"]
};

let savedReports = {}; // saved reports with IDs

// Utility: Save categories & reports to localStorage
function saveData() {
  localStorage.setItem('osintCategories', JSON.stringify(categories));
  localStorage.setItem('osintReports', JSON.stringify(savedReports));
}

// Utility: Load categories & reports from localStorage
function loadData() {
  const cats = localStorage.getItem('osintCategories');
  const reps = localStorage.getItem('osintReports');
  if (cats) categories = JSON.parse(cats);
  if (reps) savedReports = JSON.parse(reps);
}

// Populate category list with collapsible website dropdowns
function renderCategories() {
  const container = document.getElementById('category-list');
  container.innerHTML = '';
  Object.entries(categories).forEach(([catName, sites], idx) => {
    const catDiv = document.createElement('div');
    catDiv.className = 'category';

    // Header with expand/collapse toggle
    const header = document.createElement('div');
    header.className = 'category-header';
    header.textContent = catName;
    header.onclick = () => {
      sitesDiv.style.display = sitesDiv.style.display === 'none' ? 'block' : 'none';
    };
    catDiv.appendChild(header);

    // Sites list (hidden by default)
    const sitesDiv = document.createElement('div');
    sitesDiv.className = 'sites-list';
    sitesDiv.style.display = 'none';

    sites.forEach((url, i) => {
      const siteDiv = document.createElement('div');
      siteDiv.className = 'site-entry';

      // Site text input (editable)
      const input = document.createElement('input');
      input.type = 'text';
      input.value = url;
      input.className = 'site-input';
      input.onchange = () => {
        categories[catName][i] = input.value;
        saveData();
      };
      siteDiv.appendChild(input);

      // Delete button
      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.onclick = () => {
        categories[catName].splice(i, 1);
        saveData();
        renderCategories();
      };
      siteDiv.appendChild(delBtn);

      sitesDiv.appendChild(siteDiv);
    });

    // Add new site input & button
    const addSiteDiv = document.createElement('div');
    addSiteDiv.className = 'add-site';

    const addInput = document.createElement('input');
    addInput.type = 'text';
    addInput.placeholder = 'Add new website URL';
    addSiteDiv.appendChild(addInput);

    const addBtn = document.createElement('button');
    addBtn.textContent = 'Add Website';
    addBtn.onclick = () => {
      if (addInput.value.trim()) {
        categories[catName].push(addInput.value.trim());
        addInput.value = '';
        saveData();
        renderCategories();
      }
    };
    addSiteDiv.appendChild(addBtn);

    sitesDiv.appendChild(addSiteDiv);

    catDiv.appendChild(sitesDiv);

    container.appendChild(catDiv);
  });
}

// Render the category checkboxes in search area
function renderCategoryCheckboxes() {
  const container = document.getElementById('category-checkboxes');
  container.innerHTML = '';
  Object.keys(categories).forEach(catName => {
    const label = document.createElement('label');
    label.className = 'checkbox-label';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = catName;
    checkbox.checked = true;

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(catName));
    container.appendChild(label);
  });
}

// Perform the search over selected categories and sites
async function performSearch() {
  const keyword = document.getElementById('search-keyword').value.trim();
  if (!keyword) {
    alert('Please enter a keyword to search.');
    return;
  }
  // Clear previous results
  const resultsDiv = document.getElementById('search-results');
  resultsDiv.innerHTML = 'Searching...';

  // Get selected categories
  const checkedCats = [...document.querySelectorAll('#category-checkboxes input[type="checkbox"]:checked')]
    .map(c => c.value);

  if (checkedCats.length === 0) {
    resultsDiv.innerHTML = 'Please select at least one category.';
    return;
  }

  // Gather all sites URLs from selected categories
  let sitesToSearch = [];
  checkedCats.forEach(cat => {
    sitesToSearch = sitesToSearch.concat(categories[cat] || []);
  });

  // For demo, we will simulate searches by generating fake results
  resultsDiv.innerHTML = '';
  for (const site of sitesToSearch) {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'search-result';
    // Simulate relevance score 50-100%
    const relevance = Math.floor(50 + Math.random() * 50);
    resultDiv.innerHTML = `<strong>${site}</strong><br>Keyword: ${keyword}<br>Relevance: ${relevance}%<br><em>Preview snippet of matched content here...</em>`;
    resultsDiv.appendChild(resultDiv);
  }
}

// Save report with current results
function saveReport() {
  const resultsDiv = document.getElementById('search-results');
  if (!resultsDiv.innerHTML || resultsDiv.innerHTML === 'Searching...') {
    alert('No results to save.');
    return;
  }
  const reportID = 'rep_' + Date.now();
  savedReports[reportID] = resultsDiv.innerHTML;
  saveData();
  renderSavedReports();
  alert('Report saved.');
}

// Render saved reports list
function renderSavedReports() {
  const container = document.getElementById('saved-reports');
  container.innerHTML = '';
  Object.entries(savedReports).forEach(([id, content]) => {
    const repDiv = document.createElement('div');
    repDiv.className = 'saved-report';

    const title = document.createElement('div');
    title.textContent = `Report ID: ${id}`;
    repDiv.appendChild(title);

    const preview = document.createElement('div');
    preview.className = 'report-preview';
    preview.innerHTML = content;
    repDiv.appendChild(preview);

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete Report';
    delBtn.onclick = () => {
      delete savedReports[id];
      saveData();
      renderSavedReports();
    };
    repDiv.appendChild(delBtn);

    container.appendChild(repDiv);
  });
}

// Image upload & reverse image search (simplified)
function setupImageUpload() {
  const input = document.getElementById('image-upload');
  input.onchange = () => {
    if (input.files.length === 0) return;
    const file = input.files[0];
    // For demo, open reverse image search links in new tabs
    const blobURL = URL.createObjectURL(file);
    window.open(`https://images.google.com/searchbyimage?image_url=${blobURL}`, '_blank');
    window.open(`https://tineye.com/search?url=${blobURL}`, '_blank');
  };
}

// Init on page load
window.onload = () => {
  loadData();
  renderCategories();
  renderCategoryCheckboxes();
  renderSavedReports();
  setupImageUpload();

  document.getElementById('search-button').onclick = performSearch;
  document.getElementById('save-report-button').onclick = saveReport;
};
