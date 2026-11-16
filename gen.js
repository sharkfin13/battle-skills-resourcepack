(function(root){
var T=[];for(var n=0;n<256;n++){var c=n;for(var k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;T[n]=c>>>0}
function crc(b){var c=0xFFFFFFFF;for(var i=0;i<b.length;i++)c=T[(c^b[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0}
function u32(v){return[(v>>>24)&255,(v>>>16)&255,(v>>>8)&255,v&255]}
function le32(v){return[v&255,(v>>>8)&255,(v>>>16)&255,(v>>>24)&255]}
function le16(v){return[v&255,(v>>>8)&255]}
function utf8(s){return Array.prototype.slice.call(new TextEncoder().encode(s))}
function chunk(t,d){var tb=[t.charCodeAt(0),t.charCodeAt(1),t.charCodeAt(2),t.charCodeAt(3)],cb=tb.concat(d);return u32(d.length).concat(cb,u32(crc(cb)))}
function png(w,h,px){
 var raw=[];for(var y=0;y<h;y++){raw.push(0);for(var x=0;x<w*4;x++)raw.push(px[y*w*4+x])}
 var z=[0x78,1],a=1,b=0,i;
 for(i=0;i<raw.length;i++){a=(a+raw[i])%65521;b=(b+a)%65521}
 for(i=0;i<raw.length;i+=65535){var n=Math.min(65535,raw.length-i);z.push(i+n>=raw.length?1:0,n&255,n>>>8,(~n)&255,((~n)>>>8)&255);for(var j=0;j<n;j++)z.push(raw[i+j])}
 z=z.concat(u32(((b<<16)|a)>>>0));
 return[137,80,78,71,13,10,26,10].concat(chunk('IHDR',u32(w).concat(u32(h),[8,6,0,0,0])),chunk('IDAT',z),chunk('IEND',[]))}
function parse(txt){var out={};txt.split('\n').forEach(function(l){if(!l.trim())return;var p=l.split('|'),pal={};p[1].split(',').forEach(function(e){pal[e[0]]=[parseInt(e.substr(1,2),16),parseInt(e.substr(3,2),16),parseInt(e.substr(5,2),16),parseInt(e.substr(7,2),16)]});
 var d=p[2].split('/').join(''),px=[];for(var i=0;i<256;i++){var c=d[i];var v=c==='.'?[0,0,0,0]:pal[c];px.push(v[0],v[1],v[2],v[3])}out[p[0]]=px});return out}
function build(txt,desc){
 var P=parse(txt),F={},names=Object.keys(P),J=JSON.stringify,B='assets/skills/';
 names.forEach(function(n){F[B+'textures/item/'+n+'.png']=png(16,16,P[n])});
 var big=[],s=P.revive_star;for(var y=0;y<64;y++)for(var x=0;x<64;x++){var o=((y>>2)*16+(x>>2))*4;big.push(s[o],s[o+1],s[o+2],s[o+3])}
 F['pack.png']=png(64,64,big);
 F['pack.mcmeta']=utf8(J({pack:{pack_format:69,min_format:69,max_format:80,description:desc}},null,2));
 var rods=[];
 names.forEach(function(n){
  var par=/^rod_\d+$/.test(n)?'handheld':'generated';
  F[B+'models/item/'+n+'.json']=utf8(J({parent:'minecraft:item/'+par,textures:{layer0:'skills:item/'+n}}));
  if(/^rod_(\d+)$/.test(n))rods.push(+n.slice(4));
  else if(n!=='skill_rod')F[B+'items/'+n+'.json']=utf8(J({model:{type:'minecraft:model',model:'skills:item/'+n}}))});
 rods.sort(function(a,b){return a-b});
 F[B+'items/skill_rod.json']=utf8(J({model:{type:'minecraft:select',property:'minecraft:display_context',cases:[{when:['thirdperson_righthand','thirdperson_lefthand'],model:{type:'minecraft:empty'}}],fallback:{type:'minecraft:select',property:'minecraft:custom_model_data',index:0,cases:rods.map(function(r){return{when:'s'+r,model:{type:'minecraft:model',model:'skills:item/rod_'+r}}}),fallback:{type:'minecraft:model',model:'skills:item/skill_rod'}}}}));
 return F}
function zip(F){
 var out=[],cen=[],keys=Object.keys(F);
 keys.forEach(function(k){var d=F[k],nb=utf8(k),c=crc(d),off=out.length;
  out=out.concat([0x50,0x4b,3,4],le16(20),le16(0x800),le16(0),le16(0),le16(0x21),le32(c),le32(d.length),le32(d.length),le16(nb.length),le16(0),nb,d);
  cen=cen.concat([0x50,0x4b,1,2],le16(20),le16(20),le16(0x800),le16(0),le16(0),le16(0x21),le32(c),le32(d.length),le32(d.length),le16(nb.length),le16(0),le16(0),le16(0),le16(0),le32(0),le32(off),nb)});
 var co=out.length;out=out.concat(cen,[0x50,0x4b,5,6],le16(0),le16(0),le16(keys.length),le16(keys.length),le32(cen.length),le32(co),le16(0));
 return new Uint8Array(out)}
root.PackGen={build:build,zip:zip};
if(typeof module!=='undefined')module.exports=root.PackGen;
})(typeof window!=='undefined'?window:globalThis);
