// function deleteCompletely(prizeName, buttonElement) {
//     if (!confirm(`本当に "${prizeName}" を削除しますか？`)) {
//         return;
//     }

//     $.ajax({
//         url: '/prize/delete',
//         type: 'DELETE',
//         data: { name: prizeName },
//         success: function (response) {
//             // 移除該筆資料的 <tr>
//             $(buttonElement).closest('tr').remove();
//             alert(`"${prizeName}" を削除しました！`);
//         },
//         error: function (xhr, status, error) {
//             console.error("削除失敗:", error);
//             alert(`"${prizeName}" の削除に失敗しました...`);
//         }
//     });
// }

// document.getElementById('uploadBtn').addEventListener('click', function () {
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
//     .then(() => {
//         alert('アップロード成功！');

//         // 上传成功后，重新拉取最新列表并更新页面
//         fetch('http://localhost:8080/prizes') 
//             .then(res => res.json())
//             .then(prizes => {
//                 const tbody = document.querySelector('table tbody');
//                 tbody.innerHTML = '';  // 清空旧内容

//                 prizes.forEach(prize => {
//                     const tr = document.createElement('tr');
//                     tr.innerHTML = `
//                         <td>${prize.prizeName}</td>
//                         <td>${prize.quantity}</td>
//                         <td><img src="${prize.imagePath}" width="100" /></td>
//                         <td>
//                             <button type="button" class="btn btn-primary" data-name="${prize.prizeName}"
//                                 onclick="deleteCompletely('${prize.prizeName}', this)">削除</button>
//                         </td>
//                     `;
//                     tbody.appendChild(tr);
//                 });

//                 form.reset();
//             })
//             .catch(err => {
//                 console.error('奖品列表更新失败', err);
//                 alert('賞品のリストを更新できませんでした');
//             });
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

        // 上传成功后，前端同步拉取最新奖品列表并更新表格
        fetch('http://localhost:8080/prizes')
            .then(res => res.json())
            .then(prizes => {
                const tbody = document.querySelector('table tbody');
                tbody.innerHTML = ''; // 清空旧内容

                prizes.forEach(prize => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${prize.prizeName}</td>
                        <td>${prize.quantity}</td>
                        <td><img src="http://localhost:8080${prize.imagePath}" width="100"></td>
                        <td>
                            <button type="button" class="btn btn-primary" onclick="deletePrize('${prize.prizeName}', this)">削除</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });

                form.reset();
            })
            .catch(err => {
                console.error('賞品リスト更新失敗', err);
                alert('賞品リスト更新失敗');
            });
    })
    .catch(error => {
        console.error(error);
        alert('アップロード失敗');
    });
});

function deletePrize(prizeName, button) {
    if (!confirm(`"${prizeName}" を本当に削除しますか？`)) {
        return;
    }

    const params = new URLSearchParams();
    params.append('prizeName', prizeName);

    fetch('http://localhost:8080/prize/delete?' + params.toString(), {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('削除失敗');
        }
        // 前端立即从表中移除行
        const tr = button.closest('tr');
        tr.remove();
        alert(`"${prizeName}" を削除しました！`);
    })
    .catch(error => {
        console.error(error);
        alert(`"${prizeName}" の削除に失敗しました`);
    });
}



