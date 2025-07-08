function deleteCompletely(prizeName, buttonElement) {
    if (!confirm(`本当に "${prizeName}" を削除しますか？`)) {
        return;
    }

    $.ajax({
        url: '/prize/delete',
        type: 'DELETE',
        data: { name: prizeName },
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


// document.getElementById('uploadForm').addEventListener('submit', function (e) {
//     e.preventDefault();

//     const formData = new FormData(this);

//     fetch('http://localhost:8080/uploadPrize', {
//         method: 'POST',
//         body: formData
//     })
//         .then(res => {
//             if (res.ok) {
//                 alert('上传成功');
//                 location.reload();
//             } else {
//                 alert('上传失败');
//             }
//         })
//         .catch(err => {
//             console.error(err);
//             alert('上传出错');
//         });
// });







