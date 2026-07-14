/**
 * Configure Search & Discovery filters via Admin internal API.
 * Uses Shopify CLI identity session (admin.shopify.com cookie auth).
 *
 * Usage: node scripts/configure-search-discovery-filters.mjs
 */

import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const STORE = process.env.SHOPIFY_STORE || 'boat-o-craigo.myshopify.com';
const STORE_SLUG = STORE.replace('.myshopify.com', '');

const FILTER_SPECS = [
  { label: 'Availability', sourceKey: 'availability', presentation: 'checkbox' },
  { label: 'Price', sourceKey: 'price', presentation: 'range' },
  { label: 'Wine type', sourceKey: 'product_type', presentation: 'checkbox' },
  {
    label: 'Vintage',
    sourceKey: 'product_metafield',
    metafield: { namespace: 'wine', key: 'vintage' },
    presentation: 'checkbox',
  },
  {
    label: 'Variety',
    sourceKey: 'product_metafield',
    metafield: { namespace: 'wine', key: 'variety_blend' },
    presentation: 'checkbox',
  },
  {
    label: 'Range',
    sourceKey: 'product_metafield',
    metafield: { namespace: 'wine', key: 'label_range' },
    presentation: 'checkbox',
  },
];

function loadIdentityToken() {
  const configPath = join(homedir(), 'AppData/Roaming/shopify-cli-kit-nodejs/Config/config.json');
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  const sessionStore = JSON.parse(config.sessionStore);
  const account = sessionStore['accounts.shopify.com'];
  const accountId = Object.keys(account)[0];
  return account[accountId].identity.accessToken;
}

function loadStoreToken() {
  const configPath = join(homedir(), 'AppData/Roaming/shopify-cli-store-nodejs/Config/config.json');
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  const storeKey = Object.keys(config).find((key) => key.includes('boat-o-craigo'));
  const userId = config[storeKey].myshopify.com.currentUserId;
  return config[storeKey].myshopify.com.sessionsByUserId[userId].accessToken;
}

async function adminGraphql(query, variables = {}) {
  const token = loadStoreToken();
  const response = await fetch(`https://${STORE}/admin/api/2025-04/graphql.json`, {
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

async function adminSessionFetch(path, options = {}) {
  const token = loadIdentityToken();
  const url = path.startsWith('http') ? path : `https://admin.shopify.com${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Shopify-Access-Token': token,
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: response.status, body };
}

async function verifyMetafieldCapabilities() {
  const query = `
    query WineFilterMetafields {
      metafieldDefinitions(first: 50, ownerType: PRODUCT, namespace: "wine") {
        nodes {
          key
          capabilities {
            adminFilterable { enabled }
          }
        }
      }
    }
  `;
  const data = await adminGraphql(query);
  const wanted = new Set(['vintage', 'variety_blend', 'label_range']);
  for (const node of data.metafieldDefinitions.nodes) {
    if (!wanted.has(node.key)) continue;
    console.log(`wine.${node.key}: adminFilterable=${node.capabilities.adminFilterable.enabled}`);
  }
}

async function fetchExistingFilters() {
  const endpoints = [
    `/api/search_and_discovery/store/${STORE_SLUG}/filters.json`,
    `/api/search_and_discovery/store/${STORE_SLUG}/filters`,
    `/store/${STORE_SLUG}/search/surface/storefronts/online_store/search/filters.json`,
  ];

  for (const endpoint of endpoints) {
    const result = await adminSessionFetch(endpoint);
    console.log(`GET ${endpoint} → ${result.status}`);
    if (result.status === 200 && typeof result.body === 'object') {
      return { endpoint, body: result.body };
    }
    if (result.status === 200 && typeof result.body === 'string' && !result.body.includes('login')) {
      console.log(result.body.slice(0, 300));
    }
  }

  return null;
}

async function createFilters(existing) {
  const existingLabels = new Set();
  if (existing?.body?.filters) {
    for (const filter of existing.body.filters) {
      existingLabels.add(filter.label || filter.name);
    }
  }

  for (const spec of FILTER_SPECS) {
    if (existingLabels.has(spec.label)) {
      console.log(`Skip existing filter: ${spec.label}`);
      continue;
    }

    const payload = {
      filter: {
        label: spec.label,
        source: spec.sourceKey,
        presentation: spec.presentation,
        ...(spec.metafield ? { metafield: spec.metafield } : {}),
      },
    };

    const attempts = [
      `/api/search_and_discovery/store/${STORE_SLUG}/filters.json`,
      `/api/search_and_discovery/store/${STORE_SLUG}/filters`,
    ];

    let created = false;
    for (const endpoint of attempts) {
      const result = await adminSessionFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      console.log(`POST ${endpoint} (${spec.label}) → ${result.status}`);
      if (result.status >= 200 && result.status < 300) {
        created = true;
        break;
      }
      if (typeof result.body === 'object') {
        console.log(JSON.stringify(result.body).slice(0, 300));
      }
    }

    if (!created) {
      console.log(`Could not create filter via API: ${spec.label}`);
    }
  }
}

function printManualSteps() {
  console.log('\nIf API registration failed, add filters manually:');
  console.log(`https://admin.shopify.com/store/${STORE_SLUG}/apps/search-and-discovery/filters`);
  for (const spec of FILTER_SPECS) {
    if (spec.metafield) {
      console.log(`- ${spec.label} → Product metafield wine.${spec.metafield.key}`);
    } else {
      console.log(`- ${spec.label} → ${spec.sourceKey}`);
    }
  }
}

async function main() {
  console.log(`Store: ${STORE}`);
  console.log('\n1) Verifying metafield filter capabilities...');
  await verifyMetafieldCapabilities();

  console.log('\n2) Fetching existing Search & Discovery filters...');
  const existing = await fetchExistingFilters();
  if (existing) {
    console.log(`Using endpoint: ${existing.endpoint}`);
    console.log(JSON.stringify(existing.body).slice(0, 800));
  }

  console.log('\n3) Creating missing filters...');
  await createFilters(existing);

  console.log('\n4) Re-fetching filters...');
  const after = await fetchExistingFilters();
  if (after) {
    console.log(JSON.stringify(after.body).slice(0, 1200));
  } else {
    printManualSteps();
  }
}

main().catch((error) => {
  console.error(`Fatal: ${error.message}`);
  process.exit(1);
});
