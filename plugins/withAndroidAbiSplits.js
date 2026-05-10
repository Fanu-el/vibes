const { withAppBuildGradle } = require("expo/config-plugins");

const ABI_SPLITS_BLOCK = `    splits {
        abi {
            enable true
            reset()
            include "armeabi-v7a", "arm64-v8a", "x86", "x86_64"
            universalApk false
        }
    }
`;

const shouldEnableAbiSplits = () =>
  process.env.ENABLE_ANDROID_ABI_SPLITS === "true" ||
  process.env.EAS_BUILD_PROFILE === "development";

module.exports = function withAndroidAbiSplits(config) {
  return withAppBuildGradle(config, (config) => {
    if (!shouldEnableAbiSplits()) {
      return config;
    }

    if (config.modResults.language !== "groovy") {
      throw new Error("withAndroidAbiSplits only supports Groovy build.gradle files.");
    }

    const contents = config.modResults.contents;

    if (contents.includes("universalApk false")) {
      return config;
    }

    config.modResults.contents = contents.replace(
      /android\s*\{/,
      (match) => `${match}\n${ABI_SPLITS_BLOCK}`,
    );

    return config;
  });
};
