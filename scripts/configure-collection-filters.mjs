/**
 * Configure Boat O'Craigo collection filters:
 * 1. Enable filterable metafield capabilities (if not already)
 * 2. Assign wine products to the Wines collection
 *
 * Search & Discovery filter registration still requires Admin UI — this script
 * prepares metafields and collection membership so filters work once added.
 *
 * Usage:
 *   node scripts/configure-collection-filters.mjs
 *
 * Requires SHOPIFY_ADMIN_API_TOKEN or shopify CLI auth via store execute fallback.
 */

const STORE = process.env.SHOPIFY_STORE || 'boat-o-craigo.myshopify.com';
const TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION || '2025-04';
const WINES_COLLECTION_ID = 'gid://shopify/Collection/301712080980';

const FILTER_METAFIELD_KEYS = ['vintage', 'variety_blend', 'label_range'];

async function adminGraphql(query, variables = {}) {
  const response = await fetch(`https://${STORE}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join('; '));
  }

  return payload.data;
}

async function enableFilterMetafields() {
  const mutation = `
    mutation EnableWineFilterMetafields($key: String!) {
      metafieldDefinitionUpdate(
        definition: {
          namespace: "wine"
          key: $key
          ownerType: PRODUCT
          capabilities: {
            adminFilterable: { enabled: true }
            smartCollectionCondition: { enabled: true }
          }
        }
      ) {
        updatedDefinition {
          key
          capabilities {
            adminFilterable { enabled }
            smartCollectionCondition { enabled }
          }
        }
        userErrors { field message code }
      }
    }
  `;

  for (const key of FILTER_METAFIELD_KEYS) {
    const data = await adminGraphql(mutation, { key });
    const result = data.metafieldDefinitionUpdate;
    const errors = result.userErrors || [];
    if (errors.length) {
      console.log(`wine.${key}: failed — ${errors.map((e) => e.message).join('; ')}`);
    } else {
      const caps = result.updatedDefinition.capabilities;
      console.log(
        `wine.${key}: adminFilterable=${caps.adminFilterable.enabled}, smartCollection=${caps.smartCollectionCondition.enabled}`
      );
    }
  }
}

async function fetchWineProductIds() {
  const query = `
    query WineProductIds($cursor: String) {
      products(first: 100, after: $cursor, query: "status:active -product_type:'Gift Card'") {
        pageInfo { hasNextPage endCursor }
        nodes { id title productType }
      }
    }
  `;

  const ids = [];
  let cursor = null;

  do {
    const data = await adminGraphql(query, { cursor });
    const { nodes, pageInfo } = data.products;
    for (const product of nodes) {
      ids.push(product.id);
    }
    cursor = pageInfo.hasNextPage ? pageInfo.endCursor : null;
  } while (cursor);

  return ids;
}

async function addProductsToWinesCollection(productIds) {
  const mutation = `
    mutation AddProductsToWinesCollection($collectionId: ID!, $productIds: [ID!]!) {
      collectionAddProducts(id: $collectionId, productIds: $productIds) {
        collection {
          handle
          productsCount { count }
        }
        userErrors { field message }
      }
    }
  `;

  const chunkSize = 250;
  let totalAdded = 0;

  for (let i = 0; i < productIds.length; i += chunkSize) {
    const chunk = productIds.slice(i, i + chunkSize);
    const data = await adminGraphql(mutation, {
      collectionId: WINES_COLLECTION_ID,
      productIds: chunk,
    });
    const result = data.collectionAddProducts;
    const errors = result.userErrors || [];
    if (errors.length) {
      throw new Error(errors.map((e) => e.message).join('; '));
    }
    totalAdded += chunk.length;
    console.log(`Added batch: ${chunk.length} products (total ${totalAdded})`);
  }

  return totalAdded;
}

async function main() {
  if (!TOKEN) {
    console.error('SHOPIFY_ADMIN_API_TOKEN is required for this script.');
    console.error('Shopify CLI store execute was used for metafield capability updates.');
    process.exit(1);
  }

  console.log(`Store: ${STORE}`);
  console.log('\n1) Enabling filter metafield capabilities...');
  await enableFilterMetafields();

  console.log('\n2) Fetching active wine product IDs...');
  const productIds = await fetchWineProductIds();
  console.log(`Found ${productIds.length} products (excluding Gift Card).`);

  console.log('\n3) Adding products to Wines collection...');
  await addProductsToWinesCollection(productIds);

  console.log('\nDone. Next: add filters in Search & Discovery Admin:');
  console.log('  - Availability (default)');
  console.log('  - Price (default)');
  console.log('  - Product type (Wine type)');
  console.log('  - wine.vintage');
  console.log('  - wine.variety_blend');
  console.log('  - wine.label_range');
}

main().catch((error) => {
  console.error(`Fatal: ${error.message}`);
  process.exit(1);
});
