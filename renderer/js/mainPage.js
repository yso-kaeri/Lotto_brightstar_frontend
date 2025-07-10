// ========== 左侧开奖逻辑 ==========
// let lotteryNumbers = [];
// 		document.getElementById('btnStart').onclick = function () {
// 			const prize = prizes[curIdx];
// 			const totalInput = document.getElementById("totalInput").value.trim();
// 			fetch('http://localhost:8080/api/draw', {
// 				method: 'POST',
// 				headers: {'Content-Type': 'application/json'},
// 				body: JSON.stringify({
// 					prizeName: prize.prizeName,
// 					participantCount: totalInput

// 				})
// 			})
// 				.then(res => res.json())
// 				.then(result => {
// 					// result 是对象：{ winners: [...] }
// 					if (!result.winners || !Array.isArray(result.winners)) {
// 						showMsg('后端返回中奖号码格式异常！');
// 						console.error('后端返回:', result);
// 						return;
// 					}
// 					lotteryNumbers = result.winners;  // 这里是数组了
// 					document.getElementById('lastPrizeQuantity').textContent = '剩余：' + result.lastPrizeQuantity + ' 名';
// 					renderNumbers();

// 					startLotteryAnimation()


// 				})
// 				.catch(err => {
// 					showMsg("抽奖失败，请稍后再试！");
// 					console.error(err);
// 				});
// 		};
// 全局变量存人数
let participantCount = null;

// 页面加载完后绑定事件
document.addEventListener('DOMContentLoaded', function () {
  // Modal 元素
  const modal = document.getElementById('participantModal');
  const inputEl = document.getElementById('totalInput');
  const btnOpen = document.getElementById('setParticipantButton');
  const btnClose = document.getElementById('modalClose');
  const btnConfirm = document.getElementById('participantConfirmBtn');

  // 打开 modal
  btnOpen.addEventListener('click', () => {
    modal.style.display = 'block';
    inputEl.value = '';
    inputEl.focus();
  });

  // 点击 × 关闭
  btnClose.addEventListener('click', () => modal.style.display = 'none');

  // 点击空白处关闭
  window.addEventListener('click', e => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // 确定按钮：保存人数并关闭
  btnConfirm.addEventListener('click', () => {
    const v = parseInt(inputEl.value.trim(), 10);
    if (!isNaN(v) && v > 0) {
      participantCount = v;
      modal.style.display = 'none';
    } else {
      alert('请输入有效的总人数');
    }
  });

  // “开始开奖”按钮
  document.getElementById('btnStart').addEventListener('click', () => {
    if (participantCount == null) {
      alert('请先设置总参加人数');
      return;
    }
    const prize = prizes[curIdx];
    fetch('http://localhost:8080/api/draw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prizeName: prize.prizeName,
        participantCount: participantCount.toString()
      })
    })
    .then(res => res.json())
    .then(result => {
      if (!Array.isArray(result.winners)) {
        console.error('后端返回异常', result);
        alert('后端返回数据异常');
        return;
      }
      // 更新抽奖结果...
      lotteryNumbers = result.winners;
      document.getElementById('lastPrizeQuantity')
        .textContent = '剩余：' + result.lastPrizeQuantity + ' 名';
      renderNumbers();
      startLotteryAnimation();
    })
    .catch(err => {
      console.error(err);
      alert('抽奖请求失败');
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
		function startLotteryAnimation() {
			document.getElementById('btnStart').disabled = true;

			const winnerList = document.getElementById('winnerList');
			winnerList.innerHTML = ''; // 先清空




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


					showOneWinnerNumber(i);

					function showOneWinnerNumber(n) {
						// n表示当前第几个中奖号码
						const winnerList = document.getElementById('winnerList');
						// 只渲染前n+1个中奖号码
						winnerList.innerHTML = lotteryNumbers.slice(0, n + 1).map(i =>
							`<span class="winner-ball">${pad3(i)}</span>`
						).join('');
						winnerList.style.display = 'flex';
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
				let num = Math.floor(Math.random() * 1000);
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
			document.getElementById('prizeQty').textContent = '总共：' + prize.quantity + ' 名';



			// 奖品图片
			if (prize.imagePath) {
				document.getElementById('prizeImg').src = "http://localhost:8080" + prize.imagePath;
				document.getElementById('prizeImg').style.display = 'block';
			}
		}

		document.getElementById('arrowLeft').onclick = function () {
			curIdx = (curIdx - 1 + prizes.length) % prizes.length;
			showPrize(curIdx);

			winnerList.innerHTML = ''; 
			numberRow.innerHTML='';
		};
		document.getElementById('arrowRight').onclick = function () {
			curIdx = (curIdx + 1) % prizes.length;
			showPrize(curIdx);


			winnerList.innerHTML = ''; 
			numberRow.innerHTML='';
		};


		function showWinnerNumbers() {
			const winnerList = document.getElementById('winnerList');
			winnerList.innerHTML = lotteryNumbers.map(n =>
				`<span class="winner-ball">${pad3(n)}</span>`
			).join('');
			winnerList.style.display = 'flex';
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
