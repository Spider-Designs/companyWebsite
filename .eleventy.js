import nodePath from 'path';
import fs from 'fs';
import * as sass from 'sass';
import markdownIt from 'markdown-it';
import { RenderPlugin } from '@11ty/eleventy';
import { eleventyImageTransformPlugin } from '@11ty/eleventy-img';
import htmlmin from 'html-minifier-next';
import postcss from 'postcss';
import cssnano from 'cssnano';

const md = markdownIt({ html: true, breaks: true, linkify: true });

export default function(eleventyConfig) {

  eleventyConfig.addFilter('markdownify', function (value) {
    if (!value) return '';
    return md.render(String(value));
  });

  const isProduction = process.env.NODE_ENV === 'production';
  const isServe = process.env.ELEVENTY_RUN_MODE === 'serve';
  const viteDevServer = 'http://127.0.0.1:5173';
  const viteManifestPath = nodePath.join(process.cwd(), 'dist', '.vite', 'manifest.json');

  function getViteManifest() {
    if (!isProduction || !fs.existsSync(viteManifestPath)) {
      return {};
    }

    return JSON.parse(fs.readFileSync(viteManifestPath, 'utf8'));
  }

  eleventyConfig.addFilter('viteAsset', function (entry) {
    if (!entry) {
      return entry;
    }

    const normalizedEntry = entry.replace(/^\//, '');

    if (isServe) {
      return `${viteDevServer}/${normalizedEntry}`;
    }

    const manifest = getViteManifest();
    const manifestEntry = manifest[normalizedEntry];
    return manifestEntry ? `/${manifestEntry.file}` : entry;
  });

  eleventyConfig.addFilter('readableDate', function(value) {
    if (!value) {
      return '';
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  });

  eleventyConfig.addFilter('head', function(values, count) {
    if (!Array.isArray(values) || count === 0) {
      return values;
    }

    if (count < 0) {
      return values.slice(count);
    }

    return values.slice(0, count);
  });

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

  eleventyConfig.addPassthroughCopy({ 'src/images/logo.svg': 'images/logo.svg' });
  eleventyConfig.addPassthroughCopy('src/admin');
  eleventyConfig.addPassthroughCopy('src/fonts');

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