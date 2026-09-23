import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {spawn} from 'node:child_process';
const root=resolve('dist');const port=4173;const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};
createServer(async(req,res)=>{try{const path=resolve(root,'.'+decodeURI((req.url||'/').split('?')[0]));if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403).end();return}const target=(await stat(path).catch(()=>null))?.isFile()?path:resolve(root,'index.html');res.setHeader('Content-Type',types[extname(target)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(await readFile(target))}catch{res.writeHead(500).end('Preview failed')}}).listen(port,'0.0.0.0',()=>{const url=`http://localhost:${port}`;console.log(`미리보기 실행: ${url}`);console.log('같은 와이파이의 휴대폰에서는 PC IP 주소로 접속하세요. 예: http://192.168.0.10:4173');if(process.platform==='win32')spawn('cmd',['/c','start','',url],{detached:true,stdio:'ignore'}).unref()});
