/**
 * Backfill original publish dates on imported News articles.
 *
 * Usage:
 *   node scripts/update-news-publish-dates.mjs
 */

import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATES_PATH = join(ROOT, 'data', 'boc-news-publish-dates.json');

const STORE = process.env.SHOPIFY_STORE || 'boat-o-craigo.myshopify.com';
const API_VERSION = process.env.SHOPIFY_API_VERSION || '2025-04';

function loadStoreToken() {
  if (process.env.SHOPIFY_ADMIN_API_TOKEN) {
    return process.env.SHOPIFY_ADMIN_API_TOKEN;
  }

  const configPath = join(homedir(), 'AppData/Roaming/shopify-cli-store-nodejs/Config/config.json');
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  const storeKey = Object.keys(config).find((key) => key.includes('boat-o-craigo'));
  const userId = config[storeKey].myshopify.com.currentUserId;
  return config[storeKey].myshopify.com.sessionsByUserId[userId].accessToken;
}

async function graphql(query, variables = {}) {
  const token = loadStoreToken();
  const response = await fetch(`https://${STORE}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = await response.json();
  if (!response.ok || payload.errors?.length) {
    throw new Error(JSON.stringify(payload.errors || payload));
  }

  return payload.data;
}

async function main() {
  const datesByHandle = JSON.parse(readFileSync(DATES_PATH, 'utf8'));

  const data = await graphql(`query {
    blogs(first: 20) {
      nodes {
        id
        handle
        articles(first: 100) {
          nodes { id handle title publishedAt }
        }
      }
    }
  }`);

  const newsBlog = data.blogs.nodes.find((blog) => blog.handle === 'news');
  if (!newsBlog) {
    throw new Error('News blog not found');
  }

  let updated = 0;
  let skipped = 0;

  for (const article of newsBlog.articles.nodes) {
    const publishDate = datesByHandle[article.handle];
    if (!publishDate) {
      console.warn(`SKIP  ${article.handle}: no mapped publish date`);
      skipped += 1;
      continue;
    }

    if (article.publishedAt === publishDate) {
      console.log(`SKIP  ${article.handle}: already set`);
      skipped += 1;
      continue;
    }

    const result = await graphql(
      `mutation UpdateArticle($id: ID!, $article: ArticleUpdateInput!) {
        articleUpdate(id: $id, article: $article) {
          article { id handle publishedAt }
          userErrors { field message }
        }
      }`,
      {
        id: article.id,
        article: {
          publishDate,
          isPublished: true,
        },
      }
    );

    const errors = result.articleUpdate.userErrors;
    if (errors?.length) {
      console.error(`FAIL  ${article.handle}: ${errors.map((error) => error.message).join('; ')}`);
      continue;
    }

    updated += 1;
    console.log(`UPDATE ${article.handle}: ${result.articleUpdate.article.publishedAt}`);
  }

  console.log(`\nUpdated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
}

main().catch((error) => {
  console.error(`ERROR: ${error.message}`);
  process.exit(1);
});
