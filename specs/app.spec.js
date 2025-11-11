const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const docsDir = path.join(__dirname, '..', 'docs');
const galleryDir = path.join(docsDir, 'gallery');

const readHtml = (relativePath) => {
  const filePath = path.join(docsDir, relativePath);
  return fs.readFileSync(filePath, 'utf8');
};

test('home page loads Turbo and the gallery frame placeholder', () => {
  const homepage = readHtml('index.html');

  assert.ok(
    homepage.includes('@hotwired/turbo@latest/dist/turbo.es2017-esm.min.js'),
    'Expected the compiled Turbo script to be referenced in the <head>'
  );

  assert.match(
    homepage,
    /<turbo-frame[^>]+id="gallery"[^>]+src="\.\/gallery\/ocean"/,
    'Homepage should include the gallery turbo-frame placeholder'
  );
});

test('gallery partials render Turbo frames and link to real targets', () => {
  const galleryFiles = fs
    .readdirSync(galleryDir)
    .filter((name) => name.endsWith('.html'));

  assert.ok(galleryFiles.length, 'Expected at least one gallery partial');

  const linkedTargets = new Set();

  for (const file of galleryFiles) {
    const html = readHtml(path.join('gallery', file));

    assert.match(
      html,
      /<turbo-frame[^>]+id="gallery"/,
      `${file} should return Turbo frame markup`
    );

    const linkMatch = html.match(/href="\.\/*gallery\/([a-z0-9_-]+)"/i);
    assert.ok(linkMatch, `${file} should link to the next gallery view`);

    linkedTargets.add(`${linkMatch[1]}.html`);
  }

  for (const target of linkedTargets) {
    assert.ok(
      galleryFiles.includes(target),
      `Expected to find the linked gallery target "${target}"`
    );
  }
});
