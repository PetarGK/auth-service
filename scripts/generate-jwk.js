const { generateKeyPairSync, createPrivateKey } = require('crypto');
const { exportJWK } = require('jose');

const { privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

(async () => {
  const keyObject = createPrivateKey(privateKey);
  const jwk = await exportJWK(keyObject);
  console.log(JSON.stringify(jwk));
})();