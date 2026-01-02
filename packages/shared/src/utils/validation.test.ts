import { sanitizeInput } from "./validation";

describe("sanitizeInput", () => {
	it("should remove HTML tags and normalize whitespace", () => {
		const input = '  Hello   <script>alert("xss")</script>  World  ';
		const result = sanitizeInput(input);

		expect(result).toBe('Hello scriptalert("xss")/script World');
		expect(result).not.toContain("<");
		expect(result).not.toContain(">");
	});

	it("should trim leading and trailing whitespace", () => {
		const input = "   test   ";
		const result = sanitizeInput(input);

		expect(result).toBe("test");
	});

	it("should normalize multiple spaces to single space", () => {
		const input = "hello     world    test";
		const result = sanitizeInput(input);

		expect(result).toBe("hello world test");
	});

	it("should limit input to 1000 characters", () => {
		const input = "a".repeat(1500);
		const result = sanitizeInput(input);

		expect(result.length).toBe(1000);
	});
});
