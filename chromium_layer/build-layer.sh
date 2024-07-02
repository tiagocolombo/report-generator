#!/bin/bash

set -e

#Check https://github.com/Sparticuz/chromium/releases for Chromium releases version

# Define variables
CHROMIUM_VERSION="123.0.1"
CHROMIUM_URL="https://github.com/Sparticuz/chromium/releases/download/v${CHROMIUM_VERSION}/chromium-v${CHROMIUM_VERSION}-layer.zip"

# Download Chromium
mkdir -p bin
curl -Lo bin/chromium_v${CHROMIUM_VERSION}.zip ${CHROMIUM_URL}