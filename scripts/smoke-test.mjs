import fs from 'node:fs'
import path from 'node:path'
const base=path.resolve('dist')
const required=['index.html','favicon.png','logo-panel.png']
for(const file of required){if(!fs.existsSync(path.join(base,file))) throw new Error(`Missing smoke-test artifact: ${file}`)}
const html=fs.readFileSync(path.join(base,'index.html'),'utf8')
if(!html.includes('assets/')) throw new Error('Compiled asset references missing from index.html')
const assets=fs.readdirSync(path.join(base,'assets'))
if(!assets.some(f=>f.endsWith('.js'))) throw new Error('No compiled JavaScript bundle found')
console.log(`Smoke test passed: ${required.length} core artifacts and ${assets.length} compiled assets verified.`)
