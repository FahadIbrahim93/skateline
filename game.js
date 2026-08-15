import * as THREE from "three";
const C={g:26,maxS:22,push:18,fric:0.11,carve:0.45,ollie:12.5,turn:2.8,camD:8,camH:3.4,camLag:0.0012};
const S={pos:new THREE.Vector3(0,1.4,0),vel:new THREE.Vector3(0,0,-3),yaw:0,onG:false,prevG:false,grind:false,score:0,combo:0,comboT:0,alive:true,started:false,paused:false,keys:{},lean:0,flow:0.55,airT:0,spin:0,grab:false,shake:0,touchOllie:false,touchPush:false,touchGrab:false,touchCrouch:false};
let scene,camera,renderer,player,rails=[],ledges=[];
const F=new THREE.Vector3(),_t=new THREE.Vector3();
function M(col,r=0.85,m=0.05){return new THREE.MeshStandardMaterial({color:col,roughness:r,metalness:m})}
function box(w,h,d,mat,x,y,z,rx=0,ry=0,rz=0,sh=true){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof mat==="number"?M(mat):mat);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);if(sh){o.castShadow=true;o.receiveShadow=true}scene.add(o);return o}
function cyl(r,h,mat,x,y,z,rx=0,ry=0,rz=0){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,8),typeof mat==="number"?M(mat,0.4,0.55):mat);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.castShadow=true;scene.add(o);return o}
function addRail(x,z,len,ry,y=0.55){const geo=new THREE.CylinderGeometry(0.055,0.055,len,8);geo.rotateZ(Math.PI/2);const m=new THREE.Mesh(geo,M(0xd8d8e0,0.2,0.85));m.position.set(x,y,z);m.rotation.y=ry;m.castShadow=true;scene.add(m);const hx=Math.sin(ry)*len/2,hz=Math.cos(ry)*len/2;cyl(0.035,y,0x9a9aa2,x-hx*0.85,y/2,z-hz*0.85);cyl(0.035,y,0x9a9aa2,x+hx*0.85,y/2,z+hz*0.85);rails.push({x1:x-hx,z1:z-hz,x2:x+hx,z2:z+hz,y})}
function addLedge(x,z,w,d,h){box(w,h,d,0x7a7a88,x,h/2,z);box(w+0.08,0.06,0.12,0x9a9aa8,x,h+0.02,z+d/2);box(w+0.08,0.06,0.12,0x9a9aa8,x,h+0.02,z-d/2);ledges.push({y:h,minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2})}
function buildWorld(){
const ground=new THREE.Mesh(new THREE.PlaneGeometry(180,180),M(0x252530,0.95));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
box(40,0.06,40,0x3a3a46,0,0.03,0);box(18,0.08,18,0x484854,0,0.07,0);
box(4,0.05,50,0x353542,0,0.025,0);box(50,0.05,4,0x353542,0,0.025,0);
for(let i=-8;i<=8;i+=2.2){box(1.1,0.02,0.4,0xc8c8d0,i,0.1,10);box(1.1,0.02,0.4,0xc8c8d0,i,0.1,-10);box(0.4,0.02,1.1,0xc8c8d0,10,0.1,i);box(0.4,0.02,1.1,0xc8c8d0,-10,0.1,i)}
const bCols=[0x4a4a58,0x565664,0x606070,0x444450,0x525260,0x3e3e4a];
const blds=[[-26,-26,16,22,14],[-26,0,12,16,12],[-26,26,14,18,13],[0,-32,22,12,12],[0,32,20,14,12],[26,-24,14,24,13],[26,4,11,18,12],[26,28,15,16,12],[-36,10,10,14,18],[36,-8,10,15,16],[-14,-34,9,9,9],[14,-34,10,10,9],[-12,34,8,8,8],[12,34,9,9,8],[-38,-14,8,12,10],[38,16,9,13,11]];
blds.forEach(([x,z,w,h,d],i)=>{box(w,h,d,bCols[i%6],x,h/2,z);const rows=Math.max(2,Math.floor(h/2.3)),cols=Math.max(2,Math.floor(w/2.5));for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const wx=x-w/2+1.3+c*((w-2.6)/Math.max(1,cols-1)),wy=1.5+r*2.15;box(0.65,0.85,0.06,0x1a2230,wx,wy,z+d/2+0.04,0,0,0,false);box(0.65,0.85,0.06,0x1a2230,wx,wy,z-d/2-0.04,0,0,0,false)}box(w+0.3,0.25,d+0.3,0x2a2a34,x,h+0.1,z)});
[[0,11,14,0],[0,-12,12,0],[13,0,11,Math.PI/2],[-13,0,12,Math.PI/2],[9,9,9,-0.4],[-9,-9,10,0.35],[10,-10,8,0.6],[-11,10,9,-0.55],[18,6,7,Math.PI/2],[-18,-5,8,Math.PI/2],[6,18,7,0],[-5,-19,8,0]].forEach(a=>addRail(...a));
[[7,-9,9,1.5,0.52],[-8,7,1.5,8,0.52],[3,17,11,1.6,0.55],[-15,-7,7,1.4,0.5],[12,12,6,1.3,0.48],[-10,-16,8,1.4,0.5],[16,-4,1.3,6,0.5],[-17,4,1.4,5.5,0.48]].forEach(a=>addLedge(...a));
for(let i=0;i<6;i++){box(5,0.18,0.85,0x6a6a78,18,0.09+i*0.18,-11-i*0.4);box(5,0.18,0.85,0x6a6a78,-18,0.09+i*0.18,11+i*0.4)}
box(6,0.45,9,0x4a4a56,14,0.55,-9,-0.4,0,0);box(6,0.45,9,0x4a4a56,-14,0.55,9,0.4,0,0);box(8,0.35,5,0x4a4a56,0,0.4,20,0.35,0,0);
box(4,1.0,2.4,0x5a5a66,-10,0.0,0);box(4.2,0.12,2.6,0x3a3a46,-10,0.55,0);box(3.5,0.8,2.0,0x5a5a66,11,0.0,3);box(3.7,0.12,2.2,0x3a3a46,11,0.45,3);
box(14,0.65,1.2,0x707080,0,0.32,14);ledges.push({y:0.65,minX:-7,maxX:7,minZ:13.4,maxZ:14.6});
box(2.5,0.35,2.5,0x555560,20,0.17,20);box(2.5,0.35,2.5,0x555560,-20,0.17,-20);
[[-5,6],[5,6],[-5,-6],[5,-6],[0,8],[0,-8]].forEach(([x,z])=>{box(2.4,0.1,0.55,0x8B6914,x,0.45,z);box(0.12,0.45,0.5,0x5a4030,x-1.0,0.22,z);box(0.12,0.45,0.5,0x5a4030,x+1.0,0.22,z)});
[[8,8],[-8,-8],[9,-5],[-9,5],[15,0],[-15,0]].forEach(([x,z])=>{cyl(0.26,0.65,0x333338,x,0.32,z);cyl(0.28,0.07,0x222226,x,0.68,z)});
[[22,0],[-22,0],[0,24],[0,-24],[16,16],[-16,-16]].forEach(([x,z])=>{cyl(0.08,3.2,0x3a3a42,x,1.6,z);cyl(0.2,0.15,0x2a2a30,x,3.25,z);const light=new THREE.PointLight(0xffe8c0,0.35,18);light.position.set(x,3.1,z);scene.add(light)});
[[-28,14],[28,-14],[-16,30],[16,-30],[30,18],[-30,-18]].forEach(([x,z])=>{cyl(0.16,2.4,0x4a3020,x,1.2,z);const c=new THREE.Mesh(new THREE.SphereGeometry(1.4,7,5),M(0x2a5a2a,0.9));c.position.set(x,2.9,z);c.castShadow=true;scene.add(c)});
[[12,-20],[-12,20],[20,12],[-20,-12]].forEach(([x,z])=>{box(1.8,0.55,0.7,0x5a5040,x,0.27,z);box(1.6,0.2,0.55,0x2d5a2d,x,0.6,z)});
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
scene=new THREE.Scene();scene.background=new THREE.Color(0x5a8ab8);scene.fog=new THREE.Fog(0x5a8ab8,45,120);
camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,0.1,200);
renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xc8e0ff,0x3a4a3a,0.55));
const sun=new THREE.DirectionalLight(0xfff0d8,1.45);sun.position.set(50,65,35);sun.castShadow=true;
sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.near=5;sun.shadow.camera.far=150;
sun.shadow.camera.left=sun.shadow.camera.bottom=-50;sun.shadow.camera.right=sun.shadow.camera.top=50;sun.shadow.bias=-0.0004;scene.add(sun);
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
function phys(dt){if(!S.alive)return;const L=getLean();const spd=S.vel.length();const tr=THREE.MathUtils.clamp(C.turn-spd*0.035,1.15,C.turn);S.yaw+=L*tr*dt;F.set(Math.sin(S.yaw),0,-Math.cos(S.yaw));const gy=0,ha=S.pos.y-gy;S.onG=ha<0.38&&S.vel.y<=0.55&&!S.grind;const rail=checkRail();if(rail&&spd>2.8&&ha<0.95){if(!S.grind){S.grind=true;S.combo=Math.min(6,S.combo+1);S.comboT=2.8}S.pos.y=rail.y+0.22;S.vel.y=0;S.vel.x*=0.985;S.vel.z*=0.985;S.vel.addScaledVector(F,3.2*dt);S.score+=spd*dt*2.4*(1+S.combo*0.15);S.flow=Math.min(1,S.flow+0.12*dt)}else if(S.grind)S.grind=false;if(S.onG&&!S.grind){if(!S.prevG&&S.airT>0.25){if(S.vel.y<-14){wipe();return}let pts=0;if(Math.abs(S.spin)>1.2)pts+=Math.round(Math.abs(S.spin)*40);if(S.grab)pts+=80;if(S.airT>0.85)pts+=Math.round(S.airT*45);if(pts>0){S.combo=Math.min(6,S.combo+1);S.comboT=3;S.score+=Math.round(pts*(1+(S.combo-1)*0.28));S.flow=Math.min(1,S.flow+0.07)}}S.airT=0;S.spin=0;S.grab=false;S.pos.y=gy+0.18;S.vel.y=Math.max(0,S.vel.y);if(isPush())S.vel.addScaledVector(F,C.push*dt);if(isCrouch())S.vel.multiplyScalar(0.988);const fr=Math.abs(L)>0.18?C.carve:C.fric;S.vel.x-=S.vel.x*fr*dt*3.8;S.vel.z-=S.vel.z*fr*dt*3.8;if(isOllie()){S.vel.y=C.ollie;S.onG=false;S.flow=Math.min(1,S.flow+0.05)}if(Math.abs(L)>0.15&&spd>6)S.flow=Math.min(1,S.flow+0.09*dt);else if(spd<3.5)S.flow=Math.max(0,S.flow-0.14*dt)}else if(!S.grind){if(S.prevG){S.airT=0;S.spin=0;S.grab=false}S.airT+=dt;S.spin+=L*tr*dt;if(isGrab())S.grab=true;S.vel.y-=C.g*dt;S.vel.x*=0.997;S.vel.z*=0.997}S.prevG=S.onG;if(spd>C.maxS)S.vel.multiplyScalar(C.maxS/spd);S.pos.addScaledVector(S.vel,dt);S.score+=spd*dt*0.55;if(S.comboT>0){S.comboT-=dt;if(S.comboT<=0)S.combo=0}if(S.pos.y<-3||Math.abs(S.pos.x)>75||Math.abs(S.pos.z)>75)wipe();player.position.copy(S.pos);player.rotation.y=S.yaw;player.rotation.z=-L*0.4;player.rotation.x=S.onG||S.grind?0:THREE.MathUtils.clamp(-S.vel.y*0.02,-0.4,0.32)}
function wipe(){if(!S.alive)return;S.alive=false;S.vel.set(0,0,0);S.combo=0;S.shake=1.2;document.body.classList.add("wiped");const m=document.getElementById("message");if(m){m.textContent="WIPEOUT";m.classList.add("visible")}}
function cam(dt){_t.set(S.pos.x+Math.sin(S.yaw)*C.camD,S.pos.y+C.camH,S.pos.z+Math.cos(S.yaw)*C.camD);camera.position.lerp(_t,1-Math.pow(C.camLag,dt));if(S.shake>0){camera.position.x+=(Math.random()-0.5)*S.shake*0.9;camera.position.y+=(Math.random()-0.5)*S.shake*0.5;S.shake=Math.max(0,S.shake-6*dt)}camera.lookAt(S.pos.x,S.pos.y+1.1,S.pos.z);const sr=Math.min(S.vel.length()/C.maxS,1);camera.fov=58+sr*7;camera.updateProjectionMatrix()}
function ui(){const sc=document.getElementById("score");if(sc)sc.textContent=Math.floor(S.score);const sp=document.getElementById("speed");if(sp)sp.innerHTML=Math.round(S.vel.length()*3.6)+" <small>km/h</small>";const cb=document.getElementById("combo");if(cb){if(S.combo>1){cb.textContent="x"+(1+(S.combo-1)*0.28).toFixed(1)+" COMBO";cb.classList.add("visible")}else cb.classList.remove("visible")}const fr=document.getElementById("flow-ring");if(fr){const ctx=fr.getContext("2d");ctx.clearRect(0,0,80,80);ctx.beginPath();ctx.arc(40,40,32,0,Math.PI*2);ctx.strokeStyle="rgba(255,255,255,0.2)";ctx.lineWidth=7;ctx.stroke();ctx.beginPath();ctx.arc(40,40,32,-Math.PI/2,-Math.PI/2+S.flow*Math.PI*2);ctx.strokeStyle=S.flow>0.7?"#4ade80":S.flow>0.35?"#fbbf24":"#f87171";ctx.lineWidth=7;ctx.lineCap="round";ctx.stroke()}}
let last=performance.now();
function loop(now){const dt=Math.min((now-last)/1000,0.05);last=now;if(S.started&&!S.paused&&S.alive){phys(dt);cam(dt)}else if(!S.started){const t=now*0.00022;camera.position.set(Math.sin(t)*22,12,Math.cos(t)*22);camera.lookAt(0,1.5,0)}ui();renderer.render(scene,camera);requestAnimationFrame(loop)}
init();
