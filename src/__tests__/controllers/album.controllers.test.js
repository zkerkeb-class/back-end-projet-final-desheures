const { getAllAlbums } = require("../../controllers/album.controller");
const Album = require("../../models/Album");
const config = require("../../config");

// Mock Redis and MongoDB models
jest.mock("../../config", () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn()
  }
}));

jest.mock("../../models/Album");

describe("Album Controller", () => {
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

  describe("getAllAlbums", () => {
    const mockAlbums = [
      {
        _id: "mock123album456",
        title: "Ethereal Dreams",
        artist: {
          _id: "mock123artist789",
          name: "Crystal Echoes",
          genres: ["Dream Pop", "Ambient"],
          bio: "An innovative dream pop band from the northern lights.",
          imageUrl: "uploads/images/crystalechoes.webp",
          popularity: 78,
          albums: ["mock123album456"],
          socialLinks: ["https://soundcloud.com/crystalechoes"],
          createdAt: "2025-01-15T08:30:00.000Z"
        },
        releaseDate: "2024-12-25T00:00:00.000Z",
        genres: ["Dream Pop"],
        coverUrl: "uploads/images/etherealdreams.webp",
        tracks: [
          {
            _id: "mock123track111",
            title: "Midnight Whispers",
            duration: 245.8,
            audioUrl: "uploads/audios/wav/midnight_whispers.wav",
            genres: ["Dream Pop"],
            popularity: 85,
            releaseDate: "2024-12-25T00:00:00.000Z"
          }
        ],
        trackCount: 1,
        popularity: 82,
        createdAt: "2025-01-15T08:30:00.000Z"
      }
    ];

    it("should return cached albums when cache exists", async () => {
      config.redis.get.mockResolvedValue(JSON.stringify(mockAlbums));

      await getAllAlbums(mockReq, mockRes);

      expect(config.redis.get).toHaveBeenCalledWith("albums:all");
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockAlbums);
      expect(Album.find).not.toHaveBeenCalled();
    });

    it("should fetch and cache albums when cache does not exist", async () => {
      config.redis.get.mockResolvedValue(null);
      Album.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockAlbums)
        })
      });
      config.redis.set.mockResolvedValue("OK");

      await getAllAlbums(mockReq, mockRes);

      expect(Album.find).toHaveBeenCalled();
      expect(config.redis.set).toHaveBeenCalledWith(
        "albums:all",
        JSON.stringify(mockAlbums),
        { EX: 3600 }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockAlbums);
    });

    it("should handle database errors appropriately", async () => {
      config.redis.get.mockResolvedValue(null);
      Album.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockRejectedValue(new Error("Database error"))
        })
      });

      await getAllAlbums(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Erreur lors de la récupération des albums",
        error: expect.any(Error)
      });
    });

    it("should handle Redis errors appropriately", async () => {
      config.redis.get.mockRejectedValue(new Error("Redis error"));
      Album.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockAlbums)
        })
      });

      await getAllAlbums(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Erreur lors de la récupération des albums",
        error: expect.any(Error)
      });
    });
  });
});
