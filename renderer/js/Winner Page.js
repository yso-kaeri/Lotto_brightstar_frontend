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
