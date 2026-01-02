// Stub for zod library - for build purposes only
export const z = {
	object: (schema: any) => schema,
	string: () => ({
		min: () => ({
			max: () => ({
				optional: () => ({}),
			}),
		}),
	}),
	number: () => ({
		min: () => ({
			max: () => ({}),
		}),
	}),
	boolean: () => ({}),
	array: () => ({}),
	optional: () => ({}),
	literal: () => ({}),
};

export default z;
