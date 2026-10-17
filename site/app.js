const grid = document.querySelector('#project-grid');
const search = document.querySelector('#project-search');
const filters = [...document.querySelectorAll('[data-filter]')];
let projects = [];
let activeFilter = 'all';

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function safeLink(text, url, className = '') {
  const link = element('a', className, text);
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:') throw new Error('Unsupported project link');
  link.href = parsed.href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}
function projectArt(project) {
  const art = element('div', `project-art art-${project.id}`);
  if (project.image) {
    const img = element('img');
    img.src = project.image;
    img.alt = project.imageAlt;
    img.loading = 'lazy';
    img.width = 660;
    img.height = 400;
    art.append(img);
  } else if (project.id === 'studybooks') {
    art.setAttribute('aria-hidden', 'true');
    const books = element('div', 'book-art');
    for (const title of ['Learn it.', 'Keep it.']) {
      const sheet = element('div', 'book-sheet');
      sheet.append(element('small', '', 'Course notes'), element('strong', '', title));
      for (let i = 0; i < 4; i++) sheet.append(element('span'));
      books.append(sheet);
    }
    art.append(books);
  } else {
    art.setAttribute('aria-hidden', 'true');
    const network = element('div', 'network-art');
    for (const size of [3, 4, 2]) {
      const column = element('div', 'node-column');
      for (let i = 0; i < size; i++) column.append(element('span', 'network-node'));
      network.append(column);
    }
    art.append(network);
  }
  return art;
}
function card(project) {
  const article = element('article', 'project-card');
  const meta = element('div', 'card-meta');
  meta.append(element('span', '', project.categoryLabel), element('span', 'card-status', project.status));
  const creators = element('p', 'project-creators');
  creators.append(document.createTextNode('By '));
  project.creators.forEach((creator, index) => {
    if (index) creators.append(document.createTextNode(', '));
    creators.append(safeLink(creator.name, creator.url));
  });
  const bottom = element('div', 'card-bottom');
  bottom.append(safeLink('Explore the project ↗', project.repository));
  if (project.demo) bottom.append(safeLink(project.demoLabel || 'Try it ↗', project.demo));
  else if (project.community) bottom.append(safeLink('Build with others ↗', project.community));
  article.append(projectArt(project), meta, element('h3', '', project.title));
  if (project.academic) {
    const context = element('p', 'project-course');
    if (project.academic.modules) {
      context.append(safeLink(project.academic.modules.map(module => `${module.code} · Semester ${module.semester}`).join(' / '), project.academic.source));
      if (project.academic.kind === 'companion') context.append(document.createTextNode(' · Companion project'));
    } else context.textContent = project.academic.label;
    article.append(context);
  }
  article.append(element('p', 'project-description', project.description), creators, bottom, element('p', 'collaboration', project.collaboration));
  return article;
}
function render() {
  const query = search.value.trim().toLocaleLowerCase();
  const visible = projects.filter(project => {
    const courseTerms = project.academic?.modules?.flatMap(module => [module.code, module.name, `Semester ${module.semester}`]) || [project.academic?.label || ''];
    const haystack = [project.title, project.description, project.categoryLabel, ...courseTerms, ...project.tags, ...project.creators.map(c => c.name)].join(' ').toLocaleLowerCase();
    return (activeFilter === 'all' || project.categories.includes(activeFilter)) && haystack.includes(query);
  });
  grid.replaceChildren(...visible.map(card));
  document.querySelector('#project-count').textContent = `${visible.length} ${visible.length === 1 ? 'project' : 'projects'} to explore`;
  document.querySelector('#empty-state').hidden = visible.length !== 0;
  for (const button of filters) button.setAttribute('aria-pressed', String(button.dataset.filter === activeFilter));
}
async function loadProjects() {
  document.querySelector('#load-error').hidden = true;
  document.querySelector('#project-count').textContent = 'Opening the showroom…';
  try {
    const response = await fetch(new URL('projects.json', import.meta.url), { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Project data: ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.projects)) throw new Error('Invalid project collection');
    projects = data.projects;
    render();
  } catch {
    grid.replaceChildren();
    document.querySelector('#empty-state').hidden = true;
    document.querySelector('#load-error').hidden = false;
    document.querySelector('#project-count').textContent = 'Project catalogue unavailable';
  }
}
for (const button of filters) button.addEventListener('click', () => { activeFilter = button.dataset.filter; render(); });
search.addEventListener('input', render);
document.querySelector('#reset-search').addEventListener('click', () => { search.value = ''; activeFilter = 'all'; render(); search.focus(); });
document.querySelector('#retry-load').addEventListener('click', loadProjects);
loadProjects();
