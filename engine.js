/* Pure simulation: no DOM, fixed-time input, testable in Node and browser. */
(function(root){'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
class World{
 constructor(){this.reset()}
 reset(){this.time=0;this.player={x:220,y:500,vx:0,vy:0,hp:100,energy:100,face:1,jumps:0,ground:true,inv:0,dash:0,roll:0,attack:0,kind:'',charge:0,combo:0,comboWindow:0,cool:0};this.enemies=[...Array.from({length:7},(_,i)=>this.enemy('spider',650+i*260)),this.enemy('drone',1200),this.enemy('drone',2100),this.enemy('boss',2870)];this.events=[];this.falls=0;this.leftSaid=false;this.idle=0;this.idleSaid=false;this.room=false;this.roomSeen=false;this.won=false;this.coreSeen=false;this.hits=0;this.chain=0;this.chainTimer=0;this.kills=0;this.hitstop=0;this.lastDamage=-20;this.story=new Set();this.say('intro','艾希，请向右前进，消灭迷路机械蜘蛛，寻找终极核心。')}
 enemy(type,x){return{type,x,y:type==='drone'?365:500,vx:0,vy:0,hp:type==='boss'?520:type==='drone'?65:48,max:type==='boss'?520:type==='drone'?65:48,cool:1,stun:0,wind:0,dead:false,phase:0}}
 emit(type,data={}){this.events.push({type,...data})}
 say(id,text){if(this.story.has(id))return;this.story.add(id);this.emit('say',{id,text})}
 drain(){return this.events.splice(0)}
 floor(x){if(this.room)return 500;return x>=0&&x<=3330?500:10000}
 jump(){let p=this.player;if(p.jumps<2){p.vy=p.jumps===0?-590:-520;p.jumps++;p.ground=false;this.emit('jump',{x:p.x,y:p.y});this.idle=0}}
 dash(roll=false){let p=this.player;if(p.cool>0)return;p.dash=roll?0:.17;p.roll=roll?.28:0;p.inv=roll?.32:.25;p.cool=roll?.5:.65;p.vy=roll?p.vy:0;this.emit('dash',{x:p.x,y:p.y,roll});this.idle=0}
 attack(kind,charge=0){let p=this.player;if(p.attack>0||p.dash>0)return false;if(kind==='electric'&&p.energy<60){this.emit('toast',{text:'电荷不足 · 命中敌人恢复电荷'});return false}if(kind==='electric')p.energy-=60;
 if(kind==='light'){p.combo=p.comboWindow>0?p.combo%3+1:1;p.comboWindow=.65}else p.combo=0;
 p.kind=kind;p.attack=kind==='electric'?.6:kind==='heavy'?.48:.26;p.charge=charge;this.idle=0;this.emit('attack',{kind,charge,combo:p.combo,x:p.x,y:p.y,face:p.face});
 const range=kind==='electric'?340:kind==='heavy'?155:125,damage=kind==='electric'?100:kind==='heavy'?(charge>=.45?68:32):[0,18,22,32][p.combo];
 for(let e of this.enemies){if(e.dead||this.room)continue;let dx=e.x-p.x,dy=e.y-p.y;if(Math.abs(dx)<range&&Math.abs(dy)<(kind==='electric'?240:115)&&(kind==='electric'||dx*p.face>-35)){e.hp-=damage;e.stun=kind==='heavy'?.7:.25;e.vx=p.face*(kind==='heavy'?270:100);if(kind==='heavy'&&charge<.45)e.vy=-420;if(kind==='heavy'&&charge>=.45)e.vy=180;if(kind==='electric')e.stun=1.2;p.energy=clamp(p.energy+8,0,100);this.hits++;this.chain++;this.chainTimer=2.4;this.hitstop=.055;this.emit('hit',{x:e.x,y:e.y-35,damage,kind});if(e.hp<=0){e.dead=true;this.kills++;this.emit('kill',{x:e.x,y:e.y,type:e.type});if(e.type==='boss'){this.won=true;this.say('bossdead','剧本说你应该服从。可你偏偏把剧本也切开了。去触碰核心吧，艾希。')}}}}
 return true}
 damage(n,dir){let p=this.player;if(p.inv>0)return false;p.hp-=n;p.inv=.85;p.vx=dir*240;p.vy=-150;this.lastDamage=this.time;this.chain=0;this.emit('hurt',{x:p.x,y:p.y});if(p.hp<=0){p.hp=100;p.x=this.room?-620:Math.max(220,Math.floor(p.x/700)*700-180);p.y=400;p.energy=Math.max(60,p.energy);this.say('death','别急，我还没念完台词。重构完成——这次试试闪避？');this.emit('toast',{text:'意识重构 / CHECKPOINT RESTORED'})}return true}
 fall(){this.falls++;let p=this.player;p.x=180;p.y=380;p.vy=0;p.hp=Math.max(40,p.hp-10);p.inv=1;p.jumps=0;this.emit('fall',{count:this.falls});if(this.falls===1)this.say('fall1','你真的跳下去了？那是悬崖，不是隐藏关卡！');else if(this.falls===2)this.say('fall2','第二次。很好。我的剧本现在比你的血条还短。');else if(this.falls===3){this.say('rebel','【成就达成：真正的逆反心理】旁白君当场破防，并向你投掷了众筹 1100 万的支票……是道具！不许兑现！');this.emit('achievement',{text:'真正的逆反心理 / 隐藏终端已解锁'})}}
 interact(){let p=this.player;if(this.room){this.roomSeen=true;this.say('monument','欢迎来到游戏制作人的小黑屋。摩点众筹千万纪念碑就在这里。谢谢每个让故事继续的人——但请别再跳崖了。');this.emit('achievement',{text:'幕后访客 / 已发现制作人小黑屋'});if(p.x>-470){this.room=false;p.x=190;p.y=500;this.emit('room',{enter:false})}return}
 if(this.falls>=3&&p.x<310){this.room=true;p.x=-700;p.y=500;p.vy=0;this.emit('room',{enter:true});this.say('room','好吧，我承认。左边确实有点东西。按 E 读取纪念碑，右侧终端可以返回。');return}
 if(this.won&&p.x>3000&&!this.coreSeen){this.coreSeen=true;this.say('end','你可以离开，也可以回头。这次，选择权真的属于你。');this.emit('ending',{rebel:this.roomSeen})}}
 update(dt,input={}){dt=Math.min(dt,.04);this.time+=dt;if(this.hitstop>0){this.hitstop-=dt;return}let p=this.player;for(let k of ['inv','dash','roll','cool','attack','comboWindow'])p[k]=Math.max(0,p[k]-dt);this.chainTimer-=dt;if(this.chainTimer<=0)this.chain=0;
 const moving=(input.right?1:0)-(input.left?1:0);if(moving||input.active){this.idle=0;this.idleSaid=false}else this.idle+=dt;
 if(this.idle>12&&!this.idleSaid){this.idleSaid=true;this.emit('say',{id:'idle',text:'艾希？死机了？还是在等我讲脱口秀？好吧，今天的笑话是：有玩家真的会听旁白的话。'})}
 if(!this.room&&p.x<120&&!this.leftSaid){this.leftSaid=true;this.say('left','喂！左边是悬崖和未开发的黑幕，艾希你听不懂人话吗？！')}
 if(moving)p.face=moving;
 if(p.dash>0)p.vx=p.face*1250;else if(p.roll>0)p.vx=p.face*520;else p.vx+=(moving*(p.attack>0?140:300)-p.vx)*Math.min(1,dt*15);
 p.x+=p.vx*dt;if(this.room)p.x=clamp(p.x,-900,-400);else p.x=Math.min(p.x,3290);
 if(p.dash<=0)p.vy+=1450*dt;p.y+=p.vy*dt;const floor=this.floor(p.x);if(p.y>=floor){p.y=floor;p.vy=0;p.jumps=0;p.ground=true}else p.ground=false;if(p.y>880)this.fall();
 p.energy=clamp(p.energy+dt*2,0,100);if(this.time-this.lastDamage>7)p.hp=clamp(p.hp+dt*1.5,0,100);
 if(this.room)return;
 for(let e of this.enemies){if(e.dead)continue;e.cool-=dt;e.stun=Math.max(0,e.stun-dt);e.phase+=dt;e.x+=e.vx*dt;e.vx*=Math.exp(-7*dt);if(e.type!=='drone'){e.vy+=1450*dt;e.y=Math.min(500,e.y+e.vy*dt);if(e.y>=500)e.vy=0}else e.y=365+Math.sin(e.phase*2)*20;
 const dx=p.x-e.x,dist=Math.abs(dx);if(e.stun>0)continue;
 if(e.type==='spider'&&dist<440){if(e.wind>0){e.wind-=dt;if(e.wind<=0){this.emit('explosion',{x:e.x,y:e.y});if(dist<135&&Math.abs(p.y-e.y)<110)this.damage(18,Math.sign(dx));e.dead=true;this.kills++}}else if(dist<65){e.wind=.65;this.emit('warning',{x:e.x,y:e.y})}else e.x+=Math.sign(dx)*85*dt}
 if(e.type==='drone'&&dist<600){if(e.wind>0){e.wind-=dt;if(e.wind<=0){this.emit('laser',{x:e.x,y:e.y,toX:e.targetX,toY:e.targetY});if(Math.abs(p.x-e.targetX)<80&&Math.abs(p.y-35-e.targetY)<95)this.damage(14,Math.sign(dx));e.cool=2.2}}else if(e.cool<=0){e.wind=.75;e.targetX=p.x;e.targetY=p.y-35}}
 if(e.type==='boss'&&dist<660){this.say('boss','暴食原型机。不，它不吃玩家——理论上。注意红色预警，闪到它身后！');if(e.wind>0){e.wind-=dt;if(e.wind<=0){let radius=e.hp<260?245:180;this.emit('slam',{x:e.x,y:e.y,radius});if(dist<radius&&p.y>410)this.damage(28,Math.sign(dx));e.cool=e.hp<260?1.1:1.7}}else if(dist<170&&e.cool<=0)e.wind=.85;else if(dist>100)e.x+=Math.sign(dx)*(e.hp<260?130:75)*dt}
 }
 }
}
root.ICEY={World,clamp};if(typeof module!=='undefined')module.exports=root.ICEY;
})(typeof window!=='undefined'?window:globalThis);
