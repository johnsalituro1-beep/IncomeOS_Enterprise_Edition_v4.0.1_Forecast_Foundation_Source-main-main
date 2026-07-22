import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const required = ['dist/index.html', 'dist/favicon.png', 'dist/logo-panel.png']
const missing = required.filter(file => !existsSync(resolve(file)))
if (missing.length) {
  console.error(`Build verification failed. Missing: ${missing.join(', ')}`)
  process.exit(1)
}
const html = readFileSync(resolve('dist/index.html'), 'utf8')
if (!html.includes('/assets/')) {
  console.error('Build verification failed. Bundled assets were not referenced by index.html.')
  process.exit(1)
}
console.log(`Build verification passed (${required.length} required artifacts).`)
