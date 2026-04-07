import nodePath from 'path';
import * as sass from 'sass';
import { RenderPlugin } from '@11ty/eleventy';
import { eleventyImageTransformPlugin } from '@11ty/eleventy-img';
import htmlmin from 'html-minifier-next';
import postcss from 'postcss';
import cssnano from 'cssnano';

export default function(eleventyConfig) {

  const isProduction = process.env.NODE_ENV === 'production';

  // Minify HTML for production builds
  if (isProduction) {
    eleventyConfig.addTransform('htmlmin', function (content) {
      if ((this.page.outputPath || '').endsWith('.html')) {
        return htmlmin.minify(content, {
          useShortDoctype: true,
          removeComments: true,
          collapseWhitespace: true,
        });
      }
      return content;
    });
  }

  // SCSS extension compilation
  eleventyConfig.addExtension('scss', {
    outputFileExtension: 'css',
    useLayouts: false,
    compile: async function (inputContent, inputPath) {
      let parsed = nodePath.parse(inputPath);
      // Don’t compile file names that start with an underscore
      if (parsed.name.startsWith('_')) {
        return;
      }

      const compiled = sass.compileString(inputContent, {
        loadPaths: [parsed.dir || '.', this.config.dir.includes]
      });

      // Minify for production builds
      let result = compiled.css;
      if (isProduction) {
        const minified = await postcss([cssnano]).process(compiled.css, {
          from: undefined,
        });
        result = minified.content;
      }

      // Map dependencies for incremental builds
      this.addDependencies(inputPath, compiled.loadedUrls);

      return async (data) => {
        return result;
      };
    },
  });

  eleventyConfig.addTemplateFormats('scss');
  eleventyConfig.addPlugin(RenderPlugin);
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ["webp", "jpeg"],
    widths: ["auto", 640, 960, 1280],
    defaultAttributes: {
      loading: "lazy",
      decoding: "async",
      sizes: "(min-width: 64rem) 50vw, 100vw",
    },
    urlPath: "/images/",
    transformOnRequest: process.env.ELEVENTY_RUN_MODE === "serve",
  });

  return {
    markdownTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dir: {
      input: 'src',
      output: 'dist',
    },
  };
}