/**
 * Assign the "news" blog template suffix to the News blog.
 *
 * Usage:
 *   node scripts/assign-news-blog-template.mjs
 */

import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STORE = process.env.SHOPIFY_STORE || 'boat-o-craigo.myshopify.com';
const tempDir = mkdtempSync(join(tmpdir(), 'boc-assign-news-blog-template-'));

function shopifyGraphql(query, variables = {}, allowMutations = false) {
  const queryFile = join(tempDir, 'query.graphql');
  const variableFile = join(tempDir, 'variables.json');
  writeFileSync(queryFile, query, 'utf8');
  writeFileSync(variableFile, JSON.stringify(variables), 'utf8');

  const args = [
    'store',
    'execute',
    '--store',
    STORE,
    '--query-file',
    queryFile,
    '--variable-file',
    variableFile,
    '--json',
  ];

  if (allowMutations) {
    args.push('--allow-mutations');
  }

  const output = execFileSync('shopify.cmd', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  });

  const payload = JSON.parse(output);
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join('; '));
  }

  return payload.data ?? payload;
}

const blogs = shopifyGraphql(`query GetBlogs {
  blogs(first: 20) {
    nodes { id handle title templateSuffix }
  }
}`);

const newsBlog = blogs.blogs.nodes.find(
  (blog) => blog.handle === 'news' || blog.title.toLowerCase() === 'news'
);
if (!newsBlog) {
  throw new Error('News blog not found');
}

console.log('Current blog:', newsBlog);

if (newsBlog.templateSuffix === 'news') {
  console.log('News blog already uses template suffix "news".');
  process.exit(0);
}

const updated = shopifyGraphql(
  `mutation UpdateBlogTemplate($id: ID!, $blog: BlogUpdateInput!) {
    blogUpdate(id: $id, blog: $blog) {
      blog { id handle title templateSuffix }
      userErrors { field message }
    }
  }`,
  {
    id: newsBlog.id,
    blog: {
      templateSuffix: 'news',
    },
  },
  true
);

const errors = updated.blogUpdate.userErrors;
if (errors?.length) {
  throw new Error(errors.map((error) => error.message).join('; '));
}

console.log('Updated blog:', updated.blogUpdate.blog);
console.log('News blog now uses templates/blog.news.json');
