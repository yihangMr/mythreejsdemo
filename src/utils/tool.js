/**
 * Three.js AnimationAction 状态同步管理器
 * @param {THREE.AnimationAction} action - 动画控制句柄
 * @param {THREE.AnimationMixer} mixer - 混合器（用于管理全局更新队列）
 * @param {Set} queue - 全局帧循环更新队列 (activeMixers)
 * @param {'play'|'pause'|'toggle'|'stop'} operation - 要执行的操作
 */
export function controlAnimation(action, mixer, queue, operation) {
    if (!action || !mixer || !queue) return;

    switch (operation) {
        case 'play':
            // 核心同步：消除暂停锁，通电，入队列
            action.paused = false;
            action.play();
            queue.add(mixer);
            break;

        case 'pause':
            // 凌空暂停：设为暂停，断电，断开队列
            action.paused = true;
            queue.delete(mixer);
            break;

        case 'toggle':
            // 🌟 精准判定：当前动画是否正在“丝滑播放中”
            const isPlaying = action.isRunning() && !action.paused;

            if (isPlaying) {
                // 1. 如果正在放，那就把它“凌空暂停”
                action.paused = true;
                queue.delete(mixer);
                console.log('⏸️ 状态管理器：检测到正在播放，执行暂停');
            } else {
                // 2. 如果当前是不动状态（无论是因为 pause 还是因为 stop）
                if (!action.isRunning()) {
                    // 如果是彻底熄火了（未启动过或触发过 stop），需要完全重置状态
                    action.paused = false;
                    action.play();
                } else {
                    // 如果只是被暂停了，直接解开暂停锁，并多唤醒一次以防万一
                    action.paused = false;
                    action.play(); 
                }
                queue.add(mixer);
                console.log('▶️ 状态管理器：检测到静止/暂停，执行播放/恢复');
            }
            break;
        case 'stop':
            // 完全复位：倒带，清空暂停锁，断开队列
            action.stop();
            action.paused = false;
            queue.delete(mixer);
            break;
    }
}
