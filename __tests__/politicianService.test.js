import { jest } from '@jest/globals';

jest.unstable_mockModule('../repositories/politicianRepository.js', () => ({
  getAll: jest.fn(),
  create: jest.fn(),
  removeByName: jest.fn(),
}));

jest.unstable_mockModule('../dtos/politicianDto.js', () => ({
  toPoliticianDto: jest.fn((politician) => politician),
}));

const { createPolitician, deletePolitician, listPoliticians } = await import(
  '../services/politicianService.js'
);
const { getAll, create, removeByName } = await import('../repositories/politicianRepository.js');
const { toPoliticianDto } = await import('../dtos/politicianDto.js');

const valid = {
  name: 'Pressley, Ayanna',
  party: 'Democratic',
  state: 'Massachusetts',
  chamber: 'House of Representatives',
};

const existing = [
  { name: 'Warren, Elizabeth', party: 'Democratic', state: 'Massachusetts', chamber: 'Senate' },
  { name: 'Markey, Edward J.', party: 'Democratic', state: 'Massachusetts', chamber: 'Senate' },
];

beforeEach(() => {
  jest.resetAllMocks();
  getAll.mockResolvedValue(existing);
  create.mockImplementation(async (politician) => politician);
  toPoliticianDto.mockImplementation((politician) => politician);
});

describe('createPolitician', () => {
  test('saves a valid politician and returns its DTO', async () => {
    const result = await createPolitician(valid);

    expect(result.ok).toBe(true);
    expect(result.value).toEqual(valid);
    expect(create).toHaveBeenCalledWith(valid);
    expect(toPoliticianDto).toHaveBeenCalledWith(valid);
  });

  test('trims spaces from every required field before saving', async () => {
    await createPolitician({
      name: '  Pressley, Ayanna ',
      party: ' Democratic ',
      state: ' Massachusetts ',
      chamber: ' House of Representatives ',
    });

    expect(create).toHaveBeenCalledWith(valid);
  });

  test('converts district to a number', async () => {
    await createPolitician({ ...valid, district: '7' });

    expect(create).toHaveBeenCalledWith({ ...valid, district: 7 });
  });

  test('accepts district 0', async () => {
    const result = await createPolitician({ ...valid, district: '0' });

    expect(result.ok).toBe(true);
    expect(create).toHaveBeenCalledWith({ ...valid, district: 0 });
  });

  test('leaves district out when it is blank', async () => {
    await createPolitician({ ...valid, district: '' });

    expect(create).toHaveBeenCalledWith(valid);
  });

  test('keeps optional bioguideId and imageUrl, trimmed', async () => {
    await createPolitician({ ...valid, bioguideId: ' P000617 ', imageUrl: ' https://x.test/a.jpg ' });

    expect(create).toHaveBeenCalledWith({
      ...valid,
      bioguideId: 'P000617',
      imageUrl: 'https://x.test/a.jpg',
    });
  });

  test('drops fields the service does not know about', async () => {
    await createPolitician({ ...valid, isAdmin: true });

    expect(create).toHaveBeenCalledWith(valid);
  });

  const required = ['name', 'party', 'state', 'chamber'];
  const badValues = [
    ['missing', undefined],
    ['empty', ''],
    ['only spaces', '   '],
    ['not a string', 42],
  ];
  const requiredCases = required.flatMap((field) =>
    badValues.map(([how, value]) => [field, how, value])
  );

  test.each(requiredCases)('rejects with 400 when %s is %s', async (field, _how, value) => {
    const result = await createPolitician({ ...valid, [field]: value });

    expect(result.ok).toBe(false);
    expect(result.error).toEqual({ status: 400, message: `${field} is required` });
    expect(create).not.toHaveBeenCalled();
  });

  test('rejects with 400 when called with no input at all', async () => {
    const result = await createPolitician();

    expect(result.ok).toBe(false);
    expect(result.error).toEqual({ status: 400, message: 'name is required' });
    expect(create).not.toHaveBeenCalled();
  });

  test.each([
    ['negative', '-1'],
    ['a decimal', '2.5'],
    ['not a number', 'seven'],
  ])('rejects with 400 when district is %s', async (_how, district) => {
    const result = await createPolitician({ ...valid, district });

    expect(result.ok).toBe(false);
    expect(result.error).toEqual({
      status: 400,
      message: 'district must be a non-negative whole number',
    });
    expect(create).not.toHaveBeenCalled();
  });

  test('rejects with 409 when a politician with the same name already exists', async () => {
    const result = await createPolitician({ ...valid, name: 'Warren, Elizabeth' });

    expect(result.ok).toBe(false);
    expect(result.error).toEqual({
      status: 409,
      message: 'A politician named "Warren, Elizabeth" already exists',
    });
    expect(create).not.toHaveBeenCalled();
  });

  test('treats names that differ only in capitals or spaces as duplicates', async () => {
    const result = await createPolitician({ ...valid, name: '  warren, ELIZABETH ' });

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(409);
    expect(create).not.toHaveBeenCalled();
  });
});

describe('deletePolitician', () => {
  test('removes a politician that exists', async () => {
    removeByName.mockResolvedValueOnce(true);

    const result = await deletePolitician('Warren, Elizabeth');

    expect(result.ok).toBe(true);
    expect(removeByName).toHaveBeenCalledWith('Warren, Elizabeth');
  });

  test('trims the name before removing', async () => {
    removeByName.mockResolvedValueOnce(true);

    await deletePolitician('  Warren, Elizabeth  ');

    expect(removeByName).toHaveBeenCalledWith('Warren, Elizabeth');
  });

  test('returns 404 when the politician does not exist', async () => {
    removeByName.mockResolvedValueOnce(false);

    const result = await deletePolitician('Nobody, Someone');

    expect(result.ok).toBe(false);
    expect(result.error).toEqual({ status: 404, message: 'Politician not found' });
  });

  test.each([
    ['missing', undefined],
    ['empty', ''],
    ['only spaces', '   '],
  ])('returns 400 without touching the repository when the name is %s', async (_how, name) => {
    const result = await deletePolitician(name);

    expect(result.ok).toBe(false);
    expect(result.error).toEqual({ status: 400, message: 'name is required' });
    expect(removeByName).not.toHaveBeenCalled();
  });
});

describe('listPoliticians', () => {
  test('returns everyone when no search name is given', async () => {
    const result = await listPoliticians();

    expect(result).toEqual(existing);
  });

  test('matches part of a name, ignoring capitals and spaces', async () => {
    const result = await listPoliticians('  WARREN ');

    expect(result).toEqual([existing[0]]);
  });

  test('returns an empty list when nobody matches', async () => {
    const result = await listPoliticians('Nobody');

    expect(result).toEqual([]);
  });
});