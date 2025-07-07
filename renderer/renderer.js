document.getElementById('drawBtn').addEventListener('click', async () => {
    try {
        const response = await fetch('http://localhost:8080/api/draw');
        const data = await response.json();
        document.getElementById('result').textContent = `🎉 恭喜 ${data.name} 获得 ${data.prize}`;
    } catch (err) {
        document.getElementById('result').textContent = '❌ 抽奖失败，请检查后端是否启动';
        console.error(err);
    }
});
