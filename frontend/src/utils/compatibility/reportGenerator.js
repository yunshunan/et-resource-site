import { getTestStatistics } from './storage'

// 报告生成配置
const reportConfig = {
  template: {
    title: '浏览器兼容性测试报告',
    sections: [
      {
        title: '测试概述',
        content: (data) => `
          <div class="report-section">
            <h2>测试概述</h2>
            <p>报告生成时间：${new Date(data.timestamp).toLocaleString()}</p>
            <p>测试环境：${data.browser.name} ${data.browser.version} (${data.browser.platform})</p>
            <p>兼容性得分：${data.compatibility.score}%</p>
          </div>
        `
      },
      {
        title: '性能测试结果',
        content: (data) => `
          <div class="report-section">
            <h2>性能测试结果</h2>
            <div class="metrics-grid">
              <div class="metric-item">
                <h3>总测试数</h3>
                <p>${data.performance.summary.total}</p>
              </div>
              <div class="metric-item">
                <h3>通过测试</h3>
                <p>${data.performance.summary.passed}</p>
              </div>
              <div class="metric-item">
                <h3>失败测试</h3>
                <p>${data.performance.summary.failed}</p>
              </div>
              <div class="metric-item">
                <h3>平均耗时</h3>
                <p>${data.performance.summary.averageDuration.toFixed(2)}ms</p>
              </div>
            </div>
          </div>
        `
      },
      {
        title: '特性支持情况',
        content: (data) => `
          <div class="report-section">
            <h2>特性支持情况</h2>
            <div class="features-grid">
              ${Object.entries(data.browser.features).map(([name, feature]) => `
                <div class="feature-item ${feature.supported ? 'supported' : 'unsupported'}">
                  <h3>${name}</h3>
                  <p>支持状态：${feature.supported ? '支持' : '不支持'}</p>
                  <ul>
                    ${Object.entries(feature.details).map(([detail, supported]) => `
                      <li>${detail}: ${supported ? '支持' : '不支持'}</li>
                    `).join('')}
                  </ul>
                </div>
              `).join('')}
            </div>
          </div>
        `
      },
      {
        title: '问题报告',
        content: (data) => `
          <div class="report-section">
            <h2>问题报告</h2>
            ${data.issues.length > 0 ? `
              <div class="issues-list">
                ${data.issues.map(issue => `
                  <div class="issue-item ${issue.severity}">
                    <h3>${issue.type === 'compatibility' ? '兼容性问题' : '性能问题'}</h3>
                    <p>类别：${issue.category}</p>
                    <p>特性：${issue.feature}</p>
                    <p>严重程度：${issue.severity === 'error' ? '错误' : '警告'}</p>
                    <p>详情：${issue.details}</p>
                  </div>
                `).join('')}
              </div>
            ` : '<p>未发现问题</p>'}
          </div>
        `
      },
      {
        title: '历史趋势',
        content: async (data) => {
          const stats = await getTestStatistics(7)
          if (!stats) return '<p>无历史数据</p>'
          
          return `
            <div class="report-section">
              <h2>历史趋势 (最近7天)</h2>
              <div class="trends-grid">
                <div class="trend-item">
                  <h3>测试总数</h3>
                  <p>${stats.totalTests}</p>
                </div>
                <div class="trend-item">
                  <h3>通过率</h3>
                  <p>${stats.successRate.toFixed(2)}%</p>
                </div>
                <div class="trend-item">
                  <h3>平均响应时间</h3>
                  <p>${stats.averageResponseTime.toFixed(2)}ms</p>
                </div>
                <div class="trend-item">
                  <h3>最大响应时间</h3>
                  <p>${stats.maxResponseTime.toFixed(2)}ms</p>
                </div>
              </div>
              <div class="daily-stats">
                <h3>每日统计</h3>
                <table>
                  <thead>
                    <tr>
                      <th>日期</th>
                      <th>总数</th>
                      <th>通过</th>
                      <th>失败</th>
                      <th>平均响应时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${Object.entries(stats.dailyStats).map(([date, dayStats]) => `
                      <tr>
                        <td>${date}</td>
                        <td>${dayStats.total}</td>
                        <td>${dayStats.passed}</td>
                        <td>${dayStats.failed}</td>
                        <td>${dayStats.averageResponseTime.toFixed(2)}ms</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          `
        }
      }
    ]
  },
  styles: `
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }
      
      .report-section {
        margin-bottom: 40px;
        padding: 20px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      h2 {
        color: #2c3e50;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 2px solid #eee;
      }
      
      h3 {
        color: #34495e;
        margin-bottom: 15px;
      }
      
      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 20px;
      }
      
      .metric-item {
        padding: 15px;
        background: #f8f9fa;
        border-radius: 6px;
        text-align: center;
      }
      
      .metric-item h3 {
        margin-bottom: 10px;
        color: #6c757d;
      }
      
      .metric-item p {
        font-size: 24px;
        font-weight: bold;
        color: #2c3e50;
      }
      
      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
      }
      
      .feature-item {
        padding: 15px;
        border-radius: 6px;
        background: #f8f9fa;
      }
      
      .feature-item.supported {
        border-left: 4px solid #28a745;
      }
      
      .feature-item.unsupported {
        border-left: 4px solid #dc3545;
      }
      
      .feature-item ul {
        margin: 10px 0;
        padding-left: 20px;
      }
      
      .issues-list {
        display: grid;
        gap: 15px;
      }
      
      .issue-item {
        padding: 15px;
        border-radius: 6px;
        background: #fff;
        border-left: 4px solid #ffc107;
      }
      
      .issue-item.error {
        border-left-color: #dc3545;
        background: #fff5f5;
      }
      
      .issue-item.warning {
        border-left-color: #ffc107;
        background: #fff9e6;
      }
      
      .trends-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 20px;
      }
      
      .trend-item {
        padding: 15px;
        background: #f8f9fa;
        border-radius: 6px;
        text-align: center;
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      
      th, td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #eee;
      }
      
      th {
        background: #f8f9fa;
        font-weight: 600;
      }
      
      tr:hover {
        background: #f8f9fa;
      }
    </style>
  `
}

// 生成HTML报告
const generateHTMLReport = async (data) => {
  try {
    let content = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${reportConfig.template.title}</title>
          ${reportConfig.styles}
        </head>
        <body>
          <h1>${reportConfig.template.title}</h1>
    `
    
    for (const section of reportConfig.template.sections) {
      content += await section.content(data)
    }
    
    content += `
        </body>
      </html>
    `
    
    return content
  } catch (error) {
    console.error('生成HTML报告失败:', error)
    return null
  }
}

// 生成PDF报告
const generatePDFReport = async (data) => {
  try {
    const html = await generateHTMLReport(data)
    if (!html) return null
    
    // 这里可以使用html2pdf.js或其他PDF生成库
    // 示例使用html2pdf.js
    const element = document.createElement('div')
    element.innerHTML = html
    
    const opt = {
      margin: 1,
      filename: `compatibility-test-report-${new Date().toISOString()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    }
    
    // 需要引入html2pdf.js库
    // await html2pdf().set(opt).from(element).save()
    
    return true
  } catch (error) {
    console.error('生成PDF报告失败:', error)
    return null
  }
}

// 导出报告
const exportReport = async (data, format = 'html') => {
  try {
    if (format === 'html') {
      const html = await generateHTMLReport(data)
      if (!html) return false
      
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `compatibility-test-report-${new Date().toISOString()}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else if (format === 'pdf') {
      await generatePDFReport(data)
    }
    
    return true
  } catch (error) {
    console.error('导出报告失败:', error)
    return false
  }
}

export {
  reportConfig,
  generateHTMLReport,
  generatePDFReport,
  exportReport
} 