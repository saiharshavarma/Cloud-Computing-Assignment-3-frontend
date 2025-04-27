// ─────── CONFIG ───────
const API_BASE = 'https://ik80a4tzv2.execute-api.us-east-1.amazonaws.com/dev';
const SEARCH_URL = `${API_BASE}/search`;
const UPLOAD_URL = `${API_BASE}/photos`;
const API_KEY = 'YikkjTIddP1yH73euYnep8I0shNxhDkq46gDuRxw';

// Instantiate the SDK client once
const apigClient = apigClientFactory.newClient({ apiKey: API_KEY });

// ─────── SEARCH ───────
async function doSearch() {
  const q = document.getElementById('searchInput').value.trim();
  if (!q) return;

  try {
    // Call GET /search?q={q}
    const result = await apigClient.searchGet(
      { q },   // params: query string
      {},      // body: none
      {}       // additionalParams: none
    );

    const results = result.data.results;
    const container = document.getElementById('results');
    container.innerHTML = '';

    results.forEach(r => {
      const card = document.createElement('div');
      card.className = 'photo-card';
      card.innerHTML = `
        <img src="${r.url}" alt="photo" />
        <div>${r.labels.join(', ')}</div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Search error:', err);
    alert(`Search failed: ${err.status || err.message || err}`);
  }
}

// ─────── UPLOAD ───────
async function doUpload() {
  const fileEl = document.getElementById('fileInput');
  const status = document.getElementById('uploadStatus');
  const labels = document.getElementById('customLabelsInput').value.trim();

  if (!fileEl.files.length) {
    status.style.color = 'red';
    status.textContent = 'Please choose a file first.';
    return;
  }

  const file = fileEl.files[0];
  const key  = encodeURIComponent(file.name);  // e.g. "animal1.jpg"
  const finalUrl = `${UPLOAD_URL}/${key}`;

  // DEBUG: log exactly where we’re PUTting
  console.log('About to PUT to:', finalUrl);

  status.style.color = 'black';
  status.textContent = 'Uploading…';

  const params = {
    object: key,                             // path param
    'Content-Type': file.type,               // required header param
    'x-amz-meta-customlabels': labels        // required custom-label header param
  };
  const body = file;
  const additionalParams = {};               // no query params

  try {
    // Call PUT /photos/{object}
    await apigClient.photosObjectPut(params, body, additionalParams);

    status.style.color = 'green';
    status.textContent = 'Upload successful!';
    fileEl.value = '';
    document.getElementById('customLabelsInput').value = '';
  } catch (err) {
    console.error('Upload error:', err);
    status.style.color = 'red';
    status.textContent = `Upload failed: ${err.status || err.message || err}`;
  }
}

// ─────── EVENT BINDING ───────
document.getElementById('searchBtn').addEventListener('click', doSearch);
document.getElementById('uploadBtn').addEventListener('click', doUpload);