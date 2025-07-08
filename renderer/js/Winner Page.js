// 假设后端接口返回的数据如下（实际项目中可用fetch/ajax去请求）
    // 你可以把这里的数据替换成你从后端接口获取到的数据
    const winners = [
      {winnerId: '1001', prizeName: '一等奖'},
	   {winnerId: '1002', prizeName: '一等奖'},
	    {winnerId: '1003', prizeName: '一等奖'},
      {winnerId: '1022', prizeName: '二等奖'},
	  {winnerId: '1023', prizeName: '二等奖'},
	  {winnerId: '1023', prizeName: '二等奖'},
	  {winnerId: '1023', prizeName: '二等奖'},
	  {winnerId: '1023', prizeName: '二等奖'},
	  {winnerId: '1023', prizeName: '二等奖'},
	  {winnerId: '1023', prizeName: '二等奖'},
	  {winnerId: '1023', prizeName: '二等奖'},{winnerId: '1023', prizeName: '二等奖'},
	  {winnerId: '1023', prizeName: '二等奖'},
	  {winnerId: '1023', prizeName: '二等奖'},
	  {winnerId: '1023', prizeName: '二等奖'},
	  {winnerId: '1024', prizeName: '二等奖'},
      {winnerId: '1344', prizeName: '三等奖'},
	  {winnerId: '1343', prizeName: '三等奖'},
	  {winnerId: '1352', prizeName: '三等奖'},
	  {winnerId: '1354', prizeName: '三等奖'},
    ];

    //根据奖项分组,循环
	const groupPrize={};
	winners.forEach(w => {
    if (!groupPrize[w.prizeName]) groupPrize[w.prizeName] = [];
    groupPrize[w.prizeName].push(w.winnerId);
  });

  //渲染
const tbody = document.getElementById('winnerTbody');
let html = '';
if (winners.length === 0) {
  html = '<tr><td>今、当選者がいません</td></tr>';
} else {
  Object.keys(groupPrize).forEach(prize => {
    // 奖项标题行
    html += `<tr class="table-primary"><td colspan="10"><strong>${prize}</strong></td></tr>`;

    // 该奖项所有中奖号
    const winnersArr = groupPrize[prize];
    const maxPerRow = 8; // 一行显示多少个中奖号，你可以改成5、10等

    for(let i=0; i<winnersArr.length; i+=maxPerRow){
      html += '<tr>';
      // slice取出这一行要显示的中奖号
      const rowWinners = winnersArr.slice(i, i+maxPerRow);
      rowWinners.forEach(winnerId => {
        html += `<td>${winnerId}</td>`;
      });
      html += '</tr>';
    }
  });
}
tbody.innerHTML = html;
