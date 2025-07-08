function deleteCompletely(prizeName, buttonElement) {
			if (!confirm(`本当に "${prizeName}" を削除しますか？`)) {
				return;
			}

			$.ajax({
				url: '/prize/delete',
				type: 'DELETE',
				data: {name: prizeName},
				success: function (response) {
					// 移除該筆資料的 <tr>
					$(buttonElement).closest('tr').remove();
					alert(`"${prizeName}" を削除しました！`);
				},
				error: function (xhr, status, error) {
					console.error("削除失敗:", error);
					alert(`"${prizeName}" の削除に失敗しました...`);
				}
			});
		}

// 		document.getElementById('uploadBtn').addEventListener('click', function () {
//     const form = document.getElementById('uploadForm');
//     const formData = new FormData(form);

//     fetch('http://localhost:8080/uploadPrize', {
//         method: 'POST',
//         body: formData
//     })
//     .then(response => {
//         if (!response.ok) {
//             throw new Error('アップロード失敗');
//         }
//         return response.text();
//     })
//     .then(data => {
//         alert('アップロード成功！');
//         location.reload(); // 成功后刷新列表
//     })
//     .catch(error => {
//         console.error(error);
//         alert('アップロード失敗...');
//     });
// });
document.getElementById('uploadBtn').addEventListener('click', function () {
    const form = document.getElementById('uploadForm');
    const formData = new FormData(form);

    fetch('http://localhost:8080/uploadPrize', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('アップロード失敗');
        }
        return response.text();
    })
    .then(() => {
        alert('アップロード成功！');

        // 上传成功后，重新拉取最新列表并更新页面
        fetch('http://localhost:8080/prizes') 
            .then(res => res.json())
            .then(prizes => {
                const tbody = document.querySelector('table tbody');
                tbody.innerHTML = '';  // 清空旧内容

                prizes.forEach(prize => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${prize.prizeName}</td>
                        <td>${prize.quantity}</td>
                        <td><img src="${prize.imagePath}" width="100" /></td>
                        <td>
                            <button type="button" class="btn btn-primary" data-name="${prize.prizeName}"
                                onclick="deleteCompletely('${prize.prizeName}', this)">削除</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });

                form.reset();
            })
            .catch(err => {
                console.error('奖品列表更新失败', err);
                alert('賞品のリストを更新できませんでした');
            });
    })
    .catch(error => {
        console.error(error);
        alert('アップロード失敗...');
    });
});





