module.exports = {
  ci: {
    collect: {
      // 测试的URL列表
      url: [
        'http://localhost:8080/',
        'http://localhost:8080/resource-market',
        'http://localhost:8080/login'
      ],
      numberOfRuns: 3, // 每个URL运行3次
      settings: {
        // 针对桌面运行的配置
        preset: 'desktop',
        throttling: {
          // 使用较慢的网络和CPU速度，测试在弱网环境下的性能
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
        // 启用所有审计
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      },
    },
    upload: {
      // 上传到临时存储
      target: 'temporary-public-storage',
    },
    assert: {
      // 性能指标预算
      assertions: {
        'categories:performance': ['error', {minScore: 0.8}],
        'categories:accessibility': ['error', {minScore: 0.9}],
        'categories:best-practices': ['error', {minScore: 0.9}],
        'categories:seo': ['error', {minScore: 0.9}],
        'first-contentful-paint': ['error', {maxNumericValue: 2000}],
        'largest-contentful-paint': ['error', {maxNumericValue: 2500}],
        'cumulative-layout-shift': ['error', {maxNumericValue: 0.1}],
        'total-blocking-time': ['error', {maxNumericValue: 300}],
        'max-potential-fid': ['error', {maxNumericValue: 200}],
      },
    },
  },
}; 