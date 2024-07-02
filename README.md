# Report Generation

## Download Chromium

1. Run `build-layer.sh` script to download the chromium version from <https://github.com/Sparticuz/chromium/releases>.
2. Upload to S3 using `aws-vault`:

```bash
aws-vault exec <profile> -- aws s3 cp bin/chromium_v<version>.zip s3://<bucket-name>/chromium_v<version>.zip
```

3. Publish a Lambda Layer using `aws-vault`:

```bash
aws-vault exec <profile> -- aws lambda publish-layer-version --region <region> --layer-name chromium --description "Chromium v<version>" --content "S3Bucket=<bucket_name>,S3Key=chromiumLayers/chromium-v<version>-layer.zip" --compatible-runtimes nodejs --compatible-architectures x86_64
```

## Deploy to AWS using Serverless

### Installation

- Install `serverless`: `npm i -g serverless@v3`

1. Create a config file for the environment under `config` folder (e.g. dev.yml, prod.yml)

2. Deploy to AWS using serverless:

```bash
aws-vault exec <profile>> -- sls deploy --stage dev --aws-profile <profile>
```

## Testing the function locally with serverless

```bash
serverless invoke local --function generateReport --path tests/test-event.json
```

Here's a queue example message:

```json
{
  "customer_id": "12345",
  "template": "ReportTemplate.html",
  "data": {
    "name": "John",
    "last_name": "Doe"
  },
  "format": "PDF"
}
```
