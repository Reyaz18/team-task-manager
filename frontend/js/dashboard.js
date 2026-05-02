const API = 'https://team-task-manager-production-218d.up.railway.app/api';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token) window.location.href = 'index.html';

document.getElementById('user-name').textContent = user.name || '';
document.getElementById('user-role').textContent = user.role || '';

if (user.role === 'Admin') {
  document.getElementById('create-project-btn').classList.remove('hidden');
  document.getElementById('create-task-btn').classList.remove('hidden');
}

function logout() { localStorage.clear(); window.location.href = 'index.html'; }

const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

let allProjects = [];

async function loadStats() {
  try {
    const res = await fetch(`${API}/tasks/stats/dashboard`, { headers });
    const data = await res.json();
    document.getElementById('stat-total').textContent = data.total || 0;
    document.getElementById('stat-inprogress').textContent = data.inProgress || 0;
    document.getElementById('stat-done').textContent = data.done || 0;
    document.getElementById('stat-overdue').textContent = data.overdue || 0;
  } catch(e) {}
}

async function loadProjects() {
  const res = await fetch(`${API}/projects`, { headers });
  allProjects = await res.json();
  const container = document.getElementById('projects-list');
  if (!allProjects.length) {
    container.innerHTML = '<p class="text-gray-400 col-span-3">No projects yet.</p>';
    return;
  }
  container.innerHTML = allProjects.map(p => `
    <div class="bg-white rounded-xl p-4 shadow hover:shadow-md transition">
      <div class="flex justify-between items-start">
        <div class="cursor-pointer flex-1" onclick="filterTasks('', '${p._id}')">
          <h3 class="font-bold text-gray-800">${p.name}</h3>
          <p class="text-gray-500 text-sm mt-1">${p.description || 'No description'}</p>
          <p class="text-xs text-gray-400 mt-2">By: ${p.createdBy?.name || 'Unknown'}</p>
          <p class="text-xs text-gray-400">Members: ${p.members?.length || 0}</p>
        </div>
        ${user.role === 'Admin' ? `
          <button onclick="deleteProject('${p._id}')" class="text-xs text-red-500 hover:underline ml-2 mt-1">Delete</button>
        ` : ''}
      </div>
    </div>
  `).join('');
}

async function deleteProject(id) {
  if (!confirm('Delete this project?')) return;
  await fetch(`${API}/projects/${id}`, { method: 'DELETE', headers });
  loadProjects();
}

async function loadTasks(status = '', projectId = '') {
  let url = `${API}/tasks?`;
  if (status) url += `status=${encodeURIComponent(status)}&`;
  if (projectId) url += `project=${projectId}`;
  const res = await fetch(url, { headers });
  const tasks = await res.json();
  renderTasks(tasks);
}

function renderTasks(tasks) {
  const container = document.getElementById('tasks-list');
  if (!tasks.length) { container.innerHTML = '<p class="text-gray-400">No tasks found.</p>'; return; }
  const statusColors = { 'Todo': 'bg-gray-100 text-gray-700', 'In Progress': 'bg-yellow-100 text-yellow-700', 'Done': 'bg-green-100 text-green-700' };
  const priorityColors = { 'Low': 'text-green-500', 'Medium': 'text-yellow-500', 'High': 'text-red-500' };
  container.innerHTML = tasks.map(t => `
    <div class="bg-white rounded-xl p-4 shadow flex justify-between items-start">
      <div>
        <h3 class="font-semibold text-gray-800">${t.title}</h3>
        <p class="text-gray-500 text-sm">${t.description || ''}</p>
        <div class="flex gap-2 mt-2 flex-wrap">
          <span class="text-xs px-2 py-1 rounded ${statusColors[t.status] || ''}">${t.status}</span>
          <span class="text-xs font-semibold ${priorityColors[t.priority] || ''}">⬆ ${t.priority}</span>
          ${t.dueDate ? `<span class="text-xs text-gray-400">Due: ${new Date(t.dueDate).toLocaleDateString()}</span>` : ''}
          ${t.assignedTo ? `<span class="text-xs text-blue-500">👤 ${t.assignedTo.name}</span>` : ''}
          ${t.project ? `<span class="text-xs text-purple-500">📁 ${t.project.name}</span>` : ''}
        </div>
      </div>
      <div class="flex flex-col gap-1 ml-4">
        ${user.role === 'Member' ? `
          <select onchange="updateTaskStatus('${t._id}', this.value)" class="text-xs border rounded p-1">
            <option ${t.status==='Todo'?'selected':''}>Todo</option>
            <option ${t.status==='In Progress'?'selected':''}>In Progress</option>
            <option ${t.status==='Done'?'selected':''}>Done</option>
          </select>
        ` : `
          <button onclick="deleteTask('${t._id}')" class="text-xs text-red-500 hover:underline">Delete</button>
        `}
      </div>
    </div>
  `).join('');
}

function filterTasks(status, projectId = '') { loadTasks(status, projectId); }

async function updateTaskStatus(id, status) {
  await fetch(`${API}/tasks/${id}`, { method: 'PUT', headers, body: JSON.stringify({ status }) });
  loadTasks(); loadStats();
}

async function deleteTask(id) {
  if (!confirm('Delete this task?')) return;
  await fetch(`${API}/tasks/${id}`, { method: 'DELETE', headers });
  loadTasks(); loadStats();
}

function showCreateProject() { document.getElementById('create-project-form').classList.remove('hidden'); }
function hideCreateProject() { document.getElementById('create-project-form').classList.add('hidden'); }

async function createProject() {
  const name = document.getElementById('proj-name').value;
  const description = document.getElementById('proj-desc').value;
  const membersInput = document.getElementById('proj-members').value;
  const members = membersInput ? membersInput.split(',').map(id => id.trim()).filter(id => id) : [];
  if (!name) return alert('Project name required');
  const res = await fetch(`${API}/projects`, { method: 'POST', headers, body: JSON.stringify({ name, description, members }) });
  const data = await res.json();
  if (!res.ok) return alert(data.message);
  hideCreateProject();
  document.getElementById('proj-name').value = '';
  document.getElementById('proj-desc').value = '';
  document.getElementById('proj-members').value = '';
  loadProjects();
}

function showCreateTask() {
  document.getElementById('create-task-form').classList.remove('hidden');
  const projSelect = document.getElementById('task-project-select');
  projSelect.innerHTML = '<option value="">-- Select Project --</option>' +
    allProjects.map(p => `<option value="${p._id}">${p.name}</option>`).join('');
}
function hideCreateTask() { document.getElementById('create-task-form').classList.add('hidden'); }

async function createTask() {
  const title = document.getElementById('task-title').value;
  const description = document.getElementById('task-desc').value;
  const priority = document.getElementById('task-priority').value;
  const dueDate = document.getElementById('task-due').value;
  const project = document.getElementById('task-project-select').value;
  const assignedTo = document.getElementById('task-assigned').value.trim();
  if (!title) return alert('Task title required');
  if (!project) return alert('Please select a project');
  const body = { title, description, priority, project };
  if (dueDate) body.dueDate = dueDate;
  if (assignedTo) body.assignedTo = assignedTo;
  const res = await fetch(`${API}/tasks`, { method: 'POST', headers, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) return alert(data.message);
  hideCreateTask();
  document.getElementById('task-title').value = '';
  document.getElementById('task-desc').value = '';
  document.getElementById('task-assigned').value = '';
  loadTasks(); loadStats();
}

loadStats();
loadProjects();
loadTasks();