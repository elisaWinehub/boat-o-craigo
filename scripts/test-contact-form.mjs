/**
 * Test Shopify contact form submission for Boat O'Craigo contact page.
 * Usage: node scripts/test-contact-form.mjs
 */

const STORE = 'https://boat-o-craigo.myshopify.com';
const CONTACT_PAGE = `${STORE}/pages/contact`;

const TEST = {
  firstName: 'Elisa',
  lastName: 'DC',
  email: 'elisa@winehub.io',
  phone: '0400 000 000',
  enquiryType: 'general',
  orderNumber: 'TEST-12345',
  bookingReference: 'BOOK-TEST-99',
  message: 'Automated contact form test — dummy enquiry from theme verification. Please ignore.',
};

function extractInput(html, name) {
  const escaped = name.replace(/[[\]]/g, '\\$&');
  const patterns = [
    new RegExp(`name="${escaped}"[^>]*value="([^"]*)"`, 'i'),
    new RegExp(`value="([^"]*)"[^>]*name="${escaped}"`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }
  return '';
}

async function fetchContactPage() {
  const res = await fetch(CONTACT_PAGE, {
    headers: { Accept: 'text/html' },
    redirect: 'follow',
  });
  const html = await res.text();
  return { html, url: res.url, status: res.status, cookies: res.headers.getSetCookie?.() || [] };
}

async function submitContactForm(html, pageUrl) {
  const formType = extractInput(html, 'form_type') || 'contact';
  const utf8 = extractInput(html, 'utf8') || '✓';
  const authenticityToken = extractInput(html, 'authenticity_token');

  const formData = new URLSearchParams();
  formData.set('form_type', formType);
  formData.set('utf8', utf8);
  if (authenticityToken) formData.set('authenticity_token', authenticityToken);
  formData.set('contact[tags]', 'contact-page');
  formData.set('contact[first_name]', TEST.firstName);
  formData.set('contact[last_name]', TEST.lastName);
  formData.set('contact[email]', TEST.email);
  formData.set('contact[phone]', TEST.phone);
  formData.set('contact[Enquiry type]', TEST.enquiryType);
  formData.set('contact[Order number]', TEST.orderNumber);
  formData.set('contact[Booking reference]', TEST.bookingReference);
  formData.set('contact[body]', TEST.message);

  const res = await fetch(`${STORE}/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'text/html',
      Referer: pageUrl,
    },
    body: formData.toString(),
    redirect: 'manual',
  });

  const body = await res.text();
  return {
    status: res.status,
    location: res.headers.get('location'),
    hasSuccess: /posted_successfully|Thank you|success/i.test(body),
    hasErrors: /class="errors|form-errors|default_errors/i.test(body),
    bodySnippet: body.slice(0, 500),
  };
}

async function main() {
  console.log('Fetching contact page…');
  const page = await fetchContactPage();
  console.log('Page status:', page.status);
  console.log('Final URL:', page.url);

  const isPassword = page.url.includes('/password') || page.html.includes('password-main-content');
  if (isPassword) {
    console.log('Store is password-protected — contact page HTML not accessible publicly.');
    console.log('Attempting direct POST to /contact anyway…');
  }

  const hasContactForm = page.html.includes('boc-contact-form') || page.html.includes('contact[email]');
  console.log('Contact form found in HTML:', hasContactForm);

  const result = await submitContactForm(page.html, page.url);
  console.log('\nSubmit result:');
  console.log('  HTTP status:', result.status);
  console.log('  Redirect:', result.location || '(none)');
  console.log('  Success markers in response:', result.hasSuccess);
  console.log('  Error markers in response:', result.hasErrors);

  if (result.status >= 300 && result.status < 400) {
    console.log('\nRedirect received — submission likely accepted by Shopify.');
  } else if (result.status === 200 && !result.hasErrors) {
    console.log('\n200 OK without obvious errors — check store notifications inbox.');
  } else {
    console.log('\nResponse snippet:', result.bodySnippet);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
