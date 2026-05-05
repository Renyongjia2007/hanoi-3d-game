class HanoiGame {
    constructor() {
        // 游戏状态（题目要求的结构）
        this.gameState = {
            disksCount: 3,
            pegs: [[], [], []], // 三个钉子的圆盘栈
            moveCount: 0,
            isAutoSolving: false,
            selectedPegIndex: null,
            selectedDiskSize: null
        };

        // DOM元素
        this.diskCountInput = document.getElementById('diskCount');
        this.diskSlider = document.getElementById('diskSlider');
        this.resetBtn = document.getElementById('resetBtn');
        this.autoSolveBtn = document.getElementById('autoSolveBtn');
        this.moveCountSpan = document.getElementById('moveCount');
        this.warningMsg = document.getElementById('warningMsg');
        this.board = document.querySelector('.board');
        this.pegs = document.querySelectorAll('.peg');

        // 绑定事件
        this.bindEvents();
        // 初始化游戏
        this.init(3);
    }

    // 初始化游戏
    init(disksCount) {
        this.gameState.disksCount = disksCount;
        this.gameState.pegs = [[], [], []];
        this.gameState.moveCount = 0;
        this.gameState.isAutoSolving = false;
        this.gameState.selectedPegIndex = null;
        this.gameState.selectedDiskSize = null;

        // 初始化钉子A的圆盘（题目要求的数组操作）
        for (let i = disksCount; i >= 1; i--) {
            this.gameState.pegs[0].push(i);
        }

        this.render();
        this.updateControls();
    }

    // 渲染棋盘（forEach遍历圆盘）
    render() {
        // 清空所有钉子
        this.pegs.forEach(peg => peg.innerHTML = '');

        // 遍历每个钉子，渲染圆盘
        this.gameState.pegs.forEach((stack, pegIndex) => {
            stack.forEach((diskSize, stackIndex) => {
                const disk = document.createElement('div');
                disk.className = 'disk';
                disk.dataset.size = diskSize;
                disk.dataset.peg = pegIndex;

                // 宽度与大小成正比（最小60px，最大180px）
                const width = 60 + (diskSize - 1) * (120 / this.gameState.disksCount);
                disk.style.width = `${width}px`;

                // 彩虹色区分圆盘
                const hue = (diskSize / this.gameState.disksCount) * 360;
                disk.style.background = `linear-gradient(to bottom, hsl(${hue}, 100%, 60%), hsl(${hue}, 100%, 40%))`;

                this.pegs[pegIndex].appendChild(disk);
            });
        });

        this.moveCountSpan.textContent = this.gameState.moveCount;
    }

    // 绑定事件处理
    bindEvents() {
        // 圆盘数量同步
        this.diskCountInput.addEventListener('change', () => {
            const count = parseInt(this.diskCountInput.value);
            if (count >=3 && count <=8) {
                this.diskSlider.value = count;
                this.init(count);
            }
        });

        this.diskSlider.addEventListener('input', () => {
            const count = parseInt(this.diskSlider.value);
            this.diskCountInput.value = count;
            this.init(count);
        });

        // 重置按钮
        this.resetBtn.addEventListener('click', () => {
            this.init(this.gameState.disksCount);
        });

        // 自动解题按钮
        this.autoSolveBtn.addEventListener('click', () => {
            if (!this.gameState.isAutoSolving) {
                this.startAutoSolve();
            }
        });

        // 点击钉子选择/放置圆盘
        this.pegs.forEach((peg, index) => {
            peg.addEventListener('click', (e) => {
                if (this.gameState.isAutoSolving) return;
                this.handlePegClick(index);
            });
        });
    }

    // 处理钉子点击
    handlePegClick(pegIndex) {
        const stack = this.gameState.pegs[pegIndex];

        // 第一次点击：选择钉子顶部的圆盘
        if (this.gameState.selectedPegIndex === null) {
            if (stack.length === 0) {
                this.showWarning('这个钉子上没有圆盘！');
                return;
            }
            this.gameState.selectedPegIndex = pegIndex;
            this.gameState.selectedDiskSize = stack[stack.length - 1];
            return;
        }

        // 第二次点击：尝试放置圆盘
        const fromIndex = this.gameState.selectedPegIndex;
        const diskSize = this.gameState.selectedDiskSize;

        if (this.isValidMove(fromIndex, pegIndex)) {
            this.executeMove(fromIndex, pegIndex);
            this.checkWin();
        } else {
            this.showWarning('不能把大圆盘放在小圆盘上！');
        }

        // 重置选择状态
        this.gameState.selectedPegIndex = null;
        this.gameState.selectedDiskSize = null;
    }

    // 验证移动是否有效
    isValidMove(fromIndex, toIndex) {
        if (fromIndex === toIndex) return false;
        const fromStack = this.gameState.pegs[fromIndex];
        const toStack = this.gameState.pegs[toIndex];
        if (fromStack.length === 0) return false;
        const diskSize = fromStack[fromStack.length - 1];
        return toStack.length === 0 || toStack[toStack.length - 1] > diskSize;
    }

    // 执行移动（push/pop数组方法）
    executeMove(fromIndex, toIndex) {
        const disk = this.gameState.pegs[fromIndex].pop();
        this.gameState.pegs[toIndex].push(disk);
        this.gameState.moveCount++;
        this.render();
    }

    // 检查是否胜利
    checkWin() {
        if (this.gameState.pegs[2].length === this.gameState.disksCount) {
            this.showVictory();
        }
    }

    // 显示胜利效果
    showVictory() {
        this.board.classList.add('victory');
        setTimeout(() => {
            alert(`恭喜！你用了 ${this.gameState.moveCount} 步完成了河内塔！`);
            this.board.classList.remove('victory');
        }, 500);
    }

    // 显示警告信息
    showWarning(msg) {
        this.warningMsg.textContent = msg;
        this.warningMsg.classList.add('show');
        setTimeout(() => this.warningMsg.classList.remove('show'), 1000);
    }

    // 更新控制按钮状态
    updateControls() {
        this.resetBtn.disabled = this.gameState.isAutoSolving;
        this.autoSolveBtn.disabled = this.gameState.isAutoSolving;
        this.diskCountInput.disabled = this.gameState.isAutoSolving;
        this.diskSlider.disabled = this.gameState.isAutoSolving;
    }

    // 自动解题（递归+setTimeout延迟）
    async startAutoSolve() {
        this.gameState.isAutoSolving = true;
        this.updateControls();
        this.pegs.forEach(peg => peg.style.pointerEvents = 'none');

        // 递归汉诺塔算法
        const solve = async (n, from, to, aux) => {
            if (n === 0) return;
            await solve(n - 1, from, aux, to);
            await this.sleep(500); // 延迟0.5秒
            this.executeMove(from, to);
            await solve(n - 1, aux, to, from);
        };

        await solve(this.gameState.disksCount, 0, 2, 1);
        this.checkWin();

        this.gameState.isAutoSolving = false;
        this.updateControls();
        this.pegs.forEach(peg => peg.style.pointerEvents = 'auto');
    }

    // 睡眠延迟函数
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 页面加载完成后初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    new HanoiGame();
});
