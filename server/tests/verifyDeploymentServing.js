import app from '../app.js';
import http from 'http';

// Helper to simulate request without needing socket listen
function testRoute(method, url) {
  return new Promise((resolve) => {
    const req = new http.IncomingMessage();
    req.method = method;
    req.url = url;
    req.headers = { host: 'localhost:5000' };

    const res = new http.ServerResponse(req);
    let body = '';
    const headers = {};

    res.setHeader = (key, value) => {
      headers[key.toLowerCase()] = value;
    };
    res.getHeader = (key) => headers[key.toLowerCase()];

    const originalWrite = res.write;
    const originalEnd = res.end;

    res.write = function (chunk) {
      if (chunk) body += chunk.toString();
      return true;
    };

    res.end = function (chunk) {
      if (chunk) body += chunk.toString();
      resolve({
        statusCode: res.statusCode || 200,
        headers,
        body
      });
    };

    app.handle(req, res);
  });
}

async function verifyServing() {
  console.log('🧪 Verifying Production Deployment Asset Serving...\n');

  // Test 1: Root / should serve index.html
  const rootRes = await testRoute('GET', '/');
  console.log(`1. GET / -> Status: ${rootRes.statusCode}`);
  const isHtml = rootRes.body.includes('<!doctype html>') && rootRes.body.includes('<div id="root"></div>');
  console.log(`   Serves valid HTML: ${isHtml ? '✅ PASS' : '❌ FAIL'}`);

  // Test 2: CSS bundle serving
  const cssMatch = rootRes.body.match(/href="(\/assets\/[^"]+\.css)"/);
  const cssUrl = cssMatch ? cssMatch[1] : null;
  if (cssUrl) {
    const cssRes = await testRoute('GET', cssUrl);
    console.log(`2. GET ${cssUrl} -> Status: ${cssRes.statusCode}`);
    console.log(`   Has CSS content: ${cssRes.body.includes('tailwindcss') ? '✅ PASS' : '❌ FAIL'}`);
  } else {
    console.log('2. ❌ FAIL: CSS link not found in index.html');
  }

  // Test 3: JS bundle serving
  const jsMatch = rootRes.body.match(/src="(\/assets\/[^"]+\.js)"/);
  const jsUrl = jsMatch ? jsMatch[1] : null;
  if (jsUrl) {
    const jsRes = await testRoute('GET', jsUrl);
    console.log(`3. GET ${jsUrl} -> Status: ${jsRes.statusCode}`);
    console.log(`   Has JS content: ${jsRes.body.length > 1000 ? '✅ PASS' : '❌ FAIL'}`);
  } else {
    console.log('3. ❌ FAIL: JS script not found in index.html');
  }

  // Test 4: Missing asset must NOT return index.html (prevents strict MIME type rejection)
  const missingAssetRes = await testRoute('GET', '/assets/non-existent.css');
  console.log(`4. GET /assets/non-existent.css -> Status: ${missingAssetRes.statusCode}`);
  console.log(`   Returns 404 (not HTML): ${missingAssetRes.statusCode === 404 && !missingAssetRes.body.includes('<!doctype html>') ? '✅ PASS' : '❌ FAIL'}`);

  // Test 5: SPA route /doctors fallback to index.html
  const spaRes = await testRoute('GET', '/doctors');
  console.log(`5. GET /doctors -> Status: ${spaRes.statusCode}`);
  console.log(`   SPA Fallback to index.html: ${spaRes.body.includes('<div id="root"></div>') ? '✅ PASS' : '❌ FAIL'}`);

  // Test 6: API health check remains operational
  const healthRes = await testRoute('GET', '/api/health');
  console.log(`6. GET /api/health -> Status: ${healthRes.statusCode}`);
  console.log(`   API JSON valid: ${healthRes.body.includes('healthy') ? '✅ PASS' : '❌ FAIL'}`);

  console.log('\n🏁 All deployment serving checks completed!\n');
}

verifyServing().catch(console.error);

