const projects = [
  {
    id: 'garden',
    name: 'Garden journal',
    category: 'Personal',
    color: 'green',
    initials: 'GJ',
    description: 'A seasonal record of what is growing, what worked, and what to try next.',
    action: '',
    due: '',
    attention: 'No next action yet'
  },
  {
    id: 'spring',
    name: 'Spring campaign',
    category: 'Client',
    color: 'peach',
    initials: 'SC',
    description: 'A launch campaign for the spring collection across email and social.',
    action: 'Send the final copy to Maya for review',
    due: '2 days overdue',
    attention: 'Overdue'
  },
  {
    id: 'fieldnotes',
    name: 'Fieldnotes website',
    category: 'Business',
    color: 'blue',
    initials: 'FW',
    description: 'A small home for the work, the process, and the things worth keeping.',
    action: 'Choose three projects for the homepage',
    due: 'Due in 4 days',
    attention: ''
  },
  {
    id: 'studio',
    name: 'Studio refresh',
    category: 'Personal',
    color: 'violet',
    initials: 'SR',
    description: 'Make the studio a more comfortable and inspiring place to work.',
    action: 'Measure the wall for new shelving',
    due: 'No due date',
    attention: ''
  }
];

const archivedProjects = [
  {
    id: 'reading',
    name: 'Reading tracker',
    category: 'Personal',
    color: 'violet',
    initials: 'RT',
    description: 'A little home for the books and notes collected along the way.'
  }
];

const byId = id => projects.find(project => project.id === id);
const $ = selector => document.querySelector(selector);
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[char]));
let currentPage = 'focus';
let currentScreen = 'focus';
let selectedProjectId = 'spring';

function attentionProjects() {
  return projects.filter(project => project.attention);
}

function dueMarkup(project) {
  if (!project.due) return '<span class="due-label"><span class="due-icon">◷</span> No due date</span>';
  const isOverdue = project.due.includes('overdue');
  const isSoon = project.due.includes('4 days');
  const state = isOverdue ? 'overdue' : isSoon ? 'soon' : '';
  return `<span class="due-label ${state}"><span class="due-icon">◷</span>${escapeHtml(project.due)}</span>`;
}

function projectMarkup(project, options = {}) {
  const isAttention = options.attention && project.attention;
  const actionText = project.action
    ? escapeHtml(project.action)
    : '<span class="missing">Choose a small next step</span>';
  const statusMarkup = isAttention
    ? `<span class="due-label ${project.due ? 'overdue' : 'soon'}">${escapeHtml(project.attention)}</span>`
    : dueMarkup(project);

  return `<article class="project-row">
    <span class="project-mark ${project.color}" aria-hidden="true">${escapeHtml(project.initials)}</span>
    <div class="project-name">
      <button data-open-project="${escapeHtml(project.id)}">${escapeHtml(project.name)}</button>
      <div class="project-meta"><span class="category-dot"></span>${escapeHtml(project.category)}</div>
    </div>
    <div class="next-action">
      <span class="action-label">Next action</span>
      <span class="action-text">${actionText}</span>
    </div>
    <div class="row-trailing">${statusMarkup}<span class="row-arrow" aria-hidden="true">›</span></div>
  </article>`;
}

function updateLists() {
  const attention = attentionProjects();
  const moving = projects.filter(project => !project.attention);
  $('#nav-attention').textContent = attention.length;
  $('#nav-projects').textContent = projects.length;
  $('#attention-total').textContent = attention.length;
  $('#attention-count').textContent = attention.length;
  $('#moving-count').textContent = moving.length;
  $('#all-count').textContent = projects.length;
  $('#attention-list').innerHTML = attention.length
    ? attention.map(project => projectMarkup(project, { attention: true })).join('')
    : '<div class="empty-list"><strong>Nothing needs a next step.</strong>All active projects are in good shape.</div>';
  $('#moving-list').innerHTML = moving.length
    ? moving.map(project => projectMarkup(project)).join('')
    : '<div class="empty-list">Your active projects will show up here.</div>';
  $('#all-list').innerHTML = projects.length
    ? projects.map(project => projectMarkup(project)).join('')
    : '<div class="empty-list"><strong>No active projects yet.</strong>Add a project when you are ready.</div>';
  $('#archive-list').innerHTML = archivedProjects.length
    ? archivedProjects.map(project => `<article class="project-row">
        <span class="project-mark ${project.color}" aria-hidden="true">${escapeHtml(project.initials)}</span>
        <div class="project-name"><button data-open-archived="${escapeHtml(project.id)}">${escapeHtml(project.name)}</button>
          <div class="project-meta"><span class="category-dot"></span>${escapeHtml(project.category)} · Archived</div>
        </div><div class="next-action"><span class="action-label">About</span><span class="action-text">${escapeHtml(project.description)}</span></div>
        <div class="row-trailing"><button class="button button-quiet" data-restore="${escapeHtml(project.id)}">Restore</button></div>
      </article>`).join('')
    : '<div class="empty-list"><strong>No archived projects.</strong>Finished projects can be tucked away here.</div>';
  $('#archive-count').textContent = archivedProjects.length;
  bindProjectButtons();
}

function bindProjectButtons() {
  document.querySelectorAll('[data-open-project]').forEach(button => {
    button.addEventListener('click', () => showProject(button.dataset.openProject));
  });
  document.querySelectorAll('[data-open-archived]').forEach(button => {
    button.addEventListener('click', () => showArchived(button.dataset.openArchived));
  });
  document.querySelectorAll('[data-restore]').forEach(button => {
    button.addEventListener('click', () => restoreProject(button.dataset.restore));
  });
}

function setPage(page) {
  currentPage = page;
  document.querySelectorAll('.nav-item').forEach(button => {
    const selected = button.dataset.page === page;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-current', selected ? 'page' : 'false');
  });
  $('#crumb-page').textContent = page === 'focus' ? 'FOCUS' : page === 'projects' ? 'ALL PROJECTS' : 'ARCHIVE';
  const isFocus = page === 'focus';
  const isProjects = page === 'projects';
  const isArchive = page === 'archive';
  $('#page-title').textContent = isFocus ? 'Your work, in focus.' : isProjects ? 'All your projects.' : 'A place for later.';
  $('#page-subtitle').textContent = isFocus
    ? 'A short list of projects that could use your attention.'
    : isProjects
      ? 'One current next action per project. That’s enough to keep moving.'
      : 'Finished for now, but easy to pick back up.';
  $('#date-label').textContent = isFocus
    ? new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date()).toUpperCase()
    : isProjects ? 'YOUR ACTIVE WORK' : 'OUT OF SIGHT, NOT GONE';
  $('#focus-summary').hidden = !isFocus || currentScreen === 'clear';
  $('#attention-section').hidden = !isFocus || currentScreen === 'clear';
  $('#steady-section').hidden = !isFocus || currentScreen === 'clear';
  $('#projects-section').hidden = !isProjects;
  $('#archive-section').hidden = !isArchive;
  $('#clear-state').hidden = !(isFocus && currentScreen === 'clear');
  $('#add-project').hidden = isArchive;
}

function setScreen(screen) {
  currentScreen = screen;
  document.querySelectorAll('.screen-tab').forEach(button => {
    const selected = button.dataset.screen === screen;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  setPage('focus');
  if (screen === 'detail') showProject('spring');
  else if ($('#project-dialog').open) $('#project-dialog').close();
}

function showProject(id) {
  const project = byId(id);
  if (!project) return;
  selectedProjectId = id;
  $('#dialog-content').innerHTML = `<div class="dialog-content">
    <p class="dialog-kicker">${escapeHtml(project.category.toUpperCase())} PROJECT</p>
    <h2 class="dialog-title" id="dialog-title">${escapeHtml(project.name)}</h2>
    <p class="dialog-description">${escapeHtml(project.description)}</p>
    <div class="detail-block">
      <span class="detail-label">Current next action</span>
      ${project.action
        ? `<div class="detail-action">${escapeHtml(project.action)}</div>${project.due ? `<div class="detail-due">${escapeHtml(project.due)}</div>` : ''}`
        : '<div class="detail-action" style="color:#a47747;font-style:italic">No next action yet</div>'}
    </div>
    <form id="action-form">
      <label class="form-label" for="action-input">${project.action ? 'Update the next action' : 'Add a next action'}</label>
      <input class="form-input" id="action-input" name="action" maxlength="120" placeholder="What is the next small step?" value="${escapeHtml(project.action)}">
      <label class="form-label" for="due-input">Due date <span style="font-weight:400;color:#929a92">(optional)</span></label>
      <input class="form-input" id="due-input" name="due" type="date">
      <div class="dialog-actions">
        <button class="button button-danger" type="button" id="archive-project">Archive project</button>
        <div><button class="button button-quiet" type="button" id="mark-done">Mark action done</button>
        <button class="button button-primary" type="submit">Save next action</button></div>
      </div>
    </form>
  </div>`;
  const dialog = $('#project-dialog');
  if (!dialog.open) dialog.showModal();
  $('#action-form').addEventListener('submit', saveAction);
  $('#mark-done').addEventListener('click', markActionDone);
  $('#archive-project').addEventListener('click', archiveProject);
}

function showAddProject() {
  $('#dialog-content').innerHTML = `<div class="dialog-content">
    <p class="dialog-kicker">A NEW PROJECT</p>
    <h2 class="dialog-title" id="dialog-title">Make room for what’s next.</h2>
    <p class="dialog-description">Start with a name. You can add one next action whenever you’re ready.</p>
    <form id="new-project-form">
      <label class="form-label" for="new-project-name">Project name</label>
      <input class="form-input" id="new-project-name" name="name" maxlength="70" placeholder="What are you working on?" required>
      <label class="form-label" for="new-project-category">Category</label>
      <select class="form-input" id="new-project-category" name="category">
        <option>Personal</option><option>Client</option><option>Business</option>
      </select>
      <div class="dialog-actions"><span></span><div>
        <button class="button button-quiet" type="button" id="cancel-new-project">Cancel</button>
        <button class="button button-primary" type="submit">Add project</button>
      </div></div>
    </form>
  </div>`;
  const dialog = $('#project-dialog');
  if (!dialog.open) dialog.showModal();
  $('#cancel-new-project').addEventListener('click', () => dialog.close());
  $('#new-project-form').addEventListener('submit', event => {
    event.preventDefault();
    const name = $('#new-project-name').value.trim();
    if (!name) return;
    const category = $('#new-project-category').value;
    const initials = name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
    projects.unshift({
      id: `project-${Date.now()}`,
      name,
      category,
      color: 'green',
      initials,
      description: 'Add a note about what this project is for.',
      action: '',
      due: '',
      attention: 'No next action yet'
    });
    dialog.close();
    updateLists();
    setPage('focus');
    announce('Project added. Add a next action whenever you’re ready.');
  });
}

function showArchived(id) {
  const project = archivedProjects.find(item => item.id === id);
  if (!project) return;
  $('#dialog-content').innerHTML = `<div class="dialog-content">
    <p class="dialog-kicker">ARCHIVED PROJECT</p>
    <h2 class="dialog-title" id="dialog-title">${escapeHtml(project.name)}</h2>
    <p class="dialog-description">${escapeHtml(project.description)}</p>
    <div class="dialog-actions"><span></span><button class="button button-primary" id="restore-from-detail">Restore to active</button></div>
  </div>`;
  const dialog = $('#project-dialog');
  if (!dialog.open) dialog.showModal();
  $('#restore-from-detail').addEventListener('click', () => restoreProject(id));
}

function announce(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  document.body.append(toast);
  window.setTimeout(() => toast.remove(), 2200);
}

function saveAction(event) {
  event.preventDefault();
  const project = byId(selectedProjectId);
  const action = $('#action-input').value.trim();
  if (!project || !action) {
    $('#action-input').setCustomValidity('Add a next action to save.');
    $('#action-input').reportValidity();
    return;
  }
  $('#action-input').setCustomValidity('');
  project.action = action;
  project.due = $('#due-input').value
    ? `Due ${new Date(`${$('#due-input').value}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
    : '';
  project.attention = '';
  $('#project-dialog').close();
  updateLists();
  setPage(currentPage);
  announce('Next action updated. Prototype only — nothing was saved.');
}

function markActionDone() {
  const project = byId(selectedProjectId);
  if (!project) return;
  project.action = '';
  project.due = '';
  project.attention = 'No next action yet';
  $('#project-dialog').close();
  updateLists();
  setPage(currentPage);
  announce('Action marked done. Choose the next step when you’re ready.');
}

function archiveProject() {
  const index = projects.findIndex(project => project.id === selectedProjectId);
  if (index < 0) return;
  const [project] = projects.splice(index, 1);
  archivedProjects.unshift(project);
  $('#project-dialog').close();
  updateLists();
  setPage('archive');
  announce('Project archived. You can restore it anytime.');
}

function restoreProject(id) {
  const index = archivedProjects.findIndex(project => project.id === id);
  if (index < 0) return;
  const [archived] = archivedProjects.splice(index, 1);
  const restored = {
    ...archived,
    action: '',
    due: '',
    attention: 'No next action yet'
  };
  projects.unshift(restored);
  $('#project-dialog').close();
  updateLists();
  setPage('projects');
  announce('Project restored to active projects.');
}

document.querySelectorAll('.nav-item').forEach(button => {
  button.addEventListener('click', () => setPage(button.dataset.page));
});
document.querySelectorAll('.screen-tab').forEach(button => {
  button.addEventListener('click', () => setScreen(button.dataset.screen));
});
$('#show-all').addEventListener('click', () => setPage('projects'));
$('#clear-see-all').addEventListener('click', () => setPage('projects'));
$('#add-project').addEventListener('click', showAddProject);
$('#search').addEventListener('input', event => {
  const query = event.target.value.trim().toLowerCase();
  const filtered = projects.filter(project => `${project.name} ${project.category} ${project.action}`.toLowerCase().includes(query));
  $('#all-list').innerHTML = filtered.length
    ? filtered.map(project => projectMarkup(project)).join('')
    : '<div class="empty-list"><strong>No matching projects.</strong>Try another search.</div>';
  bindProjectButtons();
});
$('#project-dialog').addEventListener('click', event => {
  if (event.target === $('#project-dialog')) $('#project-dialog').close();
});

updateLists();
setPage('focus');
