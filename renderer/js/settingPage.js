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