const { getAllArtists } = require("../../controllers/artist.controller");
const Artist = require("../../models/Artist");
const config = require("../../config");

// Mock Redis and MongoDB models
jest.mock("../../config", () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn()
  }
}));

jest.mock("../../models/Artist");

describe("Artist Controller", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe("getAllArtists", () => {
    const mockArtists = [
      {
        _id: "mock123artist789",
        name: "Crystal Echoes",
        genres: ["Dream Pop", "Ambient"],
        bio: "An innovative dream pop band from the northern lights.",
        imageUrl: "uploads/images/crystalechoes.webp",
        popularity: 78,
        albums: ["mock123album456"],
        socialLinks: ["https://soundcloud.com/crystalechoes"],
        createdAt: "2025-01-15T08:30:00.000Z"
      }
    ];

    it("should return cached artists when cache exists", async () => {
      config.redis.get.mockResolvedValue(JSON.stringify(mockArtists));

      await getAllArtists(mockReq, mockRes);

      expect(config.redis.get).toHaveBeenCalledWith("artists:all");
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockArtists);
      expect(Artist.find).not.toHaveBeenCalled();
    });

    it("should fetch and cache artists when cache does not exist", async () => {
      config.redis.get.mockResolvedValue(null);
      Artist.find.mockResolvedValue(mockArtists);
      config.redis.set.mockResolvedValue("OK");

      await getAllArtists(mockReq, mockRes);

      expect(Artist.find).toHaveBeenCalled();
      expect(config.redis.set).toHaveBeenCalledWith(
        "artists:all",
        JSON.stringify(mockArtists),
        { EX: 3600 }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockArtists);
    });

    it("should handle database errors appropriately", async () => {
      config.redis.get.mockResolvedValue(null);
      Artist.find.mockRejectedValue(new Error("Database error"));

      await getAllArtists(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Erreur lors de la récupération des artistes",
        error: expect.any(Error)
      });
    });

    it("should handle Redis errors appropriately", async () => {
      config.redis.get.mockRejectedValue(new Error("Redis error"));

      await getAllArtists(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Erreur lors de la récupération des artistes",
        error: expect.any(Error)
      });
    });
  });
});
