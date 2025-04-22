//starting variables for pagination
let currentPage = 1;
const profilesPerPage = 10;
let allResults = [];

//for main serach button
document.getElementById('searchBtn').addEventListener('click', searchItems);

//for the search function
function searchItems() {
  const query = document.getElementById('searchBar').value.toLowerCase();

  fetch('http://localhost:3000/students')
    .then(res => res.json())
    .then(data => {
      allResults = data.filter(s =>
        s.first_name.toLowerCase().includes(query) ||
        s.last_name.toLowerCase().includes(query) ||
        s.major.toLowerCase().includes(query)
      );
      currentPage = 1;
      renderPage();
      renderPaginationControls();
    })
    .catch(console.error);
}

//for filter "submit" button when activated
document.getElementById('filterForm').addEventListener('submit', e => {
  e.preventDefault();

  const q = document.getElementById('searchBar').value.toLowerCase();
  const nameOrder = document.getElementById('names').value;
  const major = document.getElementById('majors').value.toLowerCase();
  const workHistory = document.getElementById('workhistory').value.toLowerCase();
  const gpaFilter = document.getElementById('gpa').value;

  fetch('http://localhost:3000/students')
    .then(res => res.json())
    .then(data => {
      let filtered = data.filter(s =>
        (s.first_name.toLowerCase().includes(q) ||
         s.last_name.toLowerCase().includes(q)) &&
        (major === '' || s.major.toLowerCase() === major) &&
        (workHistory === '' || s.work_history.toLowerCase() === workHistory)
      );

      //filte gpa's
      filtered = filtered.filter(s => {
        const gpa = parseFloat(s.gpa);
        switch (gpaFilter) {
          case 'lessthan2':
            return gpa < 2.0;
          case 'lessthan3':
            return gpa >= 2.0 && gpa < 3.0;
          case 'lessthan3.5':
            return gpa >= 3.0 && gpa < 3.5;
          case 'greaterthan3.5':
            return gpa >= 3.5;
          default:
            return true;
        }
      });

      //sort names
      if (nameOrder === 'a-z') {
        filtered.sort((a, b) => a.last_name.localeCompare(b.last_name));
      } else if (nameOrder === 'z-a') {
        filtered.sort((a, b) => b.last_name.localeCompare(a.last_name));
      }

      allResults = filtered;
      currentPage = 1;
      renderPage();
      renderPaginationControls();
    })
    .catch(console.error);
});

//results display
function displayResults(results) {
  const container = document.getElementById('results');
  container.innerHTML = '';

  if (!results.length) {
    container.textContent = 'No results found';
    return;
  }

  results.forEach(student => {
    const profile = document.createElement('div');
    profile.classList.add('profile');

    const img = document.createElement('img');
    img.src = `${student.image}`;
    img.alt = 'Profile Picture';
    img.classList.add('profile-pic');
    profile.appendChild(img);

    const details = document.createElement('div');
    details.classList.add('profile-details');
    details.innerHTML = `
      <p><strong>${student.first_name} ${student.last_name}</strong></p>
      <p>${student.major}</p>
    `;
    profile.appendChild(details);

    const btn = document.createElement('button');
    btn.classList.add('profile-action');
    btn.textContent = 'Download PDF';
    btn.addEventListener('click', () => {
      const link = document.createElement('a');
      link.href = `${student.resume}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
    profile.appendChild(btn);

    container.appendChild(profile);
  });
}

//Pages
function renderPage() {
  const start = (currentPage - 1) * profilesPerPage;
  const pageItems = allResults.slice(start, start + profilesPerPage);
  displayResults(pageItems);
}

//Pagination controls
function renderPaginationControls() {
  const oldNav = document.querySelector('.pagination');
  if (oldNav) oldNav.remove();

  const pageCount = Math.ceil(allResults.length / profilesPerPage);
  const nav = document.createElement('div');
  nav.className = 'pagination';
  nav.style.textAlign = 'center';
  nav.style.margin = '20px 0';

  for (let i = 1; i <= pageCount; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.style.margin = '0 5px';
    if (i === currentPage) btn.disabled = true;
    btn.addEventListener('click', () => {
      currentPage = i;
      renderPage();
      renderPaginationControls();
    });
    nav.appendChild(btn);
  }

  document.getElementById('results').after(nav);
}

//grabs data from comments, but isnt really a issue so keep for now
document.addEventListener('DOMContentLoaded', () => {
  fetch('http://localhost:3000/students')
    .then(res => res.json())
    .then(data => {
      allResults = data;
      renderPage();
      renderPaginationControls();
    })
    .catch(console.error);
});
