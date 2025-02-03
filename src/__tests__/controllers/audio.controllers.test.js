const { getAllAudios } = require("../../controllers/audio.controller");
const Audio = require("../../models/Audio");
const config = require("../../config");

// Mock Redis and MongoDB models
jest.mock("../../config", () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn()
  }
}));

jest.mock("../../models/Audio");

describe("Audio Controller", () => {
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

  describe("getAllAudios", () => {
    const mockAudios = [
      {
        _id: "mock123track111",
        title: "Midnight Whispers",
        artist: {
          _id: "mock123artist789",
          name: "Crystal Echoes",
          imageUrl: "uploads/images/crystalechoes.webp"
        },
        album: {
          _id: "mock123album456",
          title: "Ethereal Dreams",
          coverUrl: "uploads/images/etherealdreams.webp"
        },
        duration: 245.8,
        audioUrl: "uploads/audios/wav/midnight_whispers.wav",
        genres: ["Dream Pop"],
        popularity: 85,
        releaseDate: "2024-12-25T00:00:00.000Z",
        createdAt: "2025-01-15T08:30:00.000Z"
      }
    ];

    it("should return cached audios when cache exists", async () => {
      config.redis.get.mockResolvedValue(JSON.stringify(mockAudios));

      await getAllAudios(mockReq, mockRes);

      expect(config.redis.get).toHaveBeenCalledWith("audios:all");
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockAudios);
      expect(Audio.find).not.toHaveBeenCalled();
    });

    it("should fetch and cache audios when cache does not exist", async () => {
      config.redis.get.mockResolvedValue(null);
      Audio.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockAudios)
        })
      });
      config.redis.set.mockResolvedValue("OK");

      await getAllAudios(mockReq, mockRes);

      expect(Audio.find).toHaveBeenCalled();
      expect(config.redis.set).toHaveBeenCalledWith(
        "audios:all",
        JSON.stringify(mockAudios),
        { EX: 3600 }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockAudios);
    });

    it("should handle database errors appropriately", async () => {
      config.redis.get.mockResolvedValue(null);
      Audio.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockRejectedValue(new Error("Database error"))
        })
      });

      await getAllAudios(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Erreur lors de la récupération des audios",
        error: expect.any(Error)
      });
    });

    it("should handle Redis errors appropriately", async () => {
      config.redis.get.mockRejectedValue(new Error("Redis error"));
      Audio.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockAudios)
        })
      });

      await getAllAudios(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Erreur lors de la récupération des audios",
        error: expect.any(Error)
      });
    });
  });
});
