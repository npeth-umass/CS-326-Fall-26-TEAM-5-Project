
import { Ok, Err } from '../result.js';
import { getAll, create, removeByName } from '../repositories/politicianRepository.js';
import { toPoliticianDto } from '../dtos/politicianDto.js';

const REQUIRED_FIELDS = ['name', 'party', 'state', 'chamber'];

const normalizeName = (name) => name.trim().toLowerCase();

function validatePolitician(input = {}) {
  const politician = {};

  for (const field of REQUIRED_FIELDS) {
    if (typeof input[field] !== 'string' || !input[field].trim()) {
      return Err({ status: 400, message: `${field} is required` });
    }

    politician[field] = input[field].trim();
  }

  if (input.district !== undefined && input.district !== null && input.district !== '') {
    const district = Number(input.district);

    if (!Number.isInteger(district) || district < 0) {
      return Err({
        status: 400,
        message: 'district must be a non-negative whole number'
      });
    }

    politician.district = district;
  }

  // I genuinely don't know why they called it a 'bioguide' but it's just a unique
  // id number for each congress person
  for (const field of ['bioguideId', 'imageUrl']) {
    if (typeof input[field] === 'string' && input[field].trim()) {
      politician[field] = input[field].trim();
    }
  }

  return Ok(politician);
}

export async function listPoliticians(name) {
  const politicians = await getAll();
  const search = typeof name === 'string' ? normalizeName(name) : '';

  const matches = search
    ? politicians.filter((politician) =>
        normalizeName(politician.name).includes(search)
      )
    : politicians;

  return matches.map(toPoliticianDto);
}

export async function createPolitician(input) {
  const validation = validatePolitician(input);

  if (!validation.ok) return validation;

  const politicians = await getAll();
  const name = normalizeName(validation.value.name);

  if (politicians.some((politician) => normalizeName(politician.name) === name)) {
    return Err({
      status: 409,
      message: `A politician named "${validation.value.name}" already exists`
    });
  }

  const created = await create(validation.value);
  return Ok(toPoliticianDto(created));
}

export async function deletePolitician(name) {
  if (typeof name !== 'string' || !name.trim()) {
    return Err({ status: 400, message: 'name is required' });
  }

  const removed = await removeByName(name.trim());

  if (!removed) {
    return Err({ status: 404, message: 'Politician not found' });
  }

  return Ok(null);
}
