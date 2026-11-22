import os
#!/usr/bin/env python3
"""Baut index.html aus src/: App-Vorlage + Hanzi-Writer + Wortdaten, plus PWA-Kopfzeilen."""
from pathlib import Path
R = Path(__file__).parent
s = (R/'src/app.html').read_text()
lib = (R/'src/hanzi-writer.min.js').read_text().replace('</script', '<\\/script')
data = (R/'src/data.js').read_text()
audio = (R/'src/audio.js').read_text()
s = s.replace('/*LIB*/', lib).replace('/*DATA*/', data).replace('/*AUDIO*/', audio).replace('/*BOOK*/', open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'src','book.js'),encoding='utf8').read()).replace('/*SENT*/', open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'src','sentences.js'),encoding='utf8').read())
s = s.replace('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">',
 '''<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="icon" type="image/png" href="icon-192.png">
<meta name="apple-mobile-web-app-title" content="Hanzi">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="theme-color" content="#f5efe3">''', 1)
s = s.replace('.app{height:100%;display:flex;flex-direction:column;max-width:1400px;margin:0 auto;padding:14px 20px 18px}',
 '.app{height:100%;display:flex;flex-direction:column;max-width:1400px;margin:0 auto;padding:calc(14px + env(safe-area-inset-top)) calc(20px + env(safe-area-inset-right)) calc(18px + env(safe-area-inset-bottom)) calc(20px + env(safe-area-inset-left))}', 1)
s = s.replace('</body>', '''<script>
if('serviceWorker' in navigator){ window.addEventListener('load',()=>{ navigator.serviceWorker.register('sw.js').catch(()=>{}); }); }
</script>
</body>''', 1)
(R/'index.html').write_text(s)
print('index.html gebaut:', len(s), 'Zeichen')
