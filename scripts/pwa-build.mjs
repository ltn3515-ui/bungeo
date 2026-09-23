import{readdir,readFile,writeFile}from'node:fs/promises';
import{createHash}from'node:crypto';
import{join}from'node:path';

async function assets(folder,prefix=''){
  const result=[];
  for(const item of await readdir(folder,{withFileTypes:true})){
    const relative=join(prefix,item.name);
    if(item.isDirectory())result.push(...await assets(join(folder,item.name),relative));
    else if(item.name!=='sw.js')result.push('/'+relative.replaceAll('\\','/'));
  }
  return result;
}
const files=await assets('dist');
const hash=createHash('sha256');
for(const file of files){hash.update(file);hash.update(await readFile(join('dist',file.slice(1))))}
const version=hash.digest('hex').slice(0,12);
const template=await readFile('public/sw.js','utf8');
await writeFile('dist/sw.js',template.replace('__VERSION__',version).replace('__ASSETS__',JSON.stringify(files)));
