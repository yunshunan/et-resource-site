// 浏览器检测配置
const browserConfig = {
  browsers: {
    chrome: {
      name: 'Chrome',
      patterns: ['Chrome/([0-9.]+)', 'CriOS/([0-9.]+)'],
      features: ['ES6', 'WebGL', 'WebRTC', 'ServiceWorker']
    },
    firefox: {
      name: 'Firefox',
      patterns: ['Firefox/([0-9.]+)', 'FxiOS/([0-9.]+)'],
      features: ['ES6', 'WebGL', 'WebRTC', 'ServiceWorker']
    },
    safari: {
      name: 'Safari',
      patterns: ['Safari/([0-9.]+)', 'Version/([0-9.]+)'],
      features: ['ES6', 'WebGL', 'WebRTC', 'ServiceWorker']
    },
    edge: {
      name: 'Edge',
      patterns: ['Edge/([0-9.]+)', 'Edg/([0-9.]+)'],
      features: ['ES6', 'WebGL', 'WebRTC', 'ServiceWorker']
    }
  },
  platforms: {
    windows: {
      name: 'Windows',
      patterns: ['Windows NT ([0-9.]+)', 'Windows']
    },
    macos: {
      name: 'macOS',
      patterns: ['Macintosh', 'Mac OS X ([0-9._]+)']
    },
    linux: {
      name: 'Linux',
      patterns: ['Linux']
    },
    android: {
      name: 'Android',
      patterns: ['Android']
    },
    ios: {
      name: 'iOS',
      patterns: ['iPhone', 'iPad', 'iPod']
    }
  }
}

// 检测浏览器信息
const detectBrowser = () => {
  const ua = navigator.userAgent
  const browserInfo = {
    name: 'Unknown',
    version: 'Unknown',
    platform: 'Unknown',
    userAgent: ua,
    features: {}
  }
  
  // 检测浏览器
  for (const [key, browser] of Object.entries(browserConfig.browsers)) {
    for (const pattern of browser.patterns) {
      const match = ua.match(new RegExp(pattern))
      if (match) {
        browserInfo.name = browser.name
        browserInfo.version = match[1] || 'Unknown'
        break
      }
    }
    if (browserInfo.name !== 'Unknown') break
  }
  
  // 检测平台
  for (const [key, platform] of Object.entries(browserConfig.platforms)) {
    for (const pattern of platform.patterns) {
      const match = ua.match(new RegExp(pattern))
      if (match) {
        browserInfo.platform = platform.name
        break
      }
    }
    if (browserInfo.platform !== 'Unknown') break
  }
  
  // 检测特性支持
  browserInfo.features = {
    ES6: {
      supported: true,
      details: {
        'let/const': (function() { try { new Function('let x = 1'); return true; } catch(e) { return false; } })(),
        'arrow functions': typeof (() => {}) === 'function',
        'promises': typeof Promise !== 'undefined',
        'async/await': typeof async function(){}.constructor === 'function',
        'classes': typeof class Test {} === 'function',
        'modules': (function() { try { new Function('return import("")'); return true; } catch(e) { return false; } })()
      }
    },
    WebGL: {
      supported: !!document.createElement('canvas').getContext('webgl'),
      details: {
        'WebGL 1.0': !!document.createElement('canvas').getContext('webgl'),
        'WebGL 2.0': !!document.createElement('canvas').getContext('webgl2')
      }
    },
    WebRTC: {
      supported: !!navigator.mediaDevices?.getUserMedia,
      details: {
        'getUserMedia': !!navigator.mediaDevices?.getUserMedia,
        'RTCPeerConnection': !!window.RTCPeerConnection,
        'RTCDataChannel': !!window.RTCDataChannel,
        'getDisplayMedia': !!navigator.mediaDevices?.getDisplayMedia
      }
    },
    ServiceWorker: {
      supported: !!navigator.serviceWorker,
      details: {
        'Service Worker API': !!navigator.serviceWorker,
        'Push API': !!navigator.pushManager,
        'Notifications API': !!window.Notification
      }
    },
    Storage: {
      supported: true,
      details: {
        'localStorage': !!window.localStorage,
        'sessionStorage': !!window.sessionStorage,
        'IndexedDB': !!window.indexedDB
      }
    },
    Network: {
      supported: true,
      details: {
        'Fetch API': !!window.fetch,
        'WebSocket': !!window.WebSocket,
        'Beacon API': !!navigator.sendBeacon
      }
    }
  }
  
  return browserInfo
}

// 获取浏览器兼容性报告
const getBrowserReport = () => {
  const browserInfo = detectBrowser()
  const report = {
    timestamp: Date.now(),
    browser: browserInfo,
    compatibility: {
      score: 0,
      issues: []
    }
  }
  
  // 计算兼容性得分
  let totalFeatures = 0
  let supportedFeatures = 0
  
  for (const [category, feature] of Object.entries(browserInfo.features)) {
    if (feature.supported) {
      supportedFeatures++
    }
    totalFeatures++
    
    // 检查详细特性支持情况
    for (const [detail, supported] of Object.entries(feature.details)) {
      if (!supported) {
        report.compatibility.issues.push({
          category,
          feature: detail,
          severity: 'warning'
        })
      }
    }
  }
  
  report.compatibility.score = Math.round((supportedFeatures / totalFeatures) * 100)
  
  return report
}

export {
  detectBrowser,
  getBrowserReport
} 