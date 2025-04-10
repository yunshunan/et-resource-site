/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Declare global variables used in the project
interface Window {
  // Add any global window properties here
}

// Declare modules without types
declare module 'html2pdf.js' {
  const html2pdf: any
  export default html2pdf
}

// Add any other module declarations as needed 