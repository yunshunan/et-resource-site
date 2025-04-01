const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const fs = require('fs');
const path = require('path');

const PORT = 8042;
const URL = 'http://localhost:4173';

async function runLighthouse(url) {
  const browser = await puppeteer.launch({
    args: [`--remote-debugging-port=${PORT}`],
    headless: true
  });

  try {
    const options = {
      logLevel: 'info',
      output: 'json',
      port: PORT,
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      throttling: {
        rttMs: 40,
        throughputKbps: 10240,
        cpuSlowdownMultiplier: 1,
      },
      screenEmulation: {
        mobile: false,
        disable: false,
        width: 1350,
        height: 940,
        deviceScaleRatio: 1,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    const results = await lighthouse(url, options);
    const reportJson = results.lhr;
    const reportHtml = results.report;

    // 保存 JSON 报告
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportsDir = path.join(__dirname, '../reports/performance');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(reportsDir, `lighthouse-report-${timestamp}.json`),
      JSON.stringify(reportJson, null, 2)
    );

    fs.writeFileSync(
      path.join(reportsDir, `lighthouse-report-${timestamp}.html`),
      reportHtml
    );

    // 提取关键性能指标
    const metrics = {
      firstContentfulPaint: reportJson.audits['first-contentful-paint'].numericValue,
      speedIndex: reportJson.audits['speed-index'].numericValue,
      largestContentfulPaint: reportJson.audits['largest-contentful-paint'].numericValue,
      timeToInteractive: reportJson.audits['interactive'].numericValue,
      totalBlockingTime: reportJson.audits['total-blocking-time'].numericValue,
      cumulativeLayoutShift: reportJson.audits['cumulative-layout-shift'].numericValue,
      performanceScore: reportJson.categories.performance.score * 100
    };

    console.log('Performance Metrics:', metrics);

    // 检查性能指标是否达到阈值
    const thresholds = {
      firstContentfulPaint: 1800,
      speedIndex: 3500,
      largestContentfulPaint: 2500,
      timeToInteractive: 3800,
      totalBlockingTime: 300,
      cumulativeLayoutShift: 0.1,
      performanceScore: 90
    };

    let hasFailed = false;
    for (const [metric, value] of Object.entries(metrics)) {
      const threshold = thresholds[metric];
      if (value > threshold) {
        console.error(`❌ ${metric} failed: ${value}ms (threshold: ${threshold}ms)`);
        hasFailed = true;
      } else {
        console.log(`✅ ${metric} passed: ${value}ms (threshold: ${threshold}ms)`);
      }
    }

    if (hasFailed) {
      process.exit(1);
    }

  } finally {
    await browser.close();
  }
}

// 运行性能测试
runLighthouse(URL).catch(console.error); 