import assert from 'node:assert/strict';
import {initial,readSave,hireStaff,receiveSale,receiveStaffSale,missOrders,customer,orderWindow,orderTime,bakeProfiles,bakeStep,isReady,isPerfect,isBurned,flavors,spawnInterval,staffCosts,STAFF_POINTS,MISS_PENALTY} from '../src/game.ts';
const prior={...initial(),coins:10000,branches:3,selectedBranch:2};
delete prior.staff;delete prior.assisted;delete prior.missed;
const migrated=readSave(prior);
assert.deepEqual(migrated.staff,[]);
assert.equal(migrated.selectedBranch,2);
assert.equal(migrated.coins,10000);
assert.equal(hireStaff(migrated,3),null,'closed branch cannot hire');
const hired=hireStaff(migrated,1);
assert.ok(hired);
assert.equal(hired.coins,10000-staffCosts[1]);
assert.deepEqual(hired.staff,[1]);
assert.equal(hireStaff(hired,1),null,'cannot hire twice');
const manual=receiveSale(hired,true);
assert.equal(manual.weeklyScore,140);
const assisted=receiveStaffSale(manual);
assert.equal(assisted.weeklyScore,140+STAFF_POINTS);
assert.equal(assisted.assisted,1);
assert.equal(assisted.served,2);
assert.ok(assisted.coins>manual.coins);
const missed=missOrders(assisted,4);
assert.equal(missed.weeklyScore,0,'penalty must clamp score to zero');
assert.equal(missed.missed,4);
assert.equal(MISS_PENALTY,60);
assert.ok(orderWindow(8)<orderWindow(1));
assert.ok(spawnInterval(8)<spawnInterval(1));
const order=customer(1000,2,3,'팥');
assert.equal(order.branch,2);
assert.equal(order.deadline,1000+orderTime(3,'팥'));
assert.ok(orderTime(3,'팥')>orderTime(3,'초코'));
assert.ok(orderTime(3,'초코')>orderTime(3,'슈크림'));
assert.ok(bakeStep('슈크림',0)>bakeStep('초코',0));
assert.ok(bakeStep('초코',0)>bakeStep('팥',0));
for(const flavor of flavors){
  const profile=bakeProfiles[flavor];
  assert.ok(profile.ready<profile.perfectStart);
  assert.ok(profile.perfectStart<profile.perfectEnd);
  assert.ok(profile.perfectEnd<profile.burn);
  assert.ok(!isReady(flavor,profile.ready-1));
  assert.ok(isReady(flavor,profile.ready));
  assert.ok(isPerfect(flavor,profile.perfectStart));
  assert.ok(isPerfect(flavor,profile.perfectEnd));
  assert.ok(!isPerfect(flavor,profile.perfectEnd+1));
  assert.ok(isBurned(flavor,profile.burn));
  for(let oven=0;oven<=4;oven++){
    let heat=0,perfect=false;
    while(!isBurned(flavor,heat)){
      heat+=bakeStep(flavor,oven);
      perfect ||= isPerfect(flavor,heat);
    }
    assert.ok(perfect,`${flavor} level ${oven} must have a playable perfect window`);
  }
}
assert.deepEqual(readSave({...hired,staff:[1,1,2,42,-1,1.5]}).staff,[1,2]);
console.log('saves, staff, penalties, distinct recipes and all oven levels: passed');
