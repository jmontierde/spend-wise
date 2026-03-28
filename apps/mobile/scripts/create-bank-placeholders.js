const fs = require('fs');
const path = require('path');

// 1x1 transparent PNG (smallest valid PNG)
const transparentPNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

const banks = [
  'maya', 'tonik', 'gotyme', 'udigital', 'cimb', 'ing', 'seabank', 'ownbank', 'netbank', 'uno',
  'bpi', 'bdo', 'metrobank', 'secbank', 'landbank', 'pnb', 'rcbc', 'chinabank', 'eastwest', 'unionbank',
  'gcash', 'paymaya', 'grabpay', 'shopeepay'
];

const dir = path.join(__dirname, '../assets/images/banks');

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

banks.forEach(bank => {
  const filePath = path.join(dir, `${bank}.png`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, transparentPNG);
    console.log(`Created: ${bank}.png`);
  } else {
    console.log(`Exists: ${bank}.png`);
  }
});

console.log('\nPlaceholder images created! Replace them with actual bank logos.');
console.log('Recommended size: 128x128 or 256x256 PNG with transparent background.');
