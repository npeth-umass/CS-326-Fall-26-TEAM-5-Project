import fs from 'node:fs/promises';

// Just puts all the data in the data folder and in politicians.json
const DATA_FILE = new URL('../data/politicians.json', import.meta.url);

export async function getAll() {
  try {
    return JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeData(politicians) {
  await fs.writeFile(DATA_FILE, JSON.stringify(politicians, null, 2));
}

export async function create(politician) {
  const politicians = await getAll();
  politicians.push(politician);
  await writeData(politicians);
  return politician;
}

export async function removeByName(name) {
  const politicians = await getAll();
  const index = politicians.findIndex((politician) => politician.name === name);
  if (index === -1) return false;
  politicians.splice(index, 1);
  await writeData(politicians);
  return true;
}