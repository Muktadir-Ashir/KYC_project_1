import { generateAISummary } from "../services/llmService";

describe("generateAISummary", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns fallback summary when API key is missing", async () => {
    delete process.env.HUGGING_FACE_API_KEY;

    const summary = await generateAISummary({
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: "+123456789",
      idNumber: "ID123",
      dateOfBirth: new Date("1990-01-01"),
    });

    expect(summary).toContain("Jane Doe");
    expect(summary).toContain("ID123");
    expect(summary).toContain("jane@example.com");
  });

  it("returns generated summary when API responds successfully", async () => {
    process.env.HUGGING_FACE_API_KEY = "test-key";

    const mockResponse = {
      ok: true,
      json: () =>
        Promise.resolve([
          {
            generated_text: "Summary: This is an AI generated summary.",
          },
        ]),
    };

    const fetchSpy = jest
      .spyOn(globalThis, "fetch" as any)
      .mockResolvedValue(mockResponse as any);

    const summary = await generateAISummary({
      fullName: "John Smith",
    });

    expect(fetchSpy).toHaveBeenCalled();
    expect(summary).toBe("This is an AI generated summary.");
  });
});
