// --------------------
// Mock Database ก่อน import service
// --------------------

const mockExecute = jest.fn();
const mockRelease = jest.fn();

jest.mock("../src/config/database", () => ({
  pool: {
    getConnection: jest.fn().mockResolvedValue({
      execute: mockExecute,
      release: mockRelease,
    }),
  },
}));

// --------------------
// Import functions ที่จะ test
// --------------------

import {
  formatDepartmentLocation,
  getDepartmentQueues,
} from "../src/services/queueService";

// --------------------
// Pure Function Test
// --------------------

describe("formatDepartmentLocation", () => {
  test("should format full location correctly", () => {
    const result = formatDepartmentLocation("ตึก A", "ชั้น 2", "12");
    expect(result).toBe("ตึก A ชั้น 2 ห้อง 12");
  });

  test("should remove duplicate word ห้อง", () => {
    const result = formatDepartmentLocation("ตึก B", "ชั้น 3", "ห้อง 15");
    expect(result).toBe("ตึก B ชั้น 3 ห้อง 15");
  });

  test("should handle missing values", () => {
    const result = formatDepartmentLocation(undefined, "ชั้น 1", undefined);
    expect(result).toBe("ชั้น 1");
  });
});

// --------------------
// Service Function Test (Mock DB)
// --------------------

describe("getDepartmentQueues", () => {
  beforeEach(() => {
    mockExecute.mockReset();
    mockRelease.mockReset();
  });

  test("should return only today's queues", async () => {
    const today = new Date().toISOString();

    mockExecute
      .mockResolvedValueOnce([[]]) // timezone query
      .mockResolvedValueOnce([
        [
          {
            queue_id: 1,
            queue_number: "A001",
            status: "waiting",
            issued_time: today,
            skipped_time: null,
            is_skipped: 0,
            priority_score: 5,
            vn: "VN001",
            patient_name: "Test User",
            phone_number: "0999999999",
          },
          {
            queue_id: 2,
            queue_number: "A002",
            status: "waiting",
            issued_time: "2020-01-01T00:00:00Z",
            skipped_time: null,
            is_skipped: 0,
            priority_score: 3,
            vn: "VN002",
            patient_name: "Old User",
            phone_number: null,
          },
        ],
      ]);

    const result = await getDepartmentQueues(1);

    expect(result.length).toBe(1);
    expect(result[0].queueNumber).toBe("A001");
    expect(result[0].phoneNumber).toBe("0999999999");
  });
});

import { buildQueueData } from "../src/services/queueService";

describe("buildQueueData", () => {

  beforeEach(() => {
    mockExecute.mockReset();
  });

  test("should build complete queue data correctly", async () => {

    const issuedTime = new Date().toISOString();

    // Query 1: queue info
    mockExecute
      .mockResolvedValueOnce([[
        {
          queue_id: 1,
          queue_number: "A001",
          status: "waiting",
          issued_time: issuedTime,
          is_skipped: 0,
          priority_score: 5,
          department_id: 1,
          vn: "VN001",
          patient_name: "Test User",
          department_name: "Eye Clinic",
          building: "ตึก A",
          floor: "ชั้น 2",
          room: "12",
        }
      ]])

      // Query 2: current called queue
      .mockResolvedValueOnce([[
        { queue_number: "A000" }
      ]])

      // Query 3: position count
      .mockResolvedValueOnce([[
        { position: 2 }
      ]]);

    const result = await buildQueueData(1);

    expect(result.queueNumber).toBe("A001");
    expect(result.patientName).toBe("Test User");
    expect(result.department).toBe("Eye Clinic");
    expect(result.departmentLocation).toBe("ตึก A ชั้น 2 ห้อง 12");
    expect(result.currentQueue).toBe("A000");
    expect(result.yourPosition).toBe(2);
    expect(result.isSkipped).toBe(false);
  });

});

test("should throw error if queue not found", async () => {
  mockExecute.mockResolvedValueOnce([[]]);

  await expect(buildQueueData(999)).rejects.toThrow("Queue not found");
});


