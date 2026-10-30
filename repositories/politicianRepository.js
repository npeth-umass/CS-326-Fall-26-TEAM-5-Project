import { readFile, writeFile } from 'fs/promises';

// Just puts all the data in the data folder and in politicians.json
const DATA_DIR = new URL('../data/', import.meta.url);
const DATA_FILE = new URL('politicians.json', DATA_DIR);

export const getAll = async () => {
  const data = await readFile(DATA_FILE, 'utf-8');
  return JSON.parse(data);
};

export async function writeData(politicians) {
  await fs.writeFile(DATA_FILE, JSON.stringify(politicians, null, 2));
}
