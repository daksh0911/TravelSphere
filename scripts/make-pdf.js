import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import process from 'node:process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const htmlPath = path.resolve(__dirname, 'generate_viva_guide.html');
  const outPath1 = path.resolve(__dirname, '..', 'TravelSphere_Presentation_And_Viva_Guide.pdf');
  const outPath2 = 'C:\\Users\\daksh\\.gemini\\antigravity\\brain\\e248b25a-928b-4a95-8e5c-7db29899111c\\TravelSphere_Presentation_And_Viva_Guide.pdf';

  console.log('Launching Edge via puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  const fileUrl = `file:///${htmlPath.replace(/\\/g, '/')}`;
  console.log('Navigating to', fileUrl);
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '12mm',
      bottom: '12mm',
      left: '14mm',
      right: '14mm'
    }
  });

  fs.writeFileSync(outPath1, pdfBuffer);
  console.log('Generated PDF at', outPath1, 'Size:', pdfBuffer.length);

  try {
    fs.writeFileSync(outPath2, pdfBuffer);
    console.log('Generated PDF at artifact dir:', outPath2);
  } catch (e) {
    console.warn('Artifact write notice:', e.message);
  }

  await browser.close();
  console.log('Finished successfully!');
}

main().catch(err => {
  console.error('Failed to generate PDF:', err);
  process.exit(1);
});
