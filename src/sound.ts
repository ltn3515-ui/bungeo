export type Cue='order'|'accept'|'bake'|'ready'|'perfect'|'urgent'|'miss'|'sale'|'perfectSale'|'staff'|'upgrade'|'branch';

let context:AudioContext|null=null;
let lastBake=0;
let primed=false;

function audio(){
  if(!primed)return null;
  if(typeof window==='undefined')return null;
  const Constructor=window.AudioContext;
  if(!Constructor)return null;
  try{
    context??=new Constructor();
    if(context.state==='suspended')void context.resume().catch(()=>{});
    return context;
  }catch{return null}
}

export function armAudio(){primed=true;audio()}

function note(ctx:AudioContext,start:number,freq:number,duration:number,volume:number,shape:OscillatorType='sine',end=freq){
  const oscillator=ctx.createOscillator();
  const gain=ctx.createGain();
  oscillator.type=shape;
  oscillator.frequency.setValueAtTime(freq,start);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(1,end),start+duration);
  gain.gain.setValueAtTime(.0001,start);
  gain.gain.exponentialRampToValueAtTime(volume,start+.012);
  gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start+duration+.01);
  oscillator.onended=()=>{oscillator.disconnect();gain.disconnect()};
}

function sizzle(ctx:AudioContext,start:number){
  const duration=.095;
  const buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*duration),ctx.sampleRate);
  const data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.55;
  const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
  source.buffer=buffer;filter.type='highpass';filter.frequency.value=1100;
  gain.gain.setValueAtTime(.0001,start);
  gain.gain.linearRampToValueAtTime(.025,start+.016);
  gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start(start);source.stop(start+duration);
  source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect()};
}

/** Short synthesized cues: no network requests, media files, or audio until play starts. */
export function playCue(cue:Cue,enabled:boolean){
  if(!enabled)return;
  if(cue==='bake'&&performance.now()-lastBake<125)return;
  if(cue==='bake')lastBake=performance.now();
  const ctx=audio();if(!ctx)return;
  const t=ctx.currentTime+.012;
  switch(cue){
    case 'order': note(ctx,t,620,.12,.034,'sine',790);note(ctx,t+.105,850,.18,.039);break;
    case 'accept': note(ctx,t,490,.07,.032,'triangle',540);note(ctx,t+.075,690,.13,.038,'triangle',780);break;
    case 'bake': sizzle(ctx,t);note(ctx,t,210,.08,.022,'triangle',175);break;
    case 'ready': note(ctx,t,740,.09,.033);note(ctx,t+.1,920,.15,.039);break;
    case 'perfect': note(ctx,t,930,.07,.033);note(ctx,t+.085,1170,.18,.042);break;
    case 'urgent': note(ctx,t,430,.085,.036,'triangle');note(ctx,t+.16,430,.085,.036,'triangle');break;
    case 'miss': note(ctx,t,320,.16,.058,'sawtooth',230);note(ctx,t+.13,220,.25,.041,'triangle',150);break;
    case 'sale': note(ctx,t,540,.09,.037);note(ctx,t+.1,700,.1,.039);note(ctx,t+.2,900,.22,.043);break;
    case 'perfectSale': note(ctx,t,650,.09,.035);note(ctx,t+.09,820,.09,.04);note(ctx,t+.18,1050,.1,.04);note(ctx,t+.28,1320,.28,.044);break;
    case 'staff': note(ctx,t,550,.09,.023,'triangle');note(ctx,t+.1,740,.13,.028,'triangle');break;
    case 'upgrade': note(ctx,t,480,.1,.035);note(ctx,t+.1,640,.12,.038);note(ctx,t+.22,960,.27,.043);break;
    case 'branch': note(ctx,t,520,.12,.037);note(ctx,t+.12,660,.13,.039);note(ctx,t+.25,790,.13,.04);note(ctx,t+.38,1050,.3,.043);break;
  }
}
