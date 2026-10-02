"""Run: python validate-browser.py (requires Playwright + Chromium, dev only)."""
import contextlib, functools, http.server, json, pathlib, threading
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parent
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
errors=[];checks=[]
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1440,'height':900})
  page.on('pageerror',lambda e: errors.append(str(e)))
  page.on('console',lambda m: errors.append(m.text) if m.type=='error' else None)
  page.goto(f'http://127.0.0.1:{server.server_port}/');page.wait_for_timeout(800)
  assert page.locator('#menu').is_visible();checks.append('desktop title / local assets')
  page.screenshot(path=str(ROOT/'preview-title.png'))
  page.click('#start');page.wait_for_timeout(100)
  assert page.locator('.status').is_visible()
  x=page.evaluate('iceyDebug.world.player.x');page.keyboard.down('d');page.wait_for_timeout(350);page.keyboard.up('d')
  assert page.evaluate('iceyDebug.world.player.x')>x+30
  page.keyboard.press('Space');page.wait_for_timeout(40);page.keyboard.press('Space');page.wait_for_timeout(40)
  assert page.evaluate('iceyDebug.world.player.jumps')==2
  page.keyboard.press('Shift');page.keyboard.press('j');page.wait_for_timeout(400)
  page.keyboard.down('k');page.wait_for_timeout(600);page.keyboard.up('k');page.wait_for_timeout(30)
  assert page.evaluate('iceyDebug.world.player.kind')=='heavy'
  page.wait_for_timeout(700);page.keyboard.press('l');page.wait_for_timeout(40)
  assert page.evaluate('iceyDebug.world.player.kind')=='electric'
  checks.append('real keyboard / double jump / dash / heavy hold / finisher / Web Audio')
  page.keyboard.press('Escape');assert page.locator('#pauseMenu').is_visible()
  page.click('#pauseHelp');assert page.locator('#helpModal').is_visible();page.click('#closeHelp');page.click('#resume')
  assert not page.evaluate('iceyDebug.state.paused');checks.append('pause / manual / resume')
  page.evaluate('iceyDebug.world.player.x=1650;iceyDebug.world.player.y=500;iceyDebug.world.player.vy=0')
  page.wait_for_timeout(900);page.screenshot(path=str(ROOT/'preview-combat.png'))
  page.evaluate('iceyDebug.world.fall();iceyDebug.world.fall();iceyDebug.world.fall();iceyDebug.world.interact();iceyDebug.process()')
  page.wait_for_timeout(300);assert page.evaluate('iceyDebug.world.room');page.keyboard.press('e')
  assert page.evaluate('iceyDebug.world.roomSeen');page.screenshot(path=str(ROOT/'preview-secret.png'))
  checks.append('secret achievement / room interaction')
  page.evaluate('iceyDebug.world.room=false;iceyDebug.world.won=true;iceyDebug.world.player.x=3150;iceyDebug.world.interact();iceyDebug.process()')
  assert page.locator('#ending').is_visible();page.click('#explore');assert not page.evaluate('iceyDebug.state.paused');checks.append('ending / continue exploration')
  page.click('#pause');page.click('#restart');assert page.evaluate('iceyDebug.world.falls')==0
  page.click('#sound');assert page.locator('#sound').inner_text()=='音效 OFF'
  checks.append('restart / sound toggle')
  for viewport in [{'width':390,'height':844},{'width':844,'height':390}]:
   mobile=browser.new_context(viewport=viewport,is_mobile=True,has_touch=True,device_scale_factor=2)
   mp=mobile.new_page();mp.on('pageerror',lambda e: errors.append(str(e)))
   mp.goto(f'http://127.0.0.1:{server.server_port}/');mp.tap('#start');mp.wait_for_timeout(100)
   assert mp.locator('#touch').is_visible()
   button=mp.locator('[data-key="j"]');button.tap();mp.wait_for_timeout(30)
   assert mp.evaluate('iceyDebug.world.player.kind')=='light'
   mp.locator('[data-key=" "]').tap();mp.wait_for_timeout(30)
   assert mp.evaluate('iceyDebug.world.player.jumps')==1
   mp.screenshot(path=str(ROOT/f'preview-mobile-{viewport["width"]}.png'))
   assert mp.evaluate('document.documentElement.scrollWidth')==viewport['width']
   mobile.close()
  checks.append('portrait + landscape mobile / touch attacks + jumps / no overflow')
  assert not errors, errors
  browser.close()
finally:
 server.shutdown()
report={'status':'passed' if not errors else 'failed','browser':'Chromium / Playwright','checks':checks,'errors':errors}
(ROOT/'validation-browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps(report,ensure_ascii=False,indent=2))
