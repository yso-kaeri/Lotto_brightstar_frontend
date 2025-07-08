// ========== 左侧开奖逻辑 ==========
const periodNumber = "一等奖";
let lotteryNumbers = [333, 2, 213, 888, 888];
document.getElementById('awardName').textContent = periodNumber;
const numberRow = document.getElementById('numberRow');


function pad3(n) {
    n = parseInt(n, 10);
    if (n < 10) return '00' + n;
    if (n < 100) return '0' + n;
    return '' + n;
}

function renderNumbers() {
    numberRow.innerHTML = '';

    for (let i = 0; i < lotteryNumbers.length; i++) {
        const slot = document.createElement('div');
        slot.className = 'num-slot';
        slot.textContent = '---';   // 三位数字占位
        slot.id = 'slot' + i;
        numberRow.appendChild(slot);
    }
}
renderNumbers();

// --------- 滚轮动画逐个间隔1~2秒启动 ---------
function startLotteryAnimation() {
    document.getElementById('btnStart').disabled = true;
    let slots = [];
    for (let i = 0; i < lotteryNumbers.length; i++) {
        slots.push(document.getElementById('slot' + i));
    }
    slots.forEach(slot => {
        slot.textContent = '---';
        slot.classList.remove('rolling');
    });

    // 串行动画
    let i = 0;
    function nextSlot() {
        if (i >= slots.length) {
            showWinnerNumbers();
            document.getElementById('btnStart').disabled = false;
            return;
        }
        rollSlot(slots[i], lotteryNumbers[i], 2200 - i * 180, function () {
            // 停下后随机等待1~2秒
            const delay = 1000 + Math.random() * 1000;
            setTimeout(() => {
                i++;
                nextSlot();
            }, delay);
        });
    }
    nextSlot();
    
}
function rollSlot(slot, finalNum, totalTime, cb) {
    slot.classList.add('rolling');
    let elapsed = 0;
    let frame = 0;
    function tick() {
        frame++;
        let t = elapsed / totalTime;
        if (t > 1) t = 1;
        let delay = 50 + (120 - 50) * Math.pow(t, 2.3);
        let num = Math.floor(Math.random() * 39 + 1);
        slot.textContent = pad3(num);
        if (elapsed < totalTime) {
            setTimeout(() => {
                elapsed += delay;
                tick();
            }, delay);
        } else {
            slot.textContent = pad3(finalNum);
            slot.classList.remove('rolling');
            if (cb) cb();
        }
    }
    tick();
}

document.getElementById('btnStart').onclick = function () {
    startLotteryAnimation();
};


// ========== 右侧奖品轮播 ==========
const prizes = [
    { title: "一等奖品", img: "../img/景品.png" },
    { title: "二等大奖", img: "../img/景品２.png" },
    { title: "三等奖品", img: "../img/景品３.png" }
];
let curIdx = 0;
const prizeTitle = document.getElementById('prizeTitle');
const prizeImg = document.getElementById('prizeImg');
function updatePrize() {
    prizeTitle.textContent = prizes[curIdx].title;
    prizeImg.style.opacity = 0;
    setTimeout(() => {
        prizeImg.src = prizes[curIdx].img;
        prizeImg.style.opacity = 1;
    }, 180);
    // 同步左侧数字
    lotteryNumbers = prizes[curIdx].nums;
    renderNumbers();
}
document.getElementById('arrowLeft').onclick = function () {
    curIdx = (curIdx - 1 + prizes.length) % prizes.length;
    updatePrize();
};
document.getElementById('arrowRight').onclick = function () {
    curIdx = (curIdx + 1) % prizes.length;
    updatePrize();
};



function showWinnerNumbers(){
    const winnerList = document.getElementById('winnerList');
   winnerList.innerHTML =  lotteryNumbers.map(n => 
      `<span class="winner-ball">${pad3(n)}</span>`
    ).join('');
    winnerList.style.display = 'flex'; 
}


function tosettingPage(){
    const tosettingPage = document.getElementById('setting-button')
    tosettingPage.onclick = function(){
        window.location.href = 'settingPage.html';

    }
}

tosettingPage();


