module.exports = {
	svgoConfig: {
		plugins: [
			{
				name: "preset-default",
				params: {
					overrides: {
						removeViewBox: false,
					},
				},
			},
		],
	},
	typescript: true,
	memo: true,
	ref: true,
};
