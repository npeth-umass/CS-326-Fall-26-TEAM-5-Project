import fs from 'node:fs/promises';

// Just puts all the data in the data folder and in politicians.json
const DATA_DIR = new URL('../data/', import.meta.url);
const DATA_FILE = new URL('politicians.json', DATA_DIR);

async function readData() {
  const contents = await fs.readFile(DATA_FILE, 'utf8');
  const politicians = JSON.parse(contents);
  return politicians;
}

// Creates file if not already there
async function writeData(politicians) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(politicians, null, 2));
}

export const getAll = () => readData();

export async function create(politician) {
  const politicians = await readData();
  politicians.push(politician);
  await writeData(politicians);
  return politician;
}

export async function removeByName(name) {
  const politicians = await readData();
  const index = politicians.findIndex((politician) => politician.name === name);
  if (index === -1) return false;
  politicians.splice(index, 1);
  await writeData(politicians);
  return true;
}
