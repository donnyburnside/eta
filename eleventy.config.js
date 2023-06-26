const tailwind = require("tailwindcss");
const postcss = require("postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");

const esbuild = require("esbuild");
const { minify } = require("terser");

const htmlmin = require("html-minifier");


module.exports = function(eleventyConfig) {
  // Watch Targets
  eleventyConfig.addWatchTarget("./src/css/main.css");
  eleventyConfig.addWatchTarget("./src/js/main.js");


  // Copy files
  eleventyConfig.addPassthroughCopy({
    "./src/static": ".",
  });


  // Filters
  eleventyConfig.addFilter("postcss", async function(value) {
    const plugins = [
      tailwind(require("./tailwind.config")),
      autoprefixer(),
    ];
    if (process.env.ELEVENTY_PRODUCTION) {
      plugins.push(
        cssnano({ preset: "default" })
      )
    }
    return postcss(plugins)
      .process(value, {
        from: undefined
      });
  });

  eleventyConfig.addAsyncFilter("bundle", async function(value) {
    const result = await esbuild.build({
      stdin: {
        contents: value,
        resolveDir: '.'
      },
      bundle: true,
      write: false,
    });
    if (process.env.ELEVENTY_PRODUCTION) {
      const minified_result = await minify(result.outputFiles[0].text);
      return minified_result.code;
    }
    return result.outputFiles[0].text;
  });


  // Transforms
  eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
    if (process.env.ELEVENTY_PRODUCTION && outputPath && outputPath.endsWith(".html")) {
      return htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });
    }
    return content;
  });


  return {
    // Directories
    dir: {
      input: "src",
      output: "dist",
      data: "data",
      includes: "includes",
      layouts: "layouts"
    }
  }
};