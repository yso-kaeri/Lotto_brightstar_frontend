fetch('http://localhost:8080/api/winners')
		.then(response => response.json())
		.then(winners => {
			const groupPrize = {};
			winners.forEach(w => {
				if (!groupPrize[w.prizeName]) groupPrize[w.prizeName] = [];
				groupPrize[w.prizeName].push(w.winnerId);
			});

			const tbody = document.getElementById('winnerTbody');
			let html = '';
			if (winners.length === 0) {
				html = '<tr><td>今、当選者がいません</td></tr>';
			} else {
				Object.keys(groupPrize).forEach(prize => {
					html += `<tr class="table-primary"><td colspan="10"><strong>${prize}</strong></td></tr>`;
					const winnersArr = groupPrize[prize];
					const maxPerRow = 8;

					for (let i = 0; i < winnersArr.length; i += maxPerRow) {
						html += '<tr>';
						const rowWinners = winnersArr.slice(i, i + maxPerRow);
						rowWinners.forEach(winnerId => {
							html += `<td>${winnerId}</td>`;
						});
						html += '</tr>';
					}
				});
			}
			tbody.innerHTML = html;
		})
		.catch(error => {
			console.error('載入得獎名單失敗:', error);
			document.getElementById('winnerTbody').innerHTML = '<tr><td>系統異常，請稍後再試。</td></tr>';
		});

	document.getElementById('backMainPage').onclick = function(){
    window.location.href = 'mainPage.html';
};

// document.getElementById('deleteAllBtn').addEventListener('click', function () {
// 			if (!confirm("全ての当選者を削除しますか？この操作は復元できない！")) return;

// 			fetch('http://localhost:8080/api/deleteAll', {
// 				method: 'DELETE'
// 			})
// 				.then(response => {
// 					if (!response.ok) {
// 						throw new Error("サーバーエラー/当選者データがない");
// 					}
// 					return response.text();
// 				})
// 				.then(msg => {
// 					showMsg(msg);
// 					window.location.reload();
// 				})
// 				.catch(err => {
// 					console.error('エラー:', err);
// 					showMsg('削除失敗！');
// 				});
// 		});








document.getElementById('deleteAllBtn').addEventListener('click', function () {
    // 显示自定义弹窗
    document.getElementById('Confirm').style.display = 'flex';

    // 绑定按钮事件
    document.getElementById('ConfirmYes').onclick = function() {
        document.getElementById('Confirm').style.display = 'none';
        // 这里写你的真正删除逻辑...
        // deleteAllData();



fetch('http://localhost:8080/api/deleteAll', {
				method: 'DELETE'
			})
				.then(response => {
					if (!response.ok) {
						throw new Error("サーバーエラー/当選者データがない");
					}
					return response.text();
				})
				.then(msg => {
					
					window.location.reload();
					// showMsg(msg);
				})
				.catch(err => {
					console.error('エラー:', err);
					showMsg('削除失敗！');
				});

    };
    document.getElementById('ConfirmNo').onclick = function() {
        document.getElementById('Confirm').style.display = 'none';
    };
});

















			// 弹窗逻辑js
	function showMsg(text, color = '#27ae60') {
    	const bar = document.getElementById('msgBar');
    	bar.textContent = text;
    	bar.style.background = color;
   		 bar.style.display = 'block';
    		setTimeout(() => {
       		 bar.style.display = 'none';
    		}, 3000);
}
