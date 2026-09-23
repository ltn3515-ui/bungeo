export type Flavor='팥'|'슈크림'|'초코';
export type Customer={id:string;name:string;flavor:Flavor;emoji:string;branch:number;placedAt:number;deadline:number};
export type Upgrade='oven'|'sign'|'decor';
export type Save={version:1;coins:number;totalEarned:number;served:number;perfect:number;oven:number;sign:number;decor:number;branches:number;selectedBranch:number;neighborhood:string;lastSeen:number;sound:boolean;weekKey:string;weeklyScore:number;staff:number[];assisted:number;missed:number};
export const STORAGE_KEY='bungeo-town-v1';
export function currentWeek(now=Date.now()){const d=new Date(now);d.setHours(0,0,0,0);d.setDate(d.getDate()-(d.getDay()+6)%7);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
export function nextWeek(now=Date.now()){const d=new Date(now);d.setHours(0,0,0,0);d.setDate(d.getDate()+((8-d.getDay())%7||7));return d.getTime()}
export function thisWeeksSave(s:Save,now=Date.now()):Save{return s.weekKey===currentWeek(now)?s:{...s,weekKey:currentWeek(now),weeklyScore:0}}
export const rivals=[{name:'호떡이네',avatar:'🧑🏻‍🍳',score:480},{name:'달콤분식',avatar:'👩🏽‍🍳',score:960},{name:'골목장인',avatar:'👨🏻‍🍳',score:1680}] as const;
export function leagueRank(score:number){return 1+rivals.filter(r=>r.score>score).length}
export const initial=():Save=>({version:1,coins:0,totalEarned:0,served:0,perfect:0,oven:0,sign:0,decor:0,branches:1,selectedBranch:0,neighborhood:'성수동',lastSeen:Date.now(),sound:true,weekKey:currentWeek(),weeklyScore:0,staff:[],assisted:0,missed:0});
export const names=['지민','민수','하늘','은지','도윤','수아','서준','지우'];
export const flavors:Flavor[]=['팥','슈크림','초코'];
export const bakeProfiles:Record<Flavor,{speed:number;ready:number;perfectStart:number;perfectEnd:number;burn:number;patienceDelta:number;hint:string}>={
  팥:{speed:2.15,ready:58,perfectStart:76,perfectEnd:96,burn:112,patienceDelta:2000,hint:'천천히 익어요 · 기다림 +2초'},
  슈크림:{speed:3.1,ready:52,perfectStart:66,perfectEnd:82,burn:100,patienceDelta:-1000,hint:'금방 익고 빨리 타요 · 기다림 -1초'},
  초코:{speed:2.45,ready:62,perfectStart:84,perfectEnd:100,burn:118,patienceDelta:0,hint:'가장 늦게 완성돼요'},
};
export const bakeStep=(flavor:Flavor,oven:number)=>bakeProfiles[flavor].speed+oven*.22;
export const isReady=(flavor:Flavor,heat:number)=>heat>=bakeProfiles[flavor].ready&&heat<bakeProfiles[flavor].burn;
export const isPerfect=(flavor:Flavor,heat:number)=>heat>=bakeProfiles[flavor].perfectStart&&heat<=bakeProfiles[flavor].perfectEnd;
export const isBurned=(flavor:Flavor,heat:number)=>heat>=bakeProfiles[flavor].burn;
export const branchNames=['첫 번째 골목','시장 앞 골목','공원 옆 골목','광장 거리','빵집 거리','야시장 골목','강변 산책길','학교 앞 골목'];
export const branchCosts=[0,1800,6500,18000,42000,86000,170000,340000];
export const staffCosts=[900,1600,3400,6900,11000,18000,29000,46000];
export const MISS_PENALTY=60;
export const STAFF_POINTS=45;
export const staffDelay=8000;
export const orderWindow=(branches:number)=>Math.max(19000,29000-(branches-1)*1300);
export const orderTime=(branches:number,flavor:Flavor)=>orderWindow(branches)+bakeProfiles[flavor].patienceDelta;
export const spawnInterval=(branches:number)=>Math.max(3200,9000-(branches-1)*800);
export const upgradeCosts:Record<Upgrade,number[]>={oven:[500,1300,3200,7500],sign:[650,1600,4000,9000],decor:[450,1100,2900,6900]};
export const money=(n:number)=>Math.floor(n).toLocaleString('ko-KR');
export const passiveRate=(s:Save)=>0.12*(1+s.oven*.38+s.sign*.18)*s.branches;
export const salePrice=(s:Save,perfect:boolean)=>Math.round((170+s.sign*38+s.decor*12)*(1+(s.branches-1)*.09)+(perfect?40:0));
export function offlineGain(s:Save,now=Date.now()){const seconds=Math.min(14400,Math.max(0,(now-s.lastSeen)/1000));return Math.floor(seconds*passiveRate(s))}
export function buyUpgrade(s:Save,type:Upgrade):Save|null{const level=s[type],cost=upgradeCosts[type][level];if(cost===undefined||s.coins<cost)return null;return{...s,coins:s.coins-cost,[type]:level+1,lastSeen:Date.now()}}
export function buyBranch(s:Save,index:number):Save|null{if(index!==s.branches||index>=branchNames.length||s.coins<branchCosts[index])return null;return{...s,coins:s.coins-branchCosts[index],branches:s.branches+1,selectedBranch:index,lastSeen:Date.now()}}
export function hireStaff(s:Save,index:number):Save|null{if(index<0||index>=s.branches||s.staff.includes(index)||s.coins<staffCosts[index])return null;return{...s,coins:s.coins-staffCosts[index],staff:[...s.staff,index],lastSeen:Date.now()}}
export function receiveSale(s:Save,perfect:boolean):Save{const fresh=thisWeeksSave(s);const price=salePrice(fresh,perfect);return{...fresh,coins:fresh.coins+price,totalEarned:fresh.totalEarned+price,served:fresh.served+1,perfect:fresh.perfect+(perfect?1:0),weeklyScore:fresh.weeklyScore+100+(perfect?40:0),lastSeen:Date.now()}}
export function receiveStaffSale(s:Save):Save{const fresh=thisWeeksSave(s);const price=Math.round(salePrice(fresh,false)*.65);return{...fresh,coins:fresh.coins+price,totalEarned:fresh.totalEarned+price,served:fresh.served+1,assisted:fresh.assisted+1,weeklyScore:fresh.weeklyScore+STAFF_POINTS,lastSeen:Date.now()}}
export function missOrders(s:Save,count=1):Save{const fresh=thisWeeksSave(s);return{...fresh,missed:fresh.missed+count,weeklyScore:Math.max(0,fresh.weeklyScore-MISS_PENALTY*count),lastSeen:Date.now()}}
export function readSave(raw:unknown):Save{if(!raw||typeof raw!=='object')return initial();const r=raw as Partial<Save>;const v=initial();for(const key of ['coins','totalEarned','served','perfect','oven','sign','decor','branches','selectedBranch','lastSeen','weeklyScore','assisted','missed'] as const){const n=r[key];if(typeof n==='number'&&Number.isFinite(n)&&n>=0)Object.assign(v,{[key]:Math.floor(n)})}v.coins=Math.min(v.coins,1e12);v.totalEarned=Math.min(v.totalEarned,1e12);v.weeklyScore=Math.min(v.weeklyScore,1e9);v.oven=Math.min(v.oven,4);v.sign=Math.min(v.sign,4);v.decor=Math.min(v.decor,4);v.branches=Math.min(Math.max(1,v.branches),branchNames.length);v.selectedBranch=Math.min(v.selectedBranch,v.branches-1);v.perfect=Math.min(v.perfect,v.served);v.neighborhood=typeof r.neighborhood==='string'&&r.neighborhood.length<=12&&r.neighborhood.length>0?r.neighborhood:'성수동';v.sound=typeof r.sound==='boolean'?r.sound:true;v.lastSeen=Math.min(v.lastSeen,Date.now());v.staff=Array.isArray(r.staff)?[...new Set(r.staff.filter((n):n is number=>typeof n==='number'&&Number.isInteger(n)&&n>=0&&n<v.branches))]:[];v.weekKey=typeof r.weekKey==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(r.weekKey)?r.weekKey:currentWeek();return thisWeeksSave(v)}
export function customer(now=Date.now(),branch=0,branches=1,flavor?:Flavor):Customer{const i=Math.floor(Math.random()*names.length),f=flavor??flavors[Math.floor(Math.random()*flavors.length)];return{id:crypto.randomUUID(),name:names[i],flavor:f,emoji:['🧑🏻','👩🏻','🧒🏻','👨🏻'][Math.floor(Math.random()*4)],branch,placedAt:now,deadline:now+orderTime(branches,f)}}
