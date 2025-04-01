import { performance } from 'perf_hooks'

// 性能测试配置
const performanceConfig = {
  testCases: [
    {
      name: 'DOM操作性能',
      description: '测试DOM元素的创建、修改和删除性能',
      test: async () => {
        const start = performance.now()
        const container = document.createElement('div')
        container.style.display = 'none'
        document.body.appendChild(container)
        
        // 创建元素
        for (let i = 0; i < 1000; i++) {
          const element = document.createElement('div')
          element.textContent = `Element ${i}`
          element.className = 'test-element'
          container.appendChild(element)
        }
        
        // 修改元素
        const elements = container.getElementsByClassName('test-element')
        for (let i = 0; i < elements.length; i++) {
          elements[i].style.backgroundColor = `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`
        }
        
        // 删除元素
        while (container.firstChild) {
          container.removeChild(container.firstChild)
        }
        
        document.body.removeChild(container)
        const end = performance.now()
        return end - start
      },
      threshold: 100, // ms
      category: 'DOM'
    },
    {
      name: 'Canvas渲染性能',
      description: '测试Canvas绘制复杂图形的性能',
      test: async () => {
        const canvas = document.createElement('canvas')
        canvas.width = 800
        canvas.height = 600
        const ctx = canvas.getContext('2d')
        const start = performance.now()
        
        // 绘制背景
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // 绘制复杂图形
        for (let i = 0; i < 100; i++) {
          ctx.beginPath()
          ctx.arc(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() * 50,
            0,
            Math.PI * 2
          )
          ctx.fillStyle = `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`
          ctx.fill()
          
          // 添加渐变效果
          const gradient = ctx.createRadialGradient(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            0,
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() * 100
          )
          gradient.addColorStop(0, `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},1)`)
          gradient.addColorStop(1, `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0)`)
          ctx.fillStyle = gradient
          ctx.fillRect(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            100,
            100
          )
        }
        
        const end = performance.now()
        return end - start
      },
      threshold: 200, // ms
      category: 'Canvas'
    },
    {
      name: 'WebGL性能',
      description: '测试WebGL渲染性能',
      test: async () => {
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl')
        if (!gl) return null
        
        const start = performance.now()
        
        // 创建着色器程序
        const vertexShader = gl.createShader(gl.VERTEX_SHADER)
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
        
        gl.shaderSource(vertexShader, `
          attribute vec4 position;
          void main() {
            gl_Position = position;
          }
        `)
        
        gl.shaderSource(fragmentShader, `
          precision mediump float;
          void main() {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
          }
        `)
        
        gl.compileShader(vertexShader)
        gl.compileShader(fragmentShader)
        
        const program = gl.createProgram()
        gl.attachShader(program, vertexShader)
        gl.attachShader(program, fragmentShader)
        gl.linkProgram(program)
        
        // 创建缓冲区
        const positionBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
        const positions = new Float32Array([
          -1.0, -1.0,
           1.0, -1.0,
          -1.0,  1.0,
           1.0,  1.0
        ])
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
        
        // 设置属性
        const positionAttributeLocation = gl.getAttribLocation(program, 'position')
        gl.enableVertexAttribArray(positionAttributeLocation)
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)
        
        // 使用程序
        gl.useProgram(program)
        
        // 绘制
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        
        const end = performance.now()
        return end - start
      },
      threshold: 50, // ms
      category: 'WebGL'
    },
    {
      name: 'WebRTC性能',
      description: '测试WebRTC功能性能',
      test: async () => {
        if (!navigator.mediaDevices?.getUserMedia) return null
        
        const start = performance.now()
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true })
          stream.getTracks().forEach(track => track.stop())
          const end = performance.now()
          return end - start
        } catch (error) {
          return null
        }
      },
      threshold: 1000, // ms
      category: 'WebRTC'
    },
    {
      name: 'Service Worker注册',
      description: '测试Service Worker注册性能',
      test: async () => {
        if (!navigator.serviceWorker) return null
        
        const start = performance.now()
        try {
          const registration = await navigator.serviceWorker.register('/sw.js')
          await registration.unregister()
          const end = performance.now()
          return end - start
        } catch (error) {
          return null
        }
      },
      threshold: 500, // ms
      category: 'ServiceWorker'
    },
    {
      name: '存储性能',
      description: '测试本地存储性能',
      test: async () => {
        const start = performance.now()
        
        // 测试localStorage
        const testData = Array(1000).fill('test').join('')
        localStorage.setItem('test', testData)
        localStorage.getItem('test')
        
        // 测试sessionStorage
        sessionStorage.setItem('test', testData)
        sessionStorage.getItem('test')
        
        // 测试IndexedDB
        if (window.indexedDB) {
          const request = indexedDB.open('test', 1)
          request.onerror = () => {}
          request.onsuccess = (event) => {
            const db = event.target.result
            db.close()
          }
        }
        
        const end = performance.now()
        return end - start
      },
      threshold: 100, // ms
      category: 'Storage'
    },
    {
      name: '网络性能',
      description: '测试网络API性能',
      test: async () => {
        const start = performance.now()
        
        // 测试Fetch API
        try {
          await fetch('/api/test')
        } catch (error) {}
        
        // 测试WebSocket
        if (window.WebSocket) {
          const ws = new WebSocket('ws://localhost:8080')
          ws.onerror = () => {}
        }
        
        // 测试Beacon API
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/test', new Blob())
        }
        
        const end = performance.now()
        return end - start
      },
      threshold: 200, // ms
      category: 'Network'
    }
  ]
}

// 运行性能测试
const runPerformanceTests = async () => {
  const results = []
  
  for (const testCase of performanceConfig.testCases) {
    try {
      const result = await testCase.test()
      results.push({
        name: testCase.name,
        description: testCase.description,
        category: testCase.category,
        duration: result,
        passed: result === null ? null : result <= testCase.threshold,
        threshold: testCase.threshold
      })
    } catch (error) {
      results.push({
        name: testCase.name,
        description: testCase.description,
        category: testCase.category,
        error: error.message,
        passed: false
      })
    }
  }
  
  return results
}

// 获取测试结果摘要
const getTestSummary = (results) => {
  const summary = {
    total: results.length,
    passed: 0,
    failed: 0,
    skipped: 0,
    averageDuration: 0,
    categories: {}
  }
  
  let totalDuration = 0
  let durationCount = 0
  
  results.forEach(result => {
    if (result.passed === true) {
      summary.passed++
    } else if (result.passed === false) {
      summary.failed++
    } else {
      summary.skipped++
    }
    
    if (result.duration !== undefined) {
      totalDuration += result.duration
      durationCount++
      
      if (!summary.categories[result.category]) {
        summary.categories[result.category] = {
          total: 0,
          passed: 0,
          failed: 0,
          skipped: 0,
          averageDuration: 0
        }
      }
      
      const category = summary.categories[result.category]
      category.total++
      if (result.passed === true) category.passed++
      else if (result.passed === false) category.failed++
      else category.skipped++
    }
  })
  
  summary.averageDuration = durationCount > 0 ? totalDuration / durationCount : 0
  
  // 计算每个类别的平均持续时间
  Object.values(summary.categories).forEach(category => {
    category.averageDuration = category.total > 0 ? 
      totalDuration / category.total : 0
  })
  
  return summary
}

export {
  performanceConfig,
  runPerformanceTests,
  getTestSummary
} 