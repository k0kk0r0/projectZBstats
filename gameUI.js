function renderSkill(){
  const skillList = document.getElementById("skillList");
  skillList.innerHTML = ""; // 초기화

  for (const [name, data] of Object.entries(skills)) {
    // XP 비율 계산
    const percent = data.maxXp > 0 ? (data.xp / data.maxXp) * 100 : 0;

    // 스킬 하나의 HTML 구성
    const skillItem = document.createElement("div");
    skillItem.className = "relative bg-gray-200 rounded h-8 overflow-hidden";

    skillItem.innerHTML = `
      <div class="h-full bg-yellow-400 transition-all duration-300" style="width: ${percent}%;"></div>
      <span class="absolute inset-0 flex justify-between items-center px-3 text-sm font-semibold text-black">
        <span>${translations[currentLang][name]} (Lv.${data.lv})</span>
        <span>${data.xp} / ${data.maxXp}</span>
      </span>
    `;

    skillList.appendChild(skillItem);
  }
}
const skillmodal = document.getElementById("skillModal")
 // 모달 바깥 클릭 시 닫기
skillmodal.addEventListener("click", (e) => {
    if (e.target === skillmodal) {
        skillmodal.classList.add("hidden");
    }
});
function openSkillModal(){
    renderSkill();
    skillmodal.classList.remove('hidden');
}

//버튼함수
pushBt.addEventListener('click', () => {
    //캐릭터 밀치기(좀비 넘어트리기)
     if(gameOver)return;
    if(delaying) return; //딜레이 중이면 무시
    stopResting();
    if(!isAnimating){
        //console.log(parseInt(weapon.multiHit)+1);
        playerPush(parseInt(weapon.multiHit)+1); //무기 멀티타격보다 1명더 넘어트리기
    }
    
    playerMove();
    advanceTurn();
});
attackBt.addEventListener('click', () => {
    //캐릭터 공격
     if(gameOver)return;
    if(delaying) return;//딜레이 중이면 무시
    stopResting();
    if(!isAnimating){
        playerAttack(weapon.multiHit);    
    }
    
    playerMove();
    advanceTurn();
    callZombies(1);//좀비추가
});

restBt.addEventListener('click', () => {
    //휴식 및 턴 넘기기
     if(gameOver)return;
    if(delaying) return; //딜레이 중이면 무시
    if(isResting){
        stopResting();
        return;
    }
    isResting = true;
    log("휴식중...");
    renderGameUI();
    interval =  setInterval(() => {
        //스태미나, 체력 회복
        if(stamina<100 || health < 100){
             stamina += 10;
             health += 5;
            if(stamina>=100)stamina=100;
            if(health>=100)health=100;
            if(stamina>=100 && health>=100){
                //회복하다가 한 번 멈춤
                stopResting();
            }
        }
        
       
        advanceTurn();
        renderGameUI();
    },400); 
});
skillBt.addEventListener('click', ()=>{
    //스킬 창 열기
    openSkillModal();
});
nextMapBt.addEventListener('click',() =>{
     if(gameOver)return;
    if(delaying)return;//딜레이 중이면 무시
    //다음 맵 이동
    mapNum++;
    let rng = Math.random();
    if(mapNum==mapData.length){
        if(currentMapData.name =="road"){
            //현재 길거리에 있을 때에만
            if(rng<0.15){
                mapData.push( findMapData('store_tool'));
            }else if(rng<0.35){
                mapData.push( findMapData("livestock"));
            }else if(rng<0.6){
                mapData.push( findMapData("house"));
            }else{
                mapData.push( findMapData('road'));
            }
        }else{
             mapData.push( findMapData('road'));
        }
       
        
    }else{
        rng =0;
    }
    let timedelay = 0;
    if(zombies.length>0){
        timedelay = 900;
        delaying=true;
        renderGameUI();
    }
     zombieAttack(0); //맵 이동 시 좀비 공격
     setTimeout(() => { 
        if(gameOver)return;
        mapSetting(mapData[mapNum]);
        delaying=false;
        renderGameUI();
        log(`${translations[currentLang][currentMapData.name]}으로 이동했다. - 진행도[${mapNum+1}/${mapData.length}]`,rng);
     },timedelay);
    
    //TurnEnd();
    
    
})
atHomeBt.addEventListener('click', ()=>{
     if(gameOver)return;
    if(delaying)return;//딜레이 중이면 무시
    //이전 맵 이동
    mapNum--;
    if(mapNum<0){
        mapNum=0
        return;
    }

    let timedelay = 0;
    if(zombies.length>0){
        timedelay = 900;
        delaying=true;
        renderGameUI();
    }
     zombieAttack(0); //맵 이동 시 좀비 공격
     setTimeout(() => { 
        if(gameOver)return;
        mapSetting(mapData[mapNum]);
        delaying=false;
        renderGameUI();
        log(`${translations[currentLang][currentMapData.name]}으로 돌아왔다. - 진행도[${mapNum+1}/${mapData.length}]`);
     },timedelay);
    
    //TurnEnd();

})
//치료버튼
bandingBt.addEventListener('click', ()=>{
    if(gameOver)return;
    if(delaying) return; //딜레이 중이면 무시

    let bool =  playerBanding();
    if(bool){
        advanceTurn();
    }else{
        log(`치료할 상처가 없습니다`);
    }
})
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
