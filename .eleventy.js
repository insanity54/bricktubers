const Image = require("@11ty/eleventy-img");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");


async function figureHtml(src, alt) {
  let stats = await Image(src, {
    widths: [64, 256, 512],
    formats: ["avif", "png"],
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

  eleventyConfig.addNunjucksShortcode("bricktuber", function(name, twitter) {
    return `
      <div class="bricktuber">
        <div class="bricktuber_name">${name}</div>
        <div class="bricktuber_twitter">${twitter}</div>
      </div>
    `
  });


  eleventyConfig.addNunjucksFilter("bname", function(value) {
    if (typeof value === 'undefined' || value === 'n/a') return '';
    if (!value.includes('/')) return '';
    const parts = value.split('/')
    return parts[parts.length-1]
  });

  eleventyConfig.addNunjucksAsyncShortcode("getFigureHtml", figureHtml);


  eleventyConfig.addPassthroughCopy({
      "./src/img/gen/*.avif": "/img/gen"
  });
  eleventyConfig.addPassthroughCopy({
      "./src/img/gen/*.png": "/img/gen"
  });
  eleventyConfig.addPlugin(eleventyNavigationPlugin);

  return {
    dir: {
      data: "data",
      includes: "includes",
      layouts: "layouts",
      input: "src"
    }
  }
};

