
// 全局变量存人数
let participantCount = null;
let winnersMap = {};
let excludeInput = '';

//全局变量保存总抽奖人数
let allpeople = 0;

// Try to load winners from sessionStorage on startup
const savedWinners = sessionStorage.getItem('winnersMap');
if (savedWinners) {
	winnersMap = JSON.parse(savedWinners);
}

// 页面加载完后绑定事件
document.addEventListener('DOMContentLoaded', function () {
	// Modal 元素
	const modal = document.getElementById('participantModal');
	const inputEl = document.getElementById('totalInput');
	const btnOpen = document.getElementById('setParticipantButton');
	const btnClose = document.getElementById('modalClose');
	const btnConfirm = document.getElementById('participantConfirmBtn');

	//读取浏览器里存的抽奖人数
	const savedCount = localStorage.getItem('participantCount');
	if (savedCount) {
		participantCount = parseInt(savedCount, 10);
		console.log('已恢复人数为：', participantCount);
		allpeople = participantCount
	}

	// 打开 modal
	btnOpen.addEventListener('click', () => {
		modal.style.display = 'block';
		const savedCount = localStorage.getItem('participantCount');
		// inputEl.value = '';
		//让人数设置输入框自动带上上次选择的值
		inputEl.value = savedCount ? savedCount : '';
		inputEl.focus();
		const excludeInputEl = document.getElementById('excludeInput');
		const savedExclude = localStorage.getItem('excludeInput');
		excludeInputEl.value = savedExclude ? savedExclude : excludeInput;
	});

	// 点击 × 关闭
	btnClose.addEventListener('click', () => modal.style.display = 'none');

	// 点击空白处关闭
	window.addEventListener('click', e => {
		if (e.target === modal) modal.style.display = 'none';
	});

	// // 确定按钮：保存人数并关闭
	// btnConfirm.addEventListener('click', () => {
	// 	const v = parseInt(inputEl.value.trim(), 10);
	// 	if (!isNaN(v) && v > 0) {
	// 		participantCount = v;
	// 		//将设置的抽奖人数放入浏览器缓存, 将不需要重复设置抽奖人数
	// 		localStorage.setItem('participantCount', v);
	// 		modal.style.display = 'none';
	// 	} else {
	// 		showMsg('参加する総人数を設定してください');
	// 	}
	// });

	// 确定按钮：保存人数和不参加番号并关闭
	btnConfirm.addEventListener('click', () => {
		const v = parseInt(inputEl.value.trim(), 10);
		const excludeInputEl = document.getElementById('excludeInput');
		const excludeVal = excludeInputEl.value.trim();
		if (!isNaN(v) && v > 0) {
			participantCount = v;
			localStorage.setItem('participantCount', v);

			// 新增：保存不参加番号
			excludeInput = excludeVal;
			localStorage.setItem('excludeInput', excludeInput);

			modal.style.display = 'none';
		} else {
			showMsg('参加する総人数を設定してください');
		}
	});

		// 校验 excludeInput 只能输入数字和分号
		document.getElementById('excludeInput').addEventListener('input', function () {
			const val = this.value;
			const valid = /^(\d+;)*\d*$/.test(val);
			document.getElementById('excludeError').style.display = valid ? 'none' : 'inline';
		});

		// 716点击“決定”按钮时保存输入
		document.getElementById('participantConfirmBtn').addEventListener('click', function () {
		const total = document.getElementById('totalInput').value;
		const exclude = document.getElementById('excludeInput').value;
		if (!total || isNaN(total) || total < 1) {
			alert('请输入有效的总人数');
			return;
		}
		if (!/^(\d+;)*\d*$/.test(exclude)) {
			alert('不参加名单格式错误，只能输入数字和分号');
			return;
		}
		participantCount = total;
		excludeInput = exclude;
		document.getElementById('participantModal').style.display = 'none';
	});

// “开始开奖”按钮
document.getElementById('btnStart').addEventListener('click', () => {
	// 每次抽奖前都从 localStorage 读取，保证只需设置一次即可
	const savedCount = localStorage.getItem('participantCount');
	const savedExclude = localStorage.getItem('excludeInput');
	participantCount = savedCount ? parseInt(savedCount, 10) : null;
	excludeInput = savedExclude ? savedExclude : '';
	allpeople = participantCount;

	// Hide welcome animation
	const welcomeAnimation = document.getElementById('welcomeAnimation');
	if (welcomeAnimation) {
		welcomeAnimation.style.display = 'none';
	}

	if (participantCount == null) {
		showMsg('参加する総人数を设置してください');
		return;
	}
	const prize = prizes[curIdx];
	const prizeName = prize.prizeName;
	fetch('http://localhost:8080/api/draw', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			prizeName: prize.prizeName,
			participantCount: participantCount.toString(),
			excludeInput: excludeInput
		})
	})
		.then(res => res.json())
		.then(result => {
			if (!Array.isArray(result.winners)) {
				console.error('バックエンド返却異常', result);
				showMsg('異常が発生しました');
				return;
			}
			if (!winnersMap[prizeName]) {
				winnersMap[prizeName] = [];
			}

			// 把這次抽出的號碼加進去（累加）
			winnersMap[prizeName] = winnersMap[prizeName].concat(result.winners);
			// Save updated winners map to sessionStorage
			sessionStorage.setItem('winnersMap', JSON.stringify(winnersMap));

			disableAllButtons();
			// 更新抽奖结果...
			lotteryNumbers = result.winners;
			document.getElementById('lastPrizeQuantity')
				.textContent = '残り：' + result.lastPrizeQuantity + ' 名';
			renderNumbers();
			startLotteryAnimation(() => {
				enableAllButtons();
			})
		})
		.catch(err => {
			console.error(err);
			showMsg('抽選の請求が異常になりました');
		});
});
});


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


// --------- 滚轮动画逐个间隔1~2秒启动 ---------
function startLotteryAnimation(done) {

	document.getElementById('btnStart').disabled = true;

	const winnerList = document.getElementById('winnerList');
	// winnerList.innerHTML = ''; // 先清空

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

			// Play confetti animation
			const confettiAnimation = document.getElementById('confettiAnimation');
			confettiAnimation.stop();
			confettiAnimation.style.display = 'block';
			confettiAnimation.play();

			confettiAnimation.addEventListener('complete', () => {
				confettiAnimation.style.display = 'none';
			}, { once: true });



			if (done) done(); // 执行回调

			return;
		}
		rollSlot(slots[i], lotteryNumbers[i], 2200 - i * 180, function () {
			showOneWinnerNumber(i);
		function showOneWinnerNumber(n) {
				const prizeName = prizes[curIdx].prizeName;
				const allWinners = winnersMap[prizeName] || [];
				const winnerList = document.getElementById('winnerList');

				// 顯示前 allWinners.length + 新抽出的前 n+1 顆
				const shown = allWinners.slice(0, allWinners.length - lotteryNumbers.length + n + 1);
				winnerList.innerHTML = shown.map(num =>
					`<span class="winner-ball">${pad3(num)}</span>`
				).join('');
				winnerList.style.display = 'flex';

				// 自动滚动逻辑（平滑动画，渲染后执行）
				if (shown.length > 5) {
					startWinnerListMarquee();
				} else {
					stopWinnerListMarquee();
					winnerList.scrollLeft = 0;
				}
			}
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
	function tick() {


		let t = elapsed / totalTime;
		if (t > 1) t = 1;
		let delay = 50 + (120 - 50) * Math.pow(t, 2.3);
		// let num = Math.floor(Math.random() * 1000);
		let num = Math.floor(Math.random() * allpeople) + 1; 

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

// ========== 右侧奖品轮播 ==========
let prizes = [];
let curIdx = 0;

window.onload = function () {
	fetch('http://localhost:8080/api/getAllPrize')
		.then(res => res.json())
		.then(data => {
			prizes = data;

			showPrize(curIdx);  // 只显示第一个奖项
		});
}

function showPrize(idx) {
	console.log("showPrize idx=", idx, prizes[idx]);
	if (!prizes[idx]) return;
	const prize = prizes[idx];
	document.getElementById('prizeTitle').textContent = prize.prizeName;
	document.getElementById('awardName').textContent = prize.prizeName;
	document.getElementById('prizeQty').textContent = '当選枠：' + prize.quantity + ' 名';



	// 奖品图片
	if (prize.imagePath) {
		document.getElementById('prizeImg').src = "http://localhost:8080" + prize.imagePath;
		document.getElementById('prizeImg').style.display = 'block';
	}
}

document.getElementById('arrowLeft').onclick = function () {
	curIdx = (curIdx - 1 + prizes.length) % prizes.length;
	handlePrizeSwitch();
};

document.getElementById('arrowRight').onclick = function () {
	curIdx = (curIdx + 1) % prizes.length;
	handlePrizeSwitch();
};

function handlePrizeSwitch() {
	showPrize(curIdx);
	const prize = prizes[curIdx];
	const prizeName = prize.prizeName;
	const totalQuantity = prize.quantity;
	const existingWinners = winnersMap[prizeName] || [];
	const welcomeAnimation = document.getElementById('welcomeAnimation');
	const celebrationBackground = document.getElementById('celebrationBackground');

	// Clear the temporary rolling number display
	numberRow.innerHTML = '';

	// Update the remaining quantity display
	const remaining = totalQuantity - existingWinners.length;
	document.getElementById('lastPrizeQuantity').textContent = '残り：' + remaining + ' 名';

	if (remaining <= 0) {
		// Prize is FULL. Show the final winner list and its background, hide the welcome animation.
		if (welcomeAnimation) welcomeAnimation.style.display = 'none';
		if (celebrationBackground) celebrationBackground.style.display = 'block';
		showWinnerNumbers(); // This function populates the winnerList
	} else {
		// Prize is NOT full. Show the welcome animation, hide the winner list and its background.
		if (welcomeAnimation) welcomeAnimation.style.display = 'block';
		if (celebrationBackground) celebrationBackground.style.display = 'none';
		winnerList.innerHTML = ''; // Explicitly hide the list for the next draw
	}
	
	stopWinnerListMarquee();
}

function showWinnerNumbers() {
	const prizeName = prizes[curIdx].prizeName;
	const allWinners = winnersMap[prizeName] || [];
	const winnerList = document.getElementById('winnerList');
	winnerList.innerHTML = allWinners.map(n =>
		`<span class="winner-ball">${pad3(n)}</span>`
	).join('');
	winnerList.style.display = 'flex';
	// 自动滚动逻辑（平滑动画，渲染后执行）
	if (allWinners.length > 5) {
		startWinnerListMarquee();
	} else {
		stopWinnerListMarquee();
		winnerList.scrollLeft = 0;
	}
}

document.getElementById('setting-button').addEventListener('click', function () {
	window.location.href = 'settingPage.html';
});


document.getElementById('winner-button').addEventListener('click', function () {
	window.location.href = 'winnersPage.html';
});

document.addEventListener('DOMContentLoaded', function () {
	const participantModal = document.getElementById('participantModal');
	const participantInput = document.getElementById('participantInput');
	const participantConfirmBtn = document.getElementById('participantConfirmBtn');
	const modalClose = document.getElementById('modalClose');

	document.getElementById('setParticipantButton').addEventListener('click', function () {
		participantModal.style.display = 'block';
		participantInput.value = '';
		participantInput.focus();
	});

	modalClose.addEventListener('click', function () {
		participantModal.style.display = 'none';
	});

	participantConfirmBtn.addEventListener('click', function () {
		const inputVal = parseInt(participantInput.value, 10);
		if (!isNaN(inputVal) && inputVal > 0) {
			console.log('参加人数：', inputVal);
			participantModal.style.display = 'none';
		} else {
			showMsg('有効な数字を入力してください');
		}
	});

	window.addEventListener('click', function (event) {
		if (event.target === participantModal) {
			participantModal.style.display = 'none';
		}
	});
});

// 弹窗逻辑js
function showMsg(text, color = '#27ae60') {
	const bar = document.getElementById('msgBar');
	bar.textContent = text;
	bar.style.background = color;
	bar.style.display = 'block';
	setTimeout(() => {
		bar.style.display = 'none';
	}, 1000);
}

// 自动滚动
let winnerListScrollTimer = null;

function startWinnerListMarquee() {
	const winnerList = document.getElementById('winnerList');
	if (!winnerList) return;
	stopWinnerListMarquee(); // 防止重复定时器

	const scrollStep = 1.5; // 每次滚动的像素
	const interval = 50; // 滚动间隔，越小越快

	let direction = 1; // 1往右，-1往左
			//新增左右滾動判斷
	function scroll() {
				if (winnerList.scrollWidth <= winnerList.clientWidth + 2) return;

				// 邊界判斷，遇右邊界反轉方向
				if (winnerList.scrollLeft + winnerList.clientWidth >= winnerList.scrollWidth - 1) {
					direction = -1;
				}
				// 遇左邊界反轉方向
				else if (winnerList.scrollLeft <= 0) {
					direction = 1;
				}
				winnerList.scrollLeft += direction * scrollStep;
			}
			winnerListScrollTimer = setInterval(scroll, interval);
		}

function stopWinnerListMarquee() {
	if (winnerListScrollTimer) {
		clearInterval(winnerListScrollTimer);
		winnerListScrollTimer = null;
	}
}

// 禁用页面所有按钮
function disableAllButtons() {
	const btns = document.querySelectorAll('button');
	btns.forEach(btn => btn.disabled = true);
}


// 恢复页面所有按钮
function enableAllButtons() {
	const btns = document.querySelectorAll('button');
	btns.forEach(btn => btn.disabled = false);
}

// document.getElementById('minBtn').onclick = function () {
//     window.electronAPI.minimize();
// };
document.getElementById('closeBtn').onclick = function () {
	window.electronAPI.close();
};
document.addEventListener('DOMContentLoaded', function () {
	const coverBtn = document.getElementById('coverStartBtn');
	const coverMask = document.getElementById('cover-mask');
	if (coverBtn && coverMask) {
		coverBtn.onclick = function () {
			coverMask.style.opacity = 0;
			setTimeout(() => {
				coverMask.style.display = 'none';
			}, 600);
		};
	}
});
function drawStar(ctx, x, y, r, color) {
	ctx.save();
	ctx.beginPath();
	ctx.translate(x, y);
	ctx.moveTo(0, -r);
	for (let i = 0; i < 8; i++) {
		ctx.rotate(Math.PI / 4);
		ctx.lineTo(0, -r * 0.45);
		ctx.rotate(Math.PI / 4);
		ctx.lineTo(0, -r);
	}
	ctx.closePath();
	ctx.fillStyle = color;
	ctx.globalAlpha = 0.7;
	ctx.shadowColor = color;
	ctx.shadowBlur = 6;
	ctx.fill();
	ctx.restore();
}

function startLeftPanelEffect() {
	const canvas = document.getElementById('leftPanelEffect');
	if (!canvas) return;
	const panel = document.querySelector('.left-panel');
	canvas.width = panel.offsetWidth;
	canvas.height = panel.offsetHeight;
	const ctx = canvas.getContext('2d');
	const stars = [];
	for (let i = 0; i < 14; i++) {
		stars.push({
			x: Math.random() * canvas.width,
			y: Math.random() * canvas.height,
			r: 10 + Math.random() * 18,
			color: Math.random() > 0.5 ? 'rgba(247,179,166,0.18)' : 'rgba(200,200,200,0.13)',
			speed: 0.2 + Math.random() * 0.3
		});
	}
	let running = true;
	function draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		stars.forEach(star => {
			drawStar(ctx, star.x, star.y, star.r, star.color);
		});
	}
	function update() {
		stars.forEach(star => {
			star.y -= star.speed;
			if (star.y + star.r < 0) {
				star.y = canvas.height + star.r;
				star.x = Math.random() * canvas.width;
			}
		});
	}
	function animate() {
		if (!running) return;
		draw();
		update();
		requestAnimationFrame(animate);
	}
	animate();
	// 停止动画方法
	return () => { running = false; ctx.clearRect(0, 0, canvas.width, canvas.height); };
}

// 页面加载时启动动画
let stopLeftPanelEffect = null;
document.addEventListener('DOMContentLoaded', function () {
	stopLeftPanelEffect = startLeftPanelEffect();
});

// 点击抽奖按钮时停止动画
document.getElementById('btnStart').addEventListener('click', function () {
	if (stopLeftPanelEffect) stopLeftPanelEffect();
});