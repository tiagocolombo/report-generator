import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { SQSClient } from "@aws-sdk/client-sqs";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const s3 = new S3Client({});
const sqs = new SQSClient({});

export const generateReport = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    const { customer_id, template, data, format } = JSON.parse(record.body);

    let reportContent;
    if (format === "PDF") {
      reportContent = await generatePDF(template, data);
    } else if (format === "HTML") {
      reportContent = await generateHTML(template, data);
    } else if (format === "JSON") {
      reportContent = JSON.stringify(data, null, 2);
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }

    await saveToS3(
      `reports/${customer_id}.${format.toLowerCase()}`,
      reportContent,
      format
    );
  }
};

const generatePDF = async (template, data) => {
  console.log("Generating PDF report");

  // Render HTML template
  const htmlContent = await renderHtmlTemplate(template, data);

  // Launch headless Chromium
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });

  // Create a new page
  const page = await browser.newPage();
  await page.setContent(htmlContent);

  // Generate PDF
  const pdfBuffer = await page.pdf({ format: "A4" });

  // Close the browser
  await browser.close();
  return pdfBuffer;
};

const renderHtmlTemplate = async (template, data) => {
  // Load template
  const templatePath = path.resolve(__dirname, "templates", template);
  const templateContent = fs.readFileSync(templatePath, "utf8");

  // Compile template
  const compiledTemplate = Handlebars.compile(templateContent);
  return compiledTemplate(data);
};

const generateHTML = async (template, data) => {
  const htmlContent = await renderHtmlTemplate(template, data);
  return `<!DOCTYPE html><html><body>${htmlContent}</body></html>`;
};

const saveToS3 = async (key, content, format) => {
  const bucketName = process.env.S3_BUCKET;
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: format === "PDF" ? Buffer.from(content) : content,
    ContentType:
      format === "PDF"
        ? "application/pdf"
        : format === "HTML"
        ? "text/html"
        : "application/json",
  };
  const command = new PutObjectCommand(params);
  await s3.send(command);
};
