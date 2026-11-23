import { jest } from "@jest/globals";

jest.unstable_mockModule("../repositories/politicianRepository.js", () => ({
  getAll: jest.fn(),
  create: jest.fn(),
  removeByName: jest.fn(),
  findByName: jest.fn(),
}));

jest.unstable_mockModule("../dtos/politicianDto.js", () => ({
  toPoliticianDto: jest.fn((politician) => politician),
}));

const { createPolitician, deletePolitician, listPoliticians, isOwnerOrAdmin } =
  await import("../services/politicianService.js");
const { getAll, create, removeByName, findByName } =
  await import("../repositories/politicianRepository.js");
const { toPoliticianDto } = await import("../dtos/politicianDto.js");

const admin = {
  id: "6650f1c2a1b2c3d4e5f60003",
  email: "admin@example.com",
  role: "admin",
};
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

const valid = {
  name: "Pressley, Ayanna",
  party: "Democratic",
  state: "Massachusetts",
  chamber: "House of Representatives",
};

// What the service must hand to the repository: the validated fields plus the
// owner taken from the logged-in user.
const owned = (politician) => ({ ...politician, ownerId: member.id });

const existing = [
  {
    name: "Warren, Elizabeth",
    party: "Democratic",
    state: "Massachusetts",
    chamber: "Senate",
  },
  {
    name: "Markey, Edward J.",
    party: "Democratic",
    state: "Massachusetts",
    chamber: "Senate",
  },
];

beforeEach(() => {
  jest.resetAllMocks();
  getAll.mockResolvedValue(existing);
  create.mockImplementation(async (politician) => politician);
  toPoliticianDto.mockImplementation((politician) => politician);
});

describe("createPolitician", () => {
  test("saves a valid politician and returns its DTO", async () => {
    const result = await createPolitician(valid, member);

    expect(result.ok).toBe(true);
    expect(result.value).toEqual(owned(valid));
    expect(create).toHaveBeenCalledWith(owned(valid));
    expect(toPoliticianDto).toHaveBeenCalledWith(owned(valid));
  });

  test("saves a politician with only name and party", async () => {
    const result = await createPolitician(
      {
        name: "Pressley, Ayanna",
        party: "Democratic",
      },
      member,
    );

    expect(result.ok).toBe(true);
    expect(create).toHaveBeenCalledWith(
      owned({
        name: "Pressley, Ayanna",
        party: "Democratic",
      }),
    );
  });

  test("trims spaces from every field before saving", async () => {
    await createPolitician(
      {
        name: "  Pressley, Ayanna ",
        party: " Democratic ",
        state: " Massachusetts ",
        chamber: " House of Representatives ",
      },
      member,
    );

    expect(create).toHaveBeenCalledWith(owned(valid));
  });

  test("converts district to a number", async () => {
    await createPolitician({ ...valid, district: "7" }, member);

    expect(create).toHaveBeenCalledWith(owned({ ...valid, district: 7 }));
  });

  test("accepts district 0", async () => {
    const result = await createPolitician({ ...valid, district: "0" }, member);

    expect(result.ok).toBe(true);
    expect(create).toHaveBeenCalledWith(owned({ ...valid, district: 0 }));
  });

  test("leaves district out when it is blank", async () => {
    await createPolitician({ ...valid, district: "" }, member);

    expect(create).toHaveBeenCalledWith(owned(valid));
  });

  test("keeps optional bioguideId and imageUrl, trimmed", async () => {
    await createPolitician(
      {
        ...valid,
        bioguideId: " P000617 ",
        imageUrl: " https://x.test/a.jpg ",
      },
      member,
    );

    expect(create).toHaveBeenCalledWith(
      owned({
        ...valid,
        bioguideId: "P000617",
        imageUrl: "https://x.test/a.jpg",
      }),
    );
  });

  test("drops fields the service does not know about", async () => {
    await createPolitician({ ...valid, isAdmin: true }, member);

    expect(create).toHaveBeenCalledWith(owned(valid));
  });

  const required = ["name", "party"];
  const badValues = [
    ["missing", undefined],
    ["empty", ""],
    ["only spaces", "   "],
    ["not a string", 42],
  ];
  const requiredCases = required.flatMap((field) =>
    badValues.map(([how, value]) => [field, how, value]),
  );

  test.each(requiredCases)(
    "rejects with 400 when %s is %s",
    async (field, _how, value) => {
      const result = await createPolitician(
        { ...valid, [field]: value },
        member,
      );

      expect(result.ok).toBe(false);
      expect(result.error).toEqual({
        status: 400,
        message: `${field} is required`,
      });
      expect(create).not.toHaveBeenCalled();
    },
  );

  test.each([
    ["state", undefined],
    ["state", "   "],
    ["chamber", ""],
    ["chamber", 42],
  ])(
    "saves without %s when it is blank or not a string (%p)",
    async (field, value) => {
      const { [field]: _omitted, ...rest } = valid;

      const result = await createPolitician(
        { ...valid, [field]: value },
        member,
      );

      expect(result.ok).toBe(true);
      expect(create).toHaveBeenCalledWith(owned(rest));
    },
  );

  test("rejects with 400 when called with no input at all", async () => {
    const result = await createPolitician(undefined, member);

    expect(result.ok).toBe(false);
    expect(result.error).toEqual({ status: 400, message: "name is required" });
    expect(create).not.toHaveBeenCalled();
  });

  test.each([
    ["negative", "-1"],
    ["a decimal", "2.5"],
    ["not a number", "seven"],
  ])("rejects with 400 when district is %s", async (_how, district) => {
    const result = await createPolitician({ ...valid, district }, member);

    expect(result.ok).toBe(false);
    expect(result.error).toEqual({
      status: 400,
      message: "district must be a non-negative whole number",
    });
    expect(create).not.toHaveBeenCalled();
  });

  test("rejects with 409 when a politician with the same name already exists", async () => {
    const result = await createPolitician(
      {
        ...valid,
        name: "Warren, Elizabeth",
      },
      member,
    );

    expect(result.ok).toBe(false);
    expect(result.error).toEqual({
      status: 409,
      message: 'A politician named "Warren, Elizabeth" already exists',
    });
    expect(create).not.toHaveBeenCalled();
  });

  test("treats names that differ only in capitals or spaces as duplicates", async () => {
    const result = await createPolitician(
      {
        ...valid,
        name: "  warren, ELIZABETH ",
      },
      member,
    );

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(409);
    expect(create).not.toHaveBeenCalled();
  });
});

describe("deletePolitician", () => {
  test("removes a politician that exists", async () => {
    findByName.mockResolvedValueOnce(existing[0]);

    const result = await deletePolitician("Warren, Elizabeth", admin);

    expect(result.ok).toBe(true);
    expect(removeByName).toHaveBeenCalledWith("Warren, Elizabeth");
  });

  test("trims the name before looking up and removing", async () => {
    findByName.mockResolvedValueOnce(existing[0]);

    await deletePolitician("  Warren, Elizabeth  ", admin);

    expect(findByName).toHaveBeenCalledWith("Warren, Elizabeth");
    expect(removeByName).toHaveBeenCalledWith("Warren, Elizabeth");
  });

  test("returns 404 and removes nothing when the politician does not exist", async () => {
    findByName.mockResolvedValueOnce(null);

    const result = await deletePolitician("Nobody, Someone", admin);

    expect(result.ok).toBe(false);
    expect(result.error).toEqual({
      status: 404,
      message: "Politician not found",
    });
    expect(removeByName).not.toHaveBeenCalled();
  });

  test.each([
    ["missing", undefined],
    ["empty", ""],
    ["only spaces", "   "],
  ])(
    "returns 400 without touching the repository when the name is %s",
    async (_how, name) => {
      const result = await deletePolitician(name, admin);

      expect(result.ok).toBe(false);
      expect(result.error).toEqual({
        status: 400,
        message: "name is required",
      });
      expect(findByName).not.toHaveBeenCalled();
      expect(removeByName).not.toHaveBeenCalled();
    },
  );
});

describe("createPolitician ownership", () => {
  test("sets the owner from the logged-in user", async () => {
    await createPolitician(valid, member);

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ ownerId: member.id }),
    );
  });

  test("ignores an ownerId sent by the client", async () => {
    await createPolitician({ ...valid, ownerId: otherMember.id }, member);

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ ownerId: member.id }),
    );
  });

  test("rejects with 401 and saves nothing when nobody is logged in", async () => {
    const result = await createPolitician(valid, undefined);

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(401);
    expect(create).not.toHaveBeenCalled();
  });
});

describe("deletePolitician authorization", () => {
  const name = "Pressley, Ayanna";
  const addedByMember = { name, party: "Democratic", ownerId: member.id };

  test("rejects a non-owner with 403 and removes nothing", async () => {
    findByName.mockResolvedValueOnce(addedByMember);

    const result = await deletePolitician(name, otherMember);

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(403);
    expect(removeByName).not.toHaveBeenCalled();
  });

  test("lets the owner delete a politician they added", async () => {
    findByName.mockResolvedValueOnce(addedByMember);

    const result = await deletePolitician(name, member);

    expect(result.ok).toBe(true);
    expect(removeByName).toHaveBeenCalledWith(name);
  });

  test("lets an admin delete a politician someone else added", async () => {
    findByName.mockResolvedValueOnce(addedByMember);

    const result = await deletePolitician(name, admin);

    expect(result.ok).toBe(true);
    expect(removeByName).toHaveBeenCalledWith(name);
  });

  test("a politician with no owner (seeded) is admin-only", async () => {
    findByName.mockResolvedValueOnce({ name, party: "Democratic" });
    const asMember = await deletePolitician(name, member);

    findByName.mockResolvedValueOnce({ name, party: "Democratic" });
    const asAdmin = await deletePolitician(name, admin);

    expect(asMember.error.status).toBe(403);
    expect(asAdmin.ok).toBe(true);
  });

  test("compares ids as strings, so a Mongo ObjectId owner still matches", async () => {
    findByName.mockResolvedValueOnce({
      name,
      ownerId: { toString: () => member.id },
    });

    const result = await deletePolitician(name, member);

    expect(result.ok).toBe(true);
  });

  test("returns 404, not 403, when the politician does not exist", async () => {
    findByName.mockResolvedValueOnce(null);

    const result = await deletePolitician("Nobody, Someone", otherMember);

    expect(result.error.status).toBe(404);
    expect(removeByName).not.toHaveBeenCalled();
  });

  test("returns 401 and does not look anything up when nobody is logged in", async () => {
    const result = await deletePolitician(name, undefined);

    expect(result.error.status).toBe(401);
    expect(findByName).not.toHaveBeenCalled();
    expect(removeByName).not.toHaveBeenCalled();
  });
});

describe("isOwnerOrAdmin (politicians)", () => {
  test.each([
    ["the owner", member, { ownerId: member.id }, true],
    ["another member", otherMember, { ownerId: member.id }, false],
    ["an admin", admin, { ownerId: member.id }, true],
    ["an admin on an ownerless politician", admin, {}, true],
    ["a member on an ownerless politician", member, {}, false],
    ["nobody logged in", undefined, { ownerId: member.id }, false],
  ])("%s", (_who, user, politician, expected) => {
    expect(isOwnerOrAdmin(user, politician)).toBe(expected);
  });
});

describe("listPoliticians", () => {
  test("returns everyone when no search name is given", async () => {
    const result = await listPoliticians();

    expect(result).toEqual(existing);
  });

  test("matches part of a name, ignoring capitals and spaces", async () => {
    const result = await listPoliticians("  WARREN ");

    expect(result).toEqual([existing[0]]);
  });

  test("returns an empty list when nobody matches", async () => {
    const result = await listPoliticians("Nobody");

    expect(result).toEqual([]);
  });
});
