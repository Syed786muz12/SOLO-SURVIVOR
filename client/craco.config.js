module.exports = {
  webpack: {
    configure: (config) => {
      config.ignoreWarnings = [
        {
          module: /@mediapipe\/tasks-vision/,
          message: /Failed to parse source map/,
        },
      ];
      return config;
    },
  },
};
