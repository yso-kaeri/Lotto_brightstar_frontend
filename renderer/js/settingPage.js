document.addEventListener('DOMContentLoaded', function () {
    loadPrizeTable();
});

function loadPrizeTable() {
    fetch('http://localhost:8080/prizes')
        .then(res => res.json())
        .then(prizes => {
            const tbody = document.getElementById('prizeTableBody');
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
        })
        .catch(err => {
            console.error('賞品リスト取得失敗', err);
            showMsg('賞品リスト取得失敗');
        });
}


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
        showMsg('アップロード成功！');

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
                showMsg('賞品リスト更新失敗');
            });
    })
    .catch(error => {
        console.error(error);
        showMsg('アップロード失敗');
    });
});


// 自定义删除弹框逻辑 

function customConfirm(msg, yesCallback, noCallback) {
    const mask = document.getElementById('Confirm');
    const msgDiv = document.getElementById('confirmText');
    const yesBtn = document.getElementById('ConfirmYes');
    const noBtn = document.getElementById('ConfirmNo');

    msgDiv.innerHTML = msg;
    mask.style.display = 'flex';

    // 清理上一次事件
    yesBtn.onclick = null;
    noBtn.onclick = null;

    yesBtn.onclick = function () {
        mask.style.display = 'none';
        if (yesCallback) yesCallback();
    };
    noBtn.onclick = function () {
        mask.style.display = 'none';
        if (noCallback) noCallback();
    };
}


function deletePrize(prizeName, button) {
    customConfirm(
        `「${prizeName}」を削除しますか？`,
        
        function(){
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
        showMsg(`"${prizeName}" を削除しました！`);
    })
    .catch(error => {
        console.error(error);
        showMsg(`"${prizeName}" の削除に失敗しました`);
    });

    
        },
        
        function(){

        }

    );


}

document.getElementById('backMainPage').onclick = function(){
    window.location.href = 'mainPage.html';
};

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








