import { jest } from "@jest/globals";

jest.unstable_mockModule("../repositories/tradeRepository.js", () => ({
  getAll: jest.fn(),
  create: jest.fn(),
  removeById: jest.fn(),
  findById: jest.fn(),
}));

const { createTrade, deleteTrade, isOwnerOrAdmin } =
  await import("../services/tradeService.js");
const { create, removeById, findById } =
  await import("../repositories/tradeRepository.js");
const tradeId = "6650f1c2a1b2c3d4e5f60718";

const member = {
  id: "6650f1c2a1b2c3d4e5f60001",
  email: "a@example.com",
  role: "member",
};
const otherMember = {
  id: "6650f1c2a1b2c3d4e5f60002",
  email: "b@example.com",
  role: "member",
};
const admin = {
  id: "6650f1c2a1b2c3d4e5f60003",
  email: "admin@example.com",
  role: "admin",
};
const valid = {
  name: "Warren, Elizabeth",
  stock: "NVDA",
  shares: "10",
  pricePerShare: "120.5",
};

beforeEach(() => {
  jest.resetAllMocks();
  create.mockImplementation(async (trade) => ({ _id: tradeId, ...trade }));
});

describe("createTrade", () => {
  test("saves a valid trade and returns it", async () => {
    const result = await createTrade(valid, member);

    expect(result.ok).toBe(true);
    expect(result.value).toEqual({
      id: tradeId,
      name: "Warren, Elizabeth",
      stock: "NVDA",
      shares: 10,
      pricePerShare: 120.5,
      totalSpent: 1205,
    });
    expect(create).toHaveBeenCalledTimes(1);
  });

  test("trims spaces from name and stock before saving", async () => {
    await createTrade(
      {
        ...valid,
        name: "  Warren, Elizabeth  ",
        stock: "  NVDA  ",
      },
      member,
    );

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Warren, Elizabeth", stock: "NVDA" }),
    );
  });

  test("computes totalSpent itself and ignores one sent by the client", async () => {
    await createTrade(
      {
        ...valid,
        shares: "3",
        pricePerShare: "20",
        totalSpent: "999999",
      },
      member,
    );

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ totalSpent: 60 }),
    );
  });

  test("rounds totalSpent to cents", async () => {
    const result = await createTrade(
      {
        ...valid,
        shares: "3",
        pricePerShare: "0.1",
      },
      member,
    );

    expect(result.value.totalSpent).toBe(0.3);
  });

  test("stores shares and price as numbers, not strings", async () => {
    const result = await createTrade(valid, member);

    expect(typeof result.value.shares).toBe("number");
    expect(typeof result.value.pricePerShare).toBe("number");
  });

  test("sets the owner from the logged-in user", async () => {
    await createTrade(valid, member);

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ ownerId: member.id }),
    );
  });

  test("ignores an ownerId sent by the client", async () => {
    await createTrade({ ...valid, ownerId: otherMember.id }, member);

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ ownerId: member.id }),
    );
  });

  test("rejects with 401 and saves nothing when nobody is logged in", async () => {
    const result = await createTrade(valid, undefined);

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(401);
    expect(create).not.toHaveBeenCalled();
  });

  // Every rejection: exact status, exact message, and nothing saved
  const rejections = [
    // [description, input, message]
    [
      "name is missing",
      { ...valid, name: undefined },
      "Politician name is required.",
    ],
    ["name is empty", { ...valid, name: "" }, "Politician name is required."],
    [
      "name is only spaces",
      { ...valid, name: "   " },
      "Politician name is required.",
    ],
    [
      "name is not a string",
      { ...valid, name: 5 },
      "Politician name is required.",
    ],
    ["stock is missing", { ...valid, stock: undefined }, "Stock is required."],
    ["stock is empty", { ...valid, stock: "" }, "Stock is required."],
    ["stock is only spaces", { ...valid, stock: "   " }, "Stock is required."],
    [
      "shares is missing",
      { ...valid, shares: undefined },
      "Shares must be a positive whole number.",
    ],
    [
      "shares is empty",
      { ...valid, shares: "" },
      "Shares must be a positive whole number.",
    ],
    [
      "shares is zero",
      { ...valid, shares: "0" },
      "Shares must be a positive whole number.",
    ],
    [
      "shares is negative",
      { ...valid, shares: "-5" },
      "Shares must be a positive whole number.",
    ],
    [
      "shares is a decimal",
      { ...valid, shares: "2.5" },
      "Shares must be a positive whole number.",
    ],
    [
      "shares is not a number",
      { ...valid, shares: "ten" },
      "Shares must be a positive whole number.",
    ],
    [
      "price is missing",
      { ...valid, pricePerShare: undefined },
      "Price per share must be a positive number.",
    ],
    [
      "price is empty",
      { ...valid, pricePerShare: "" },
      "Price per share must be a positive number.",
    ],
    [
      "price is zero",
      { ...valid, pricePerShare: "0" },
      "Price per share must be a positive number.",
    ],
    [
      "price is negative",
      { ...valid, pricePerShare: "-1" },
      "Price per share must be a positive number.",
    ],
    [
      "price is not a number",
      { ...valid, pricePerShare: "abc" },
      "Price per share must be a positive number.",
    ],
  ];

  test.each(rejections)(
    "rejects with 400 when %s",
    async (_description, input, message) => {
      const result = await createTrade(input, member);

      expect(result.ok).toBe(false);
      expect(result.error).toEqual({ status: 400, message });
      expect(create).not.toHaveBeenCalled();
    },
  );

  test("rejects with 400 when called with no input at all", async () => {
    const result = await createTrade(undefined, member);

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });
});

describe("deleteTrade", () => {
  const id = "6650f1c2a1b2c3d4e5f60718";

  test("removes a trade that exists", async () => {
    findById.mockResolvedValueOnce({ _id: id, ownerId: member.id });

    const result = await deleteTrade(id, member);

    expect(result.ok).toBe(true);
    expect(removeById).toHaveBeenCalledWith(id);
  });

  test("returns 404 and removes nothing when the trade does not exist", async () => {
    findById.mockResolvedValueOnce(null);

    const result = await deleteTrade(id, member);

    expect(result.ok).toBe(false);
    expect(result.error).toEqual({ status: 404, message: "Trade not found" });
    expect(removeById).not.toHaveBeenCalled();
  });
});

describe("deleteTrade authorization", () => {
  const id = "6650f1c2a1b2c3d4e5f60718";
  const ownedByMember = { _id: id, ownerId: member.id };

  test("rejects a non-owner with 403 and removes nothing", async () => {
    findById.mockResolvedValueOnce(ownedByMember);

    const result = await deleteTrade(id, otherMember);

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(403);
    expect(removeById).not.toHaveBeenCalled();
  });

  test("lets the owner delete their own trade", async () => {
    findById.mockResolvedValueOnce(ownedByMember);

    const result = await deleteTrade(id, member);

    expect(result.ok).toBe(true);
    expect(removeById).toHaveBeenCalledWith(id);
  });

  test("lets an admin delete someone else's trade", async () => {
    findById.mockResolvedValueOnce(ownedByMember);

    const result = await deleteTrade(id, admin);

    expect(result.ok).toBe(true);
    expect(removeById).toHaveBeenCalledWith(id);
  });

  test("a trade with no owner (seeded) is admin-only", async () => {
    findById.mockResolvedValueOnce({ _id: id });
    const asMember = await deleteTrade(id, member);

    findById.mockResolvedValueOnce({ _id: id });
    const asAdmin = await deleteTrade(id, admin);

    expect(asMember.error.status).toBe(403);
    expect(asAdmin.ok).toBe(true);
  });

  test("compares ids as strings, so a Mongo ObjectId owner still matches", async () => {
    const objectIdLike = { toString: () => member.id };
    findById.mockResolvedValueOnce({ _id: id, ownerId: objectIdLike });

    const result = await deleteTrade(id, member);

    expect(result.ok).toBe(true);
  });

  test("returns 404, not 403, when the trade does not exist", async () => {
    findById.mockResolvedValueOnce(null);

    const result = await deleteTrade(id, otherMember);

    expect(result.error.status).toBe(404);
    expect(removeById).not.toHaveBeenCalled();
  });

  test("returns 401 and does not even look the trade up when nobody is logged in", async () => {
    const result = await deleteTrade(id, undefined);

    expect(result.error.status).toBe(401);
    expect(findById).not.toHaveBeenCalled();
    expect(removeById).not.toHaveBeenCalled();
  });
});

describe("isOwnerOrAdmin", () => {
  test.each([
    ["the owner", member, { ownerId: member.id }, true],
    ["another member", otherMember, { ownerId: member.id }, false],
    ["an admin", admin, { ownerId: member.id }, true],
    ["an admin on an ownerless trade", admin, {}, true],
    ["a member on an ownerless trade", member, {}, false],
    ["nobody logged in", undefined, { ownerId: member.id }, false],
  ])("%s", (_who, user, trade, expected) => {
    expect(isOwnerOrAdmin(user, trade)).toBe(expected);
  });
});
