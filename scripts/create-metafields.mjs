/**
 * Create Boat O'Craigo wine.* product metafield definitions via Shopify Admin GraphQL API.
 *
 * Usage:
 *   set SHOPIFY_ADMIN_API_TOKEN=shpat_...
 *   node scripts/create-metafields.mjs
 *
 * Optional:
 *   set SHOPIFY_STORE=boat-o-craigo.myshopify.com
 *   set SHOPIFY_API_VERSION=2025-04
 */

const STORE = process.env.SHOPIFY_STORE || 'boat-o-craigo.myshopify.com';
const TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION || '2025-04';

const METAFIELDS = [
  // Tier 1
  { tier: 1, key: 'vintage', name: 'Vintage', type: 'number_integer' },
  { tier: 1, key: 'region', name: 'Region', type: 'single_line_text_field' },
  { tier: 1, key: 'subregion', name: 'Subregion', type: 'single_line_text_field' },
  { tier: 1, key: 'country', name: 'Country', type: 'single_line_text_field' },
  { tier: 1, key: 'variety_blend', name: 'Variety / Blend', type: 'single_line_text_field' },
  { tier: 1, key: 'abv', name: 'Alcohol by Volume (%)', type: 'number_decimal' },
  { tier: 1, key: 'bottle_size_ml', name: 'Bottle Size (mL)', type: 'number_integer' },
  { tier: 1, key: 'closure', name: 'Closure Type', type: 'single_line_text_field' },
  { tier: 1, key: 'standard_drinks', name: 'Standard Drinks', type: 'number_decimal' },
  { tier: 1, key: 'winemaker', name: 'Winemaker', type: 'single_line_text_field' },
  { tier: 1, key: 'label_range', name: 'Label / Range', type: 'single_line_text_field' },
  // Tier 2
  { tier: 2, key: 'serving_temp_c', name: 'Serving Temperature (°C)', type: 'number_integer' },
  { tier: 2, key: 'ph', name: 'pH', type: 'number_decimal' },
  { tier: 2, key: 'acidity', name: 'Acidity (g/L)', type: 'number_decimal' },
  { tier: 2, key: 'tasting_eyes', name: 'Tasting Note — Appearance', type: 'multi_line_text_field' },
  { tier: 2, key: 'tasting_nose', name: 'Tasting Note — Aroma', type: 'multi_line_text_field' },
  { tier: 2, key: 'tasting_mouth', name: 'Tasting Note — Palate', type: 'multi_line_text_field' },
  { tier: 2, key: 'winemaking_notes', name: 'Winemaking Notes', type: 'rich_text_field' },
  { tier: 2, key: 'ageing_process', name: 'Ageing Process', type: 'rich_text_field' },
  { tier: 2, key: 'harvest_date', name: 'Harvest Date', type: 'date' },
  { tier: 2, key: 'release_date', name: 'Release Date', type: 'date' },
];

const LIST_QUERY = `
  query ListWineMetafieldDefinitions {
    metafieldDefinitions(first: 100, ownerType: PRODUCT, namespace: "wine") {
      nodes {
        key
        name
        type {
          name
        }
      }
    }
  }
`;

const CREATE_MUTATION = `
  mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) {
      createdDefinition {
        id
        namespace
        key
        name
        type {
          name
        }
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

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

function formatUserErrors(userErrors) {
  return userErrors
    .map((error) => {
      const field = Array.isArray(error.field) ? error.field.join('.') : error.field;
      return `${field || 'definition'}: ${error.message}${error.code ? ` (${error.code})` : ''}`;
    })
    .join('; ');
}

async function listExistingDefinitions() {
  const data = await adminGraphql(LIST_QUERY);
  return new Map(
    data.metafieldDefinitions.nodes.map((node) => [node.key, node])
  );
}

async function createDefinition(definition, existing) {
  if (existing.has(definition.key)) {
    const current = existing.get(definition.key);
    return {
      status: 'already existed',
      key: definition.key,
      detail: `${current.name} (${current.type.name})`,
    };
  }

  const data = await adminGraphql(CREATE_MUTATION, {
    definition: {
      namespace: 'wine',
      key: definition.key,
      name: definition.name,
      type: definition.type,
      ownerType: 'PRODUCT',
    },
  });

  const result = data.metafieldDefinitionCreate;
  const userErrors = result.userErrors || [];

  if (userErrors.length) {
    return {
      status: 'failed',
      key: definition.key,
      detail: formatUserErrors(userErrors),
    };
  }

  const created = result.createdDefinition;
  return {
    status: 'created',
    key: definition.key,
    detail: `${created.name} (${created.type.name})`,
  };
}

async function main() {
  if (!TOKEN) {
    console.error('ERROR: SHOPIFY_ADMIN_API_TOKEN is not set.');
    console.error('Create a custom app in Shopify Admin with write_products scope,');
    console.error('generate an Admin API access token, and add it to a local .env file:');
    console.error('  SHOPIFY_ADMIN_API_TOKEN=shpat_...');
    process.exit(1);
  }

  console.log(`Store: ${STORE}`);
  console.log(`API version: ${API_VERSION}`);
  console.log(`Definitions to ensure: ${METAFIELDS.length}`);

  const existing = await listExistingDefinitions();
  const results = [];

  for (const definition of METAFIELDS) {
    const result = await createDefinition(definition, existing);
    results.push({ tier: definition.tier, ...result });
    console.log(`[Tier ${definition.tier}] wine.${definition.key}: ${result.status}${result.detail ? ` — ${result.detail}` : ''}`);
  }

  const created = results.filter((item) => item.status === 'created').length;
  const existed = results.filter((item) => item.status === 'already existed').length;
  const failed = results.filter((item) => item.status === 'failed');

  console.log('');
  console.log(`Summary: ${created} created, ${existed} already existed, ${failed.length} failed`);

  if (failed.length) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
