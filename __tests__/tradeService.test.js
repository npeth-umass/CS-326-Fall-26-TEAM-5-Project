import { jest } from '@jest/globals';

jest.unstable_mockModule('../repositories/tradeRepository.js', () => ({
  getAll: jest.fn(),
  create: jest.fn(),
  removeAt: jest.fn(),
}));

const { createTrade, deleteTrade } = await import('../services/tradeService.js');
const { create, removeAt } = await import('../repositories/tradeRepository.js');
const valid = { name: 'Warren, Elizabeth', stock: 'NVDA', shares: '10', pricePerShare: '120.5' };

beforeEach(() => {
  jest.resetAllMocks();
  create.mockImplementation(async (trade) => trade);
});

describe('createTrade', () => {
  test('saves a valid trade and returns it', async () => {
    const result = await createTrade(valid);

    expect(result.ok).toBe(true);
    expect(result.value).toEqual({
      name: 'Warren, Elizabeth',
      stock: 'NVDA',
      shares: 10,
      pricePerShare: 120.5,
      totalSpent: 1205,
    });
    expect(create).toHaveBeenCalledTimes(1);
  });

  test('trims spaces from name and stock before saving', async () => {
    await createTrade({ ...valid, name: '  Warren, Elizabeth  ', stock: '  NVDA  ' });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Warren, Elizabeth', stock: 'NVDA' })
    );
  });

  test('computes totalSpent itself and ignores one sent by the client', async () => {
    await createTrade({ ...valid, shares: '3', pricePerShare: '20', totalSpent: '999999' });

    expect(create).toHaveBeenCalledWith(expect.objectContaining({ totalSpent: 60 }));
  });

  test('rounds totalSpent to cents', async () => {
    const result = await createTrade({ ...valid, shares: '3', pricePerShare: '0.1' });

    expect(result.value.totalSpent).toBe(0.3); 
  });

  test('stores shares and price as numbers, not strings', async () => {
    const result = await createTrade(valid);

    expect(typeof result.value.shares).toBe('number');
    expect(typeof result.value.pricePerShare).toBe('number');
  });

  // Every rejection: exact status, exact message, and nothing saved
  const rejections = [
    // [description, input, message]
    ['name is missing', { ...valid, name: undefined }, 'Politician name is required.'],
    ['name is empty', { ...valid, name: '' }, 'Politician name is required.'],
    ['name is only spaces', { ...valid, name: '   ' }, 'Politician name is required.'],
    ['name is not a string', { ...valid, name: 5 }, 'Politician name is required.'],
    ['stock is missing', { ...valid, stock: undefined }, 'Stock is required.'],
    ['stock is empty', { ...valid, stock: '' }, 'Stock is required.'],
    ['stock is only spaces', { ...valid, stock: '   ' }, 'Stock is required.'],
    ['shares is missing', { ...valid, shares: undefined }, 'Shares must be a positive whole number.'],
    ['shares is empty', { ...valid, shares: '' }, 'Shares must be a positive whole number.'],
    ['shares is zero', { ...valid, shares: '0' }, 'Shares must be a positive whole number.'],
    ['shares is negative', { ...valid, shares: '-5' }, 'Shares must be a positive whole number.'],
    ['shares is a decimal', { ...valid, shares: '2.5' }, 'Shares must be a positive whole number.'],
    ['shares is not a number', { ...valid, shares: 'ten' }, 'Shares must be a positive whole number.'],
    ['price is missing', { ...valid, pricePerShare: undefined }, 'Price per share must be a positive number.'],
    ['price is empty', { ...valid, pricePerShare: '' }, 'Price per share must be a positive number.'],
    ['price is zero', { ...valid, pricePerShare: '0' }, 'Price per share must be a positive number.'],
    ['price is negative', { ...valid, pricePerShare: '-1' }, 'Price per share must be a positive number.'],
    ['price is not a number', { ...valid, pricePerShare: 'abc' }, 'Price per share must be a positive number.'],
  ];

  test.each(rejections)('rejects with 400 when %s', async (_description, input, message) => {
    const result = await createTrade(input);

    expect(result.ok).toBe(false);
    expect(result.error).toEqual({ status: 400, message });
    expect(create).not.toHaveBeenCalled();
  });

  test('rejects with 400 when called with no input at all', async () => {
    const result = await createTrade();

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });
});

describe('deleteTrade', () => {
  test('removes a trade that exists', async () => {
    removeAt.mockResolvedValueOnce(true);

    const result = await deleteTrade('2');

    expect(result.ok).toBe(true);
    expect(removeAt).toHaveBeenCalledWith(2); // the id is converted to a number
  });

  test('returns 404 when the repository finds no trade at that position', async () => {
    removeAt.mockResolvedValueOnce(false);

    const result = await deleteTrade('99');

    expect(result.ok).toBe(false);
    expect(result.error).toEqual({ status: 404, message: 'Trade not found' });
  });

  test.each([
    ['not a number', 'abc'],
    ['negative', '-1'],
    ['a decimal', '1.5'],
  ])('returns 404 without touching the repository when the id is %s', async (_description, id) => {
    const result = await deleteTrade(id);

    expect(result.ok).toBe(false);
    expect(result.error).toEqual({ status: 404, message: 'Trade not found' });
    expect(removeAt).not.toHaveBeenCalled();
  });
});