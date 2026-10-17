import { readFile, access, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../', import.meta.url));
const site = path.join(root, 'site');
const collection = JSON.parse(await readFile(path.join(site, 'projects.json'), 'utf8'));
const categories = new Set(['campus', 'ai', 'learning']);
const ids = new Set();
assert(Array.isArray(collection.projects) && collection.projects.length > 0, 'Provide a non-empty project collection');
function https(url, field) {
  const parsed = new URL(url);
  assert.equal(parsed.protocol, 'https:', `${field} must use HTTPS`);
  assert(!parsed.username && !parsed.password, `${field} must not contain credentials`);
  return parsed;
}
for (const project of collection.projects) {
  assert(/^[a-z0-9-]+$/.test(project.id) && !ids.has(project.id), `Unique safe project ID: ${project.id}`);
  ids.add(project.id);
  for (const key of ['title', 'description', 'categoryLabel', 'status', 'collaboration']) {
    assert(typeof project[key] === 'string' && project[key].trim(), `${project.id}: missing ${key}`);
  }
  assert(project.categories?.length && project.categories.every(c => categories.has(c)), `${project.id}: unknown category`);
  const repository = https(project.repository, 'repository');
  assert.equal(repository.hostname, 'github.com', 'Project repository must be a public GitHub link');
  assert(/^\/[^/]+\/[^/]+\/?$/.test(repository.pathname), 'Use a repository URL, not a subpage');
  if (project.community) assert.equal(https(project.community, 'community').hostname, 'github.com');
  if (project.demo) https(project.demo, 'demo');
  assert(Array.isArray(project.creators) && project.creators.length > 0, `${project.id}: credit the creators`);
  for (const creator of project.creators) {
    assert(creator.name?.trim(), 'Creator name required');
    https(creator.url, 'creator');
  }
  assert(Array.isArray(project.tags) && project.tags.every(t => typeof t === 'string'), 'Project tags must be strings');
  if (project.image) {
    assert(project.image.startsWith('assets/') && !project.image.includes('..'), 'Project image must be a local asset');
    await access(path.join(site, project.image));
    assert(project.imageAlt?.trim(), 'Project image needs alt text');
  }
}
async function walk(folder) {
  const files = [];
  for (const entry of await readdir(folder)) {
    const full = path.join(folder, entry);
    if ((await stat(full)).isDirectory()) files.push(...await walk(full));
    else files.push(full);
  }
  return files;
}
const files = await walk(site);
for (const file of files.filter(f => f.endsWith('.html'))) {
  const html = await readFile(file, 'utf8');
  assert(/<html lang="en">/.test(html), 'Document language required');
  assert(/<meta name="viewport"/.test(html), 'Responsive viewport required');
  assert(/<title>[^<]+<\/title>/.test(html), 'Document title required');
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const target = match[1];
    if (/^(https:|mailto:)/.test(target)) continue;
    if (target.startsWith('#')) {
      assert(html.includes(`id="${target.slice(1)}"`), `${file}: missing section ${target}`);
      continue;
    }
    const targetPath = target.split(/[?#]/)[0];
    const destination = targetPath.startsWith('/') ? path.resolve(site, '.' + targetPath) : path.resolve(path.dirname(file), targetPath);
    assert(destination === site || destination.startsWith(site + path.sep), `${file}: path escapes site`);
    await access(destination);
    if ((await stat(destination)).isDirectory()) await access(path.join(destination, 'index.html'));
  }
  for (const image of html.matchAll(/<img\b[^>]*>/g)) assert(/\balt="[^"]*"/.test(image[0]), 'Every image needs alt text');
}
assert(files.every(f => !/\.git|\.env|\.pem|\.key$/.test(path.relative(site, f))), 'Only public website files may be deployed');
assert(!files.some(f => /member-profile|\.github-private|first-redesign\/profile/.test(f)), 'Private archive content must not ship with the website');
console.log(`Validated ${ids.size} credited projects, ${files.filter(f => f.endsWith('.html')).length} pages, local links, image alternatives, HTTPS URLs, and deployment boundaries.`);
