/**
 * Import Boat O'Craigo news articles into the Shopify News blog.
 *
 * Usage:
 *   node scripts/import-news-articles.mjs
 *   node scripts/import-news-articles.mjs --skip-redirects
 *
 * Environment:
 *   SHOPIFY_STORE              (default: boat-o-craigo.myshopify.com)
 *   SHOPIFY_ADMIN_API_TOKEN    (optional; falls back to Shopify CLI config)
 *   SHOPIFY_API_VERSION        (default: 2025-04)
 */

import { readFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_PATH = join(ROOT, 'data', 'boc-news-articles-import.json');

const STORE = process.env.SHOPIFY_STORE || 'boat-o-craigo.myshopify.com';
const API_VERSION = process.env.SHOPIFY_API_VERSION || '2025-04';
const SKIP_REDIRECTS = process.argv.includes('--skip-redirects');

const THIRD_PARTY_HANDLES = [
  'heart-volcano',
  'orange-wine',
  'best-dog-friendly-wineries-yarra-valley',
  'australian-traveller',
];

const MIME_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

function loadStoreToken() {
  if (process.env.SHOPIFY_ADMIN_API_TOKEN) {
    return process.env.SHOPIFY_ADMIN_API_TOKEN;
  }

  const configPath = join(homedir(), 'AppData/Roaming/shopify-cli-store-nodejs/Config/config.json');
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  const storeKey = Object.keys(config).find((key) => key.includes('boat-o-craigo'));
  if (!storeKey) {
    throw new Error('No boat-o-craigo store found in Shopify CLI config.');
  }
  const userId = config[storeKey].myshopify.com.currentUserId;
  return config[storeKey].myshopify.com.sessionsByUserId[userId].accessToken;
}

async function adminGraphql(query, variables = {}) {
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

function shopifyGraphqlCli(query, variables = {}, allowMutations = false) {
  const tempDir = mkdtempSync(join(tmpdir(), 'boc-news-import-'));
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
  if (allowMutations) args.push('--allow-mutations');

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

async function graphql(query, variables = {}, allowMutations = false) {
  try {
    return await adminGraphql(query, variables);
  } catch (error) {
    if (!allowMutations) {
      throw error;
    }
    return shopifyGraphqlCli(query, variables, true);
  }
}

function extensionFromUrl(imageUrl) {
  try {
    const pathname = new URL(imageUrl).pathname;
    const ext = extname(decodeURIComponent(pathname)).toLowerCase();
    if (ext && MIME_BY_EXT[ext]) {
      return ext;
    }
  } catch {
    // fall through
  }
  return '.jpg';
}

function mimeFromExtension(ext) {
  return MIME_BY_EXT[ext.toLowerCase()] || 'image/jpeg';
}

function legacyPath(sourceUrl) {
  const pathname = new URL(sourceUrl).pathname.replace(/\/$/, '');
  return pathname || '/';
}

function targetPath(handle) {
  return `/blogs/news/${handle}`;
}

async function getOrCreateNewsBlog() {
  const data = await graphql(`query GetBlogs {
    blogs(first: 20) {
      nodes { id handle title }
    }
  }`);

  const existing = data.blogs.nodes.find(
    (blog) => blog.handle === 'news' || blog.title.toLowerCase() === 'news'
  );
  if (existing) {
    console.log(`News blog already exists: ${existing.id} (${existing.handle})`);
    return existing.id;
  }

  const created = await graphql(
    `mutation CreateNewsBlog($blog: BlogCreateInput!) {
      blogCreate(blog: $blog) {
        blog { id handle title }
        userErrors { field message }
      }
    }`,
    {
      blog: {
        title: 'News',
        handle: 'news',
        commentPolicy: 'CLOSED',
      },
    },
    true
  );

  const errors = created.blogCreate.userErrors;
  if (errors?.length) {
    throw new Error(errors.map((error) => error.message).join('; '));
  }

  console.log(`Created News blog: ${created.blogCreate.blog.id}`);
  return created.blogCreate.blog.id;
}

async function getExistingArticleHandles(blogId) {
  const data = await graphql(
    `query GetArticles($blogId: ID!) {
      blog(id: $blogId) {
        articles(first: 100) {
          nodes { id handle title }
        }
      }
    }`,
    { blogId }
  );

  const map = new Map();
  for (const article of data.blog?.articles?.nodes || []) {
    map.set(article.handle, article);
  }
  return map;
}

async function downloadImage(imageUrl) {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  return buffer;
}

async function uploadImage(buffer, filename, mimeType) {
  const staged = await graphql(
    `mutation StagedUpload($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets {
          url
          resourceUrl
          parameters { name value }
        }
        userErrors { field message }
      }
    }`,
    {
      input: [
        {
          filename,
          mimeType,
          resource: 'FILE',
          fileSize: String(buffer.length),
          httpMethod: 'POST',
        },
      ],
    },
    true
  );

  const target = staged.stagedUploadsCreate.stagedTargets[0];
  if (!target) {
    throw new Error('Failed to create staged upload target.');
  }

  const formData = new FormData();
  for (const param of target.parameters) {
    formData.append(param.name, param.value);
  }
  formData.append('file', new Blob([buffer], { type: mimeType }), filename);

  const uploadResponse = await fetch(target.url, {
    method: 'POST',
    body: formData,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Upload failed: HTTP ${uploadResponse.status}`);
  }

  return target.resourceUrl;
}

async function uploadArticleImage(article) {
  const ext = extensionFromUrl(article.image_url);
  const filename = `boc-news-${article.handle}${ext}`;
  const mimeType = mimeFromExtension(ext);
  const buffer = await downloadImage(article.image_url);
  const resourceUrl = await uploadImage(buffer, filename, mimeType);
  return resourceUrl;
}

function buildArticleInput(article, imageUrl) {
  const input = {
    title: article.title,
    author: { name: "Boat O'Craigo" },
    body: article.body_html,
    isPublished: true,
  };

  if (article.published_at) {
    input.publishDate = article.published_at;
  }

  if (imageUrl) {
    input.image = {
      altText: article.title,
      url: imageUrl,
    };
  }

  return input;
}

function isImageLimitError(message) {
  return /pixel limit|25 megapixels|resize your image/i.test(message);
}

async function createArticle(blogId, article, imageUrl) {
  const attempt = async (withImage) => {
    const created = await graphql(
      `mutation CreateArticle($article: ArticleCreateInput!) {
        articleCreate(article: $article) {
          article { id handle title }
          userErrors { field message }
        }
      }`,
      {
        article: {
          ...buildArticleInput(article, withImage ? imageUrl : null),
          blogId,
          handle: article.handle,
        },
      },
      true
    );

    const errors = created.articleCreate.userErrors;
    if (errors?.length) {
      throw new Error(errors.map((error) => error.message).join('; '));
    }

    return created.articleCreate.article;
  };

  if (!imageUrl) {
    const articleRecord = await attempt(false);
    return { article: articleRecord, featuredImageAttached: false };
  }

  try {
    const articleRecord = await attempt(true);
    return { article: articleRecord, featuredImageAttached: true };
  } catch (error) {
    if (isImageLimitError(error.message)) {
      console.warn(`WARN  ${article.handle}: image rejected by Shopify, creating without featured image`);
      const articleRecord = await attempt(false);
      return { article: articleRecord, featuredImageAttached: false, imageRejected: true };
    }
    throw error;
  }
}

async function getExistingRedirects() {
  const redirects = new Map();
  let cursor = null;

  do {
    const data = await graphql(
      `query GetRedirects($cursor: String) {
        urlRedirects(first: 250, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          nodes { id path target }
        }
      }`,
      { cursor }
    );

    for (const redirect of data.urlRedirects.nodes) {
      redirects.set(redirect.path, redirect);
    }

    cursor = data.urlRedirects.pageInfo.hasNextPage
      ? data.urlRedirects.pageInfo.endCursor
      : null;
  } while (cursor);

  return redirects;
}

async function createRedirect(fromPath, toPath) {
  const created = await graphql(
    `mutation CreateRedirect($urlRedirect: UrlRedirectInput!) {
      urlRedirectCreate(urlRedirect: $urlRedirect) {
        urlRedirect { id path target }
        userErrors { field message }
      }
    }`,
    {
      urlRedirect: {
        path: fromPath,
        target: toPath,
      },
    },
    true
  );

  const errors = created.urlRedirectCreate.userErrors;
  if (errors?.length) {
    throw new Error(errors.map((error) => error.message).join('; '));
  }

  return created.urlRedirectCreate.urlRedirect;
}

async function main() {
  const articles = JSON.parse(readFileSync(DATA_PATH, 'utf8'));
  console.log(`Loaded ${articles.length} articles from ${DATA_PATH}`);
  console.log(`Store: ${STORE}\n`);

  const blogId = await getOrCreateNewsBlog();
  const existingArticles = await getExistingArticleHandles(blogId);

  const summary = {
    processed: 0,
    created: 0,
    skipped: 0,
    failed: [],
    imagesAttached: [],
    imagesMissing: [],
    redirectsCreated: 0,
    redirectsSkipped: 0,
    redirectsFailed: [],
    redirectsPendingManual: [],
  };

  for (const article of articles) {
    summary.processed += 1;
    const label = `${article.handle} — ${article.title}`;

    if (existingArticles.has(article.handle)) {
      console.log(`SKIP  ${label} (already exists)`);
      summary.skipped += 1;
      continue;
    }

    let imageUrl = null;
    let imageUploaded = false;
    try {
      imageUrl = await uploadArticleImage(article);
      imageUploaded = true;
      console.log(`IMAGE ${article.handle}: uploaded`);
    } catch (error) {
      summary.imagesMissing.push({ handle: article.handle, reason: error.message });
      console.warn(`WARN  ${article.handle}: image upload failed (${error.message})`);
    }

    try {
      const result = await createArticle(blogId, article, imageUrl);
      existingArticles.set(result.article.handle, result.article);
      summary.created += 1;
      if (result.featuredImageAttached) {
        summary.imagesAttached.push(article.handle);
      } else if (imageUploaded && result.imageRejected) {
        summary.imagesMissing.push({
          handle: article.handle,
          reason: 'source image exceeds Shopify 25MP limit — article created without featured image',
        });
      } else if (!imageUploaded) {
        // already tracked in imagesMissing
      }
      console.log(`CREATE ${label}`);
    } catch (error) {
      summary.failed.push({ handle: article.handle, reason: error.message });
      console.error(`FAIL  ${label}: ${error.message}`);
    }
  }

  if (!SKIP_REDIRECTS) {
    console.log('\nCreating legacy URL redirects...');
    let existingRedirects;

    try {
      existingRedirects = await getExistingRedirects();
    } catch (error) {
      console.warn(`WARN  Could not list existing redirects: ${error.message}`);
      existingRedirects = new Map();
    }

    for (const article of articles) {
      const fromPath = legacyPath(article.source_url);
      const toPath = targetPath(article.handle);

      if (!existingArticles.has(article.handle)) {
        summary.redirectsPendingManual.push({
          from: fromPath,
          to: toPath,
          reason: 'destination article missing',
        });
        console.warn(`SKIP  redirect ${fromPath} → ${toPath} (article missing)`);
        continue;
      }

      const existing = existingRedirects.get(fromPath);
      if (existing) {
        if (existing.target === toPath) {
          summary.redirectsSkipped += 1;
          console.log(`SKIP  redirect ${fromPath} (already exists)`);
        } else {
          summary.redirectsPendingManual.push({
            from: fromPath,
            to: toPath,
            reason: `path already redirects to ${existing.target}`,
          });
          console.warn(`WARN  redirect ${fromPath} already points to ${existing.target}`);
        }
        continue;
      }

      try {
        await createRedirect(fromPath, toPath);
        summary.redirectsCreated += 1;
        console.log(`REDIR ${fromPath} → ${toPath}`);
      } catch (error) {
        summary.redirectsFailed.push({ from: fromPath, to: toPath, reason: error.message });
        summary.redirectsPendingManual.push({ from: fromPath, to: toPath, reason: error.message });
        console.error(`FAIL  redirect ${fromPath}: ${error.message}`);
      }
    }
  } else {
    console.log('\nSkipping redirects (--skip-redirects).');
  }

  console.log('\n=== Import summary ===');
  console.log(`Processed: ${summary.processed}`);
  console.log(`Created:   ${summary.created}`);
  console.log(`Skipped:   ${summary.skipped}`);
  console.log(`Failed:    ${summary.failed.length}`);

  console.log(`\nImages attached: ${summary.imagesAttached.length}`);
  if (summary.imagesMissing.length) {
    console.log('Images missing:');
    for (const item of summary.imagesMissing) {
      console.log(`  - ${item.handle}: ${item.reason}`);
    }
  }

  if (!SKIP_REDIRECTS) {
    console.log(`\nRedirects created: ${summary.redirectsCreated}`);
    console.log(`Redirects skipped: ${summary.redirectsSkipped}`);
    console.log(`Redirects failed:  ${summary.redirectsFailed.length}`);
    if (summary.redirectsPendingManual.length) {
      console.log('\nRedirects pending manual setup:');
      for (const item of summary.redirectsPendingManual) {
        console.log(`  ${item.from} → ${item.to} (${item.reason})`);
      }
    }
  }

  console.log('\n=== Third-party attribution review ===');
  console.log(
    'These four articles were imported as short attributed summaries (not full republication):'
  );
  for (const handle of THIRD_PARTY_HANDLES) {
    const article = articles.find((entry) => entry.handle === handle);
    if (article) {
      console.log(`  - ${handle}: ${article.attribution || article.title}`);
    }
  }
  console.log(
    '\nMerchant should review republication rights or keep as summary-plus-link posts.'
  );

  console.log('\nVerify article URLs:');
  for (const article of articles) {
    console.log(`  https://${STORE}${targetPath(article.handle)}`);
  }

  if (summary.failed.length) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`ERROR: ${error.message}`);
  process.exit(1);
});
