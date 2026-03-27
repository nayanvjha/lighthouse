const fs = require('fs')

const filePath = 'src/styles/hud.css'
let content = fs.readFileSync(filePath, 'utf8')

const replacements = [
  ['rgba(0, 163, 255', 'rgba(212, 165, 116'],
  ['rgba(57, 255, 20', 'rgba(167, 139, 250'],
  ['rgba(255, 215, 0', 'rgba(212, 165, 116'],
  ['#00A3FF', '#D4A574'],
  ['#0089d6', '#b8956a'],
  ['#005d96', '#967a58'],
  ['#39FF14', '#A78BFA'],
  ['#39ff14', '#A78BFA'],
  ['#FFD700', '#D4A574'],
  ['#b2dbff', '#e8d5c4'],
  ['#040410', '#1C1917'],
  ['#071222', '#2a2420'],
  ['rgba(5, 5, 16', 'rgba(28, 25, 23'],
  ['rgba(3, 3, 10', 'rgba(23, 20, 18'],
  ['rgba(4, 7, 19', 'rgba(26, 22, 20'],
  ['rgba(2, 4, 12', 'rgba(20, 18, 16'],
  ['rgba(8, 14, 30', 'rgba(30, 26, 24'],
  ['rgba(8, 14, 31', 'rgba(30, 26, 24'],
  ['rgba(4, 7, 16', 'rgba(26, 22, 20'],
  ['rgba(7, 12, 24', 'rgba(28, 24, 22'],
  ['rgba(7, 16, 29', 'rgba(28, 24, 22'],
  ['rgba(8, 16, 10', 'rgba(30, 26, 24'],
  ['rgba(7, 18, 10', 'rgba(28, 24, 22'],
  ['rgba(8, 23, 12', 'rgba(30, 26, 24'],
  ['rgba(8, 24, 11', 'rgba(30, 26, 24'],
  ['rgba(10, 12, 32', 'rgba(28, 25, 23'],
  ['rgba(12, 8, 14', 'rgba(30, 26, 24'],
  ['rgba(57, 255, 20', 'rgba(167, 139, 250'],
  ['rgba(196, 255, 182', 'rgba(210, 195, 255'],
  ['rgba(191, 255, 180', 'rgba(210, 195, 255'],
  ['rgba(207, 255, 194', 'rgba(210, 195, 255'],
  ['rgba(210, 255, 194', 'rgba(210, 195, 255'],
  ['rgba(226, 241, 255', 'rgba(250, 240, 230'],
  ['rgba(220, 236, 255', 'rgba(250, 240, 230'],
  ['rgba(208, 220, 233', 'rgba(235, 225, 215'],
  ['rgba(230, 238, 247', 'rgba(245, 235, 225'],
  ['rgba(201, 236, 255', 'rgba(245, 230, 215'],
  ['rgba(9, 173, 255', 'rgba(212, 165, 116'],
]

for (const [find, replace] of replacements) {
  content = content.split(find).join(replace)
}

fs.writeFileSync(filePath, content)
console.log('hud.css replacements applied')
