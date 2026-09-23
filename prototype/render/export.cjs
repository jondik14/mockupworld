const sharp=require('sharp');const fs=require('fs');
(async()=>{
const scenes=JSON.parse(fs.readFileSync('render/scenes.json'));const meta=JSON.parse(fs.readFileSync('render/out/meta.json'));
const data=[];
for(const s of scenes){
  const src='render/out/'+s.id;
  await sharp(src+'.png').webp({quality:84}).toFile('site/m/'+s.id+'.webp');
  await sharp(src+'.png').resize({width:640}).webp({quality:80}).toFile('site/m/'+s.id+'-t.webp');
  await sharp(src+'-mask.png').toColourspace('b-w').png({compressionLevel:9}).toFile('site/m/'+s.id+'-mask.png');
  data.push({id:s.id,title:s.title,tags:s.tags,bg:s.bg,w:s.width,h:s.height,quad:meta[s.id].quad});
}
fs.writeFileSync('site/data.json',JSON.stringify(data));
for(const u of ['onboarding','feed','paywall','home','player','wallet','settings'])
  await sharp('render/screens/'+u+'.png').webp({quality:88}).toFile('site/ui/'+u+'.webp');
})()
