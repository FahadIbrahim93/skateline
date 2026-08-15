import * as THREE from "three";
const C={g:26,maxS:22,push:18,fric:0.11,carve:0.45,ollie:12.5,turn:2.8,camD:8,camH:3.4,camLag:0.0012};
const S={pos:new THREE.Vector3(0,1.4,0),vel:new THREE.Vector3(0,0,-3),yaw:0,onG:false,prevG:false,grind:false,score:0,combo:0,comboT:0,alive:true,started:false,paused:false,keys:{},lean:0,flow:0.55,airT:0,spin:0,grab:false,shake:0,touchOllie:false,touchPush:false,touchGrab:false,touchCrouch:false};
let scene,camera,renderer,player,rails=[],ledges=[];
const F=new THREE.Vector3(),_t=new THREE.Vector3();
function M(c,r=0.85,m=0.05){return new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m})}
function box(w,h,d,mat,x,y,z,rx=0,ry=0,rz=0,sh=true){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof mat==="number"?M(mat):mat);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);if(sh){o.castShadow=true;o.receiveShadow=true}scene.add(o);return o}
function cyl(r,h,mat,x,y,z,rx=0,ry=0,rz=0){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,8),typeof mat==="number"?M(mat,0.4,0.55):mat);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.castShadow=true;scene.add(o);return o}
function addRail(x,z,len,ry,y=0.55){const geo=new THREE.CylinderGeometry(0.055,0.055,len,8);geo.rotateZ(Math.PI/2);const m=new THREE.Mesh(geo,M(0xd8d8e0,0.2,0.85));m.position.set(x,y,z);m.rotation.y=ry;m.castShadow=true;scene.add(m);const hx=Math.sin(ry)*len/2,hz=Math.cos(ry)*len/2;cyl(0.035,y,0x9a9aa2,x-hx*0.85,y/2,z-hz*0.85);cyl(0.035,y,0x9a9aa2,x+hx*0.85,y/2,z+hz*0.85);rails.push({x1:x-hx,z1:z-hz,x2:x+hx,z2:z+hz,y})}
function addLedge(x,z,w,d,h){box(w,h,d,0x7a7a88,x,h/2,z);box(w+0.08,0.06,0.12,0x9a9aa8,x,h+0.02,z+d/2);box(w+0.08,0.06,0.12,0x9a9aa8,x,h+0.02,z-d/2);ledges.push({y:h,minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
function buildWorld(){
const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),M(0x22222c,0.95));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
box(44,0.05,44,0x363642,0,0.025,0);box(20,0.07,20,0x464654,0,0.06,0);box(8,0.08,8,0x525260,0,0.09,0);
box(5,0.04,70,0x30303a,0,0.02,0);box(70,0.04,5,0x30303a,0,0.02,0);
for(let i=-10;i<=10;i+=2.4){box(1.2,0.015,0.35,0xd0d0d8,i,0.11,11);box(1.2,0.015,0.35,0xd0d0d8,i,0.11,-11);box(0.35,0.015,1.2,0xd0d0d8,11,0.11,i);box(0.35,0.015,1.2,0xd0d0d8,-11,0.11,i)}
[[6,6],[-7,-5],[8,-8],[-5,9]].forEach(([x,z])=>{cyl(0.45,0.04,0x3a3a44,x,0.12,z);cyl(0.35,0.03,0x2a2a34,x,0.14,z)});
[[3,0.02,12,4,-2],[0.02,8,-6,5],[10,0.02,0.8,-3,8]].forEach(([w,d,x,z])=>box(w,0.01,d,0x1a1a22,x,0.105,z));
const bCols=[0x4a4a58,0x565664,0x606070,0x444450,0x525260,0x3e3e4a,0x585868];
const blds=[[-28,-28,16,24,14],[-28,2,13,18,12],[-28,28,14,20,13],[0,-34,24,14,12],[0,34,22,16,12],[28,-26,15,26,13],[28,4,12,20,12],[28,30,16,18,12],[-38,12,11,16,18],[38,-10,11,17,16],[-16,-36,10,10,9],[16,-36,11,11,9],[-14,36,9,9,8],[14,36,10,10,8],[-40,-16,9,14,11],[40,18,10,15,12],[-20,0,8,12,8],[20,0,8,11,8]];
blds.forEach(([x,z,w,h,d],i)=>{box(w,h,d,bCols[i%7],x,h/2,z);box(w+0.4,0.3,d+0.4,0x2a2a34,x,h+0.12,z);const rows=Math.max(2,Math.floor(h/2.4)),cols=Math.max(2,Math.floor(w/2.6));for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const wx=x-w/2+1.4+c*((w-2.8)/Math.max(1,cols-1)),wy=1.6+r*2.2;box(0.7,0.9,0.06,0x1a2230,wx,wy,z+d/2+0.04,0,0,0,false);box(0.7,0.9,0.06,0x1a2230,wx,wy,z-d/2-0.04,0,0,0,false)}box(1.1,2.2,0.08,0x2a1a10,x,1.1,z+d/2+0.05,0,0,0,false);box(w*0.55,0.08,1.2,0x8a3030,x,2.6,z+d/2+0.6);box(1.2,0.7,0.9,0x5a5a66,x+w*0.25,h+0.55,z);box(0.9,0.5,0.7,0x5a5a66,x-w*0.2,h+0.45,z+d*0.15)});
[[0,12,15,0],[0,-13,13,0],[14,0,12,Math.PI/2],[-14,0,13,Math.PI/2],[10,10,10,-0.4],[-10,-10,11,0.35],[11,-11,9,0.6],[-12,11,10,-0.55],[19,7,8,Math.PI/2],[-19,-6,9,Math.PI/2],[7,19,8,0],[-6,-20,9,0],[5,5,6,0.25],[-5,-5,6,-0.3]].forEach(a=>addRail(...a));
[[8,-10,10,1.6,0.55],[-9,8,1.6,9,0.55],[4,18,12,1.7,0.58],[-16,-8,8,1.5,0.52],[13,13,7,1.4,0.5],[-11,-17,9,1.5,0.52],[17,-5,1.4,7,0.52],[-18,5,1.5,6,0.5],[0,8,6,1.2,0.45]].forEach(a=>addLedge(...a));
for(let i=0;i<7;i++){box(5.5,0.16,0.9,0x6a6a78,19,0.08+i*0.16,-12-i*0.42);box(5.5,0.16,0.9,0x6a6a78,-19,0.08+i*0.16,12+i*0.42)}
box(7,0.5,10,0x4a4a56,15,0.6,-10,-0.42,0,0);box(7,0.5,10,0x4a4a56,-15,0.6,10,0.42,0,0);box(10,0.4,6,0x4a4a56,0,0.45,22,0.38,0,0);
box(4.5,1.1,2.6,0x5a5a66,-11,0.05,0);box(4.7,0.12,2.8,0x3a3a46,-11,0.65,0);box(3.8,0.9,2.2,0x5a5a66,12,0.05,4);box(4,0.12,2.4,0x3a3a46,12,0.55,4);
box(3,0.5,3,0x5a5a66,0,0.25,-6);box(2,0.35,2,0x5a5a66,0,0.67,-6);box(1.2,0.25,1.2,0x5a5a66,0,0.97,-6);
box(16,0.7,1.3,0x707080,0,0.35,15);ledges.push({y:0.7,minX:-8,maxX:8,minZ:14.35,maxZ:15.65});
box(3,0.35,1.5,0x6a6a74,6,0.17,-4);box(3,0.35,1.5,0x6a6a74,-6,0.17,4);
[[-6,7],[6,7],[-6,-7],[6,-7],[0,9],[0,-9],[9,0],[-9,0]].forEach(([x,z])=>{box(2.5,0.1,0.55,0x8B6914,x,0.45,z);box(0.12,0.45,0.5,0x5a4030,x-1.05,0.22,z);box(0.12,0.45,0.5,0x5a4030,x+1.05,0.22,z)});
[[9,9],[-9,-9],[10,-6],[-10,6],[16,2],[-16,-2],[4,14],[-4,-14]].forEach(([x,z],i)=>{cyl(0.28,0.7,i%2?0x2a4a2a:0x333338,x,0.35,z);cyl(0.3,0.08,0x222226,x,0.72,z)});
[[11,4],[-11,-4],[4,11],[-4,-11]].forEach(([x,z])=>{cyl(0.18,0.55,0xb03030,x,0.27,z);cyl(0.22,0.12,0x902020,x,0.55,z);box(0.4,0.1,0.12,0xb03030,x,0.35,z)});
for(let i=-3;i<=3;i++){cyl(0.12,0.7,0xc8a020,i*1.4,0.35,13.5);cyl(0.12,0.7,0xc8a020,i*1.4,0.35,-13.5)}
[[24,0],[-24,0],[0,26],[0,-26],[18,18],[-18,-18],[18,-18],[-18,18]].forEach(([x,z])=>{cyl(0.09,3.4,0x3a3a42,x,1.7,z);cyl(0.22,0.18,0x2a2a30,x,3.45,z);const light=new THREE.PointLight(0xffe8c0,0.4,20);light.position.set(x,3.3,z);scene.add(light)});
[[-30,16],[30,-16],[-18,32],[18,-32],[32,20],[-32,-20],[22,28],[-22,-28]].forEach(([x,z])=>{cyl(0.18,2.6,0x4a3020,x,1.3,z);const c=new THREE.Mesh(new THREE.SphereGeometry(1.5,7,5),M(0x2a5a2a,0.9));c.position.set(x,3.1,z);c.castShadow=true;scene.add(c)});
[[14,-22],[-14,22],[22,14],[-22,-14],[8,-18],[-8,18]].forEach(([x,z])=>{box(2,0.6,0.8,0x5a5040,x,0.3,z);box(1.7,0.25,0.6,0x2d5a2d,x,0.7,z)});
[[-22,22,0],[22,-22,Math.PI/2]].forEach(([x,z,ry])=>{for(let i=0;i<8;i++){cyl(0.04,1.4,0x6a6a72,x+Math.cos(ry)*i*0.9,0.7,z+Math.sin(ry)*i*0.9)}});
box(4,0.1,1.5,0x3a3a48,22,2.4,6);box(0.12,2.4,0.12,0x4a4a56,20.2,1.2,6);box(0.12,2.4,0.12,0x4a4a56,23.8,1.2,6);box(3.5,1.2,0.08,0x1a2a3a,22,1.5,5.6);
box(1.8,1.6,1.2,0x6a4030,-22,0.8,-6);box(1.9,0.1,1.3,0x4a3020,-22,1.65,-6);
[[10,16],[-10,-16]].forEach(([x,z])=>{cyl(0.06,2.8,0x3a3a42,x,1.4,z);box(1.2,0.7,0.08,0x2a4a8a,x,2.6,z)});
}
function buildPlayer(){
player=new THREE.Group();
const skin=M(0xe85d04,0.45,0.08),dark=M(0x1a1a1a,0.35,0.2);
const body=new THREE.Mesh(new THREE.CapsuleGeometry(0.24,0.55,5,10),skin);body.position.y=1.05;body.castShadow=true;player.add(body);
[[-0.12,0.45],[0.12,0.45]].forEach(([x,y])=>{const l=new THREE.Mesh(new THREE.CapsuleGeometry(0.09,0.35,3,6),dark);l.position.set(x,y,0);l.castShadow=true;player.add(l)});
[[-0.32,1.1,0.3],[0.32,1.1,-0.3]].forEach(([x,y,rz])=>{const a=new THREE.Mesh(new THREE.CapsuleGeometry(0.07,0.28,3,6),skin);a.position.set(x,y,0);a.rotation.z=rz;player.add(a)});
const head=new THREE.Mesh(new THREE.SphereGeometry(0.17,10,8),skin);head.position.y=1.52;player.add(head);
const hel=new THREE.Mesh(new THREE.SphereGeometry(0.19,12,8),dark);hel.position.y=1.55;hel.scale.set(1,0.85,1);hel.castShadow=true;player.add(hel);
const visor=new THREE.Mesh(new THREE.SphereGeometry(0.11,8,6),M(0xffb040,0.12,0.55));visor.material.emissive=new THREE.Color(0x442200);visor.material.emissiveIntensity=0.3;visor.position.set(0,1.52,0.12);player.add(visor);
const brd=new THREE.Mesh(new THREE.BoxGeometry(0.28,0.05,1.15),M(0x1c1c1c,0.3,0.4));brd.position.y=0.12;brd.castShadow=true;player.add(brd);
const truckM=M(0x9a9aa2,0.3,0.7),wheelM=M(0x222226,0.5);
[-0.4,0.4].forEach(z=>{const t=new THREE.Mesh(new THREE.BoxGeometry(0.32,0.04,0.1),truckM);t.position.set(0,0.08,z);player.add(t);[-0.16,0.16].forEach(x=>{const w=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.05,8),wheelM);w.rotation.z=Math.PI/2;w.position.set(x,0.06,z);player.add(w)})});
scene.add(player);player.visible=false;
}
function init(){
scene=new THREE.Scene();scene.background=new THREE.Color(0x5a8ab8);scene.fog=new THREE.Fog(0x5a8ab8,48,125);
camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,0.1,220);
renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xc8e0ff,0x3a4a3a,0.55));
const sun=new THREE.DirectionalLight(0xfff0d8,1.45);sun.position.set(50,65,35);sun.castShadow=true;
sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.near=5;sun.shadow.camera.far=160;
sun.shadow.camera.left=sun.shadow.camera.bottom=-55;sun.shadow.camera.right=sun.shadow.camera.top=55;sun.shadow.bias=-0.0004;scene.add(sun);
buildWorld();buildPlayer();
window.addEventListener("keydown",e=>{S.keys[e.code]=true;if(e.code==="KeyR"&&S.started&&!S.alive)respawn();if((e.code==="KeyP"||e.code==="Escape")&&S.started)togglePause()});
window.addEventListener("keyup",e=>{S.keys[e.code]=false});
const zone=document.getElementById("lean-zone");
if(zone){let tid=null;zone.addEventListener("touchstart",e=>{e.preventDefault();tid=e.changedTouches[0].identifier;S.lean=(e.changedTouches[0].clientX/(innerWidth*0.65)-0.5)*2},{passive:false});zone.addEventListener("touchmove",e=>{e.preventDefault();for(const t of e.changedTouches)if(t.identifier===tid)S.lean=(t.clientX/(innerWidth*0.65)-0.5)*2},{passive:false});zone.addEventListener("touchend",()=>{tid=null;S.lean=0})}
const bind=(id,prop)=>{const el=document.getElementById(id);if(!el)return;const down=e=>{e.preventDefault();S[prop]=true;el.classList.add("active")};const up=e=>{e.preventDefault();S[prop]=false;el.classList.remove("active")};el.addEventListener("touchstart",down,{passive:false});el.addEventListener("touchend",up,{passive:false});el.addEventListener("mousedown",down);el.addEventListener("mouseup",up);el.addEventListener("mouseleave",up)};
bind("btn-ollie","touchOllie");bind("btn-push","touchPush");bind("btn-grab","touchGrab");bind("btn-crouch","touchCrouch");
document.getElementById("btn-restart")?.addEventListener("click",()=>{if(S.started&&!S.alive)respawn()});
document.getElementById("drop-in-btn")?.addEventListener("click",start);
document.getElementById("pause-btn")?.addEventListener("click",togglePause);
document.getElementById("resume-btn")?.addEventListener("click",()=>{S.paused=false;document.getElementById("pause-screen").style.display="none"});
document.getElementById("restart-run-btn")?.addEventListener("click",()=>{S.paused=false;document.getElementById("pause-screen").style.display="none";begin()});
window.addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
requestAnimationFrame(loop);
}
function start(){document.getElementById("start-screen").style.display="none";document.body.classList.add("game-live");begin();S.started=true}
function begin(){S.score=0;S.combo=0;S.flow=0.55;S.alive=true;respawn()}
function respawn(){S.pos.set(0,1.6,2);S.vel.set(0,0,-4);S.yaw=0;S.alive=true;S.grind=false;S.shake=0;S.airT=0;S.spin=0;player.visible=true;document.body.classList.remove("wiped");const m=document.getElementById("message");if(m)m.classList.remove("visible")}
function togglePause(){if(!S.started)return;S.paused=!S.paused;document.getElementById("pause-screen").style.display=S.paused?"flex":"none"}
function getLean(){const k=(S.keys["KeyA"]||S.keys["ArrowLeft"]?1:0)-(S.keys["KeyD"]||S.keys["ArrowRight"]?1:0);return k!==0?k:-S.lean}
function isPush(){return !!(S.keys["KeyW"]||S.keys["ArrowUp"]||S.touchPush)}
function isOllie(){return !!(S.keys["Space"]||S.touchOllie)}
function isGrab(){return !!(S.keys["ShiftLeft"]||S.keys["ShiftRight"]||S.touchGrab)}
function isCrouch(){return !!(S.keys["ControlLeft"]||S.keys["KeyC"]||S.touchCrouch)}
function checkRail(){for(const r of rails){const dx=r.x2-r.x1,dz=r.z2-r.z1,l2=dx*dx+dz*dz||1;let t=((S.pos.x-r.x1)*dx+(S.pos.z-r.z1)*dz)/l2;t=Math.max(0,Math.min(1,t));const px=r.x1+t*dx,pz=r.z1+t*dz;if(Math.hypot(S.pos.x-px,S.pos.z-pz)<0.65&&Math.abs(S.pos.y-r.y)<0.85)return{x:px,y:r.y,z:pz}}for(const l of ledges){if(S.pos.x>l.minX-0.35&&S.pos.x<l.maxX+0.35&&S.pos.z>l.minZ-0.35&&S.pos.z<l.maxZ+0.35&&Math.abs(S.pos.y-l.y)<0.75)return{x:S.pos.x,y:l.y,z:S.pos.z}}return null}
function phys(dt){if(!S.alive)return;const L=getLean();const spd=S.vel.length();const tr=THREE.MathUtils.clamp(C.turn-spd*0.035,1.15,C.turn);S.yaw+=L*tr*dt;F.set(Math.sin(S.yaw),0,-Math.cos(S.yaw));const gy=0,ha=S.pos.y-gy;S.onG=ha<0.38&&S.vel.y<=0.55&&!S.grind;const rail=checkRail();if(rail&&spd>2.8&&ha<0.95){if(!S.grind){S.grind=true;S.combo=Math.min(6,S.combo+1);S.comboT=2.8}S.pos.y=rail.y+0.22;S.vel.y=0;S.vel.x*=0.985;S.vel.z*=0.985;S.vel.addScaledVector(F,3.2*dt);S.score+=spd*dt*2.4*(1+S.combo*0.15);S.flow=Math.min(1,S.flow+0.12*dt)}else if(S.grind)S.grind=false;if(S.onG&&!S.grind){if(!S.prevG&&S.airT>0.25){if(S.vel.y<-14){wipe();return}let pts=0;if(Math.abs(S.spin)>1.2)pts+=Math.round(Math.abs(S.spin)*40);if(S.grab)pts+=80;if(S.airT>0.85)pts+=Math.round(S.airT*45);if(pts>0){S.combo=Math.min(6,S.combo+1);S.comboT=3;S.score+=Math.round(pts*(1+(S.combo-1)*0.28));S.flow=Math.min(1,S.flow+0.07)}}S.airT=0;S.spin=0;S.grab=false;S.pos.y=gy+0.18;S.vel.y=Math.max(0,S.vel.y);if(isPush())S.vel.addScaledVector(F,C.push*dt);if(isCrouch())S.vel.multiplyScalar(0.988);const fr=Math.abs(L)>0.18?C.carve:C.fric;S.vel.x-=S.vel.x*fr*dt*3.8;S.vel.z-=S.vel.z*fr*dt*3.8;if(isOllie()){S.vel.y=C.ollie;S.onG=false;S.flow=Math.min(1,S.flow+0.05)}if(Math.abs(L)>0.15&&spd>6)S.flow=Math.min(1,S.flow+0.09*dt);else if(spd<3.5)S.flow=Math.max(0,S.flow-0.14*dt)}else if(!S.grind){if(S.prevG){S.airT=0;S.spin=0;S.grab=false}S.airT+=dt;S.spin+=L*tr*dt;if(isGrab())S.grab=true;S.vel.y-=C.g*dt;S.vel.x*=0.997;S.vel.z*=0.997}S.prevG=S.onG;if(spd>C.maxS)S.vel.multiplyScalar(C.maxS/spd);S.pos.addScaledVector(S.vel,dt);S.score+=spd*dt*0.55;if(S.comboT>0){S.comboT-=dt;if(S.comboT<=0)S.combo=0}if(S.pos.y<-3||Math.abs(S.pos.x)>80||Math.abs(S.pos.z)>80)wipe();player.position.copy(S.pos);player.rotation.y=S.yaw;player.rotation.z=-L*0.4;player.rotation.x=S.onG||S.grind?0:THREE.MathUtils.clamp(-S.vel.y*0.02,-0.4,0.32)}
function wipe(){if(!S.alive)return;S.alive=false;S.vel.set(0,0,0);S.combo=0;S.shake=1.2;document.body.classList.add("wiped");const m=document.getElementById("message");if(m){m.textContent="WIPEOUT";m.classList.add("visible")}}
function cam(dt){_t.set(S.pos.x+Math.sin(S.yaw)*C.camD,S.pos.y+C.camH,S.pos.z+Math.cos(S.yaw)*C.camD);camera.position.lerp(_t,1-Math.pow(C.camLag,dt));if(S.shake>0){camera.position.x+=(Math.random()-0.5)*S.shake*0.9;camera.position.y+=(Math.random()-0.5)*S.shake*0.5;S.shake=Math.max(0,S.shake-6*dt)}camera.lookAt(S.pos.x,S.pos.y+1.1,S.pos.z);const sr=Math.min(S.vel.length()/C.maxS,1);camera.fov=58+sr*7;camera.updateProjectionMatrix()}
function ui(){const sc=document.getElementById("score");if(sc)sc.textContent=Math.floor(S.score);const sp=document.getElementById("speed");if(sp)sp.innerHTML=Math.round(S.vel.length()*3.6)+" <small>km/h</small>";const cb=document.getElementById("combo");if(cb){if(S.combo>1){cb.textContent="x"+(1+(S.combo-1)*0.28).toFixed(1)+" COMBO";cb.classList.add("visible")}else cb.classList.remove("visible")}const fr=document.getElementById("flow-ring");if(fr){const ctx=fr.getContext("2d");ctx.clearRect(0,0,80,80);ctx.beginPath();ctx.arc(40,40,32,0,Math.PI*2);ctx.strokeStyle="rgba(255,255,255,0.2)";ctx.lineWidth=7;ctx.stroke();ctx.beginPath();ctx.arc(40,40,32,-Math.PI/2,-Math.PI/2+S.flow*Math.PI*2);ctx.strokeStyle=S.flow>0.7?"#4ade80":S.flow>0.35?"#fbbf24":"#f87171";ctx.lineWidth=7;ctx.lineCap="round";ctx.stroke()}}
let last=performance.now();
function loop(now){const dt=Math.min((now-last)/1000,0.05);last=now;if(S.started&&!S.paused&&S.alive){phys(dt);cam(dt)}else if(!S.started){const t=now*0.0002;camera.position.set(Math.sin(t)*24,13,Math.cos(t)*24);camera.lookAt(0,1.5,0)}ui();renderer.render(scene,camera);requestAnimationFrame(loop)}
init();
