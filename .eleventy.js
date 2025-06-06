const Image = require("@11ty/eleventy-img");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const searchFilter = require("./_src/_filters/searchFilter");

async function figureHtml(src, alt, widths) {
  let stats = await Image(src, {
    widths: widths || [64, 256, 512],
    formats: ["webp", "png"],
    outputDir: "_site/img/",
    cacheOptions: {
      duration: '*'
    }
  });

  return Image.generateHTML(stats, {
    class: 'image',
    alt: alt,
    sizes: ["(max-width: 768px)", "(max-width: 769px)", "(max-width: 1024px)"],
    decoding: "async",
    loading: "lazy",
  });
}




module.exports = function (eleventyConfig) {

  // Looking for JSON.stringify? in eleventy/nunjucks land, we use `example | dump | safe` instead.

  eleventyConfig.addFilter("search", searchFilter);
  eleventyConfig.addGlobalData()
  // Values can be static:
  eleventyConfig.addGlobalData("myStatic", "static");
  // functions:
  eleventyConfig.addGlobalData("myFunction", () => new Date());
  // or a promise:
  eleventyConfig.addGlobalData(
    "myFunctionPromise",
    () => {
      return new Promise((resolve) => {
        setTimeout(resolve, 100, "foo");
      })
    }
  );
  // or async:
  eleventyConfig.addGlobalData(
    "myAsyncFunction",
    async () => {
      return Promise.resolve("hi");
    }
  );




  eleventyConfig.addNunjucksFilter("bname", function(value) {
    if (typeof value === 'undefined' || value === 'n/a') return '';
    if (!value.includes('/')) return '';
    const parts = value.split('/')
    return parts[parts.length-1]
  });

  eleventyConfig.addNunjucksAsyncShortcode("getFigureHtml", figureHtml);
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPassthroughCopy({'./_src/_includes/js': '/js'})

  return {
    dir: {
      data: "_data",
      includes: "_includes",
      layouts: "_layouts",
      input: "_src"
    }
  }
};

