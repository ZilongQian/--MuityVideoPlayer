let videoCount = 1;
let isSwapMode = false;
let selectedVideos = [];
let draggedItem = null;
let currentVideoContainer = null;

const initDragAndDrop = () => {
    const videoContent = document.getElementById('videoContent');
    const containers = document.querySelectorAll('.video-container');
    
    containers.forEach(container => {
        container.addEventListener('dragstart', handleDragStart);
        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('dragenter', handleDragEnter);
        container.addEventListener('dragleave', handleDragLeave);
        container.addEventListener('drop', handleDrop);
        container.addEventListener('dragend', handleDragEnd);
        const checkbox = container.querySelector('.check-box');
        if (checkbox) checkbox.style.display = isSwapMode ? 'block' : 'none';
    });
};

const handleDragStart = function(e) {
    if (isSwapMode) return;
    draggedItem = this;
    setTimeout(() => this.classList.add('dragging'), 0);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
};

const handleDragOver = e => {
    if (isSwapMode || !draggedItem) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
};

const handleDragEnter = function(e) {
    if (isSwapMode || !draggedItem || this === draggedItem) return;
    e.preventDefault();
    this.classList.add('drop-target');
};

const handleDragLeave = function() {
    this.classList.remove('drop-target');
};

const handleDrop = function(e) {
    if (isSwapMode || !draggedItem || this === draggedItem) return;
    e.stopPropagation();
    e.preventDefault();
    this.classList.remove('drop-target');
    this.parentNode.insertBefore(draggedItem, this === draggedItem.nextSibling ? this.nextSibling : this);
};

const handleDragEnd = function() {
    this.classList.remove('dragging');
    draggedItem = null;
    document.querySelectorAll('.video-container.drop-target').forEach(el => el.classList.remove('drop-target'));
};

window.addEventListener('DOMContentLoaded', () => {
    initDragAndDrop();
    setThemeByTime();
    setInterval(setThemeByTime, 60000);
});

const setThemeByTime = () => {
    const hour = new Date().getHours();
    document.body.classList.toggle('night-mode', hour < 6 || hour >= 18);
};

const toggleVideoSelection = checkbox => {
    const container = checkbox.closest('.video-container');
    checkbox.classList.toggle('checked');
    container.classList.toggle('selected');
    const index = selectedVideos.indexOf(container);
    selectedVideos = index === -1 ? [...selectedVideos, container] : selectedVideos.filter((_, i) => i !== index);
    document.getElementById('swapBtn').disabled = selectedVideos.length !== 2;
};

const toggleDragMode = () => {
    const dragBtn = document.getElementById('dragModeBtn');
    const isDraggable = document.querySelector('.video-container').draggable;
    dragBtn.textContent = isDraggable ? '启用拖拽' : '禁用拖拽';
    document.querySelectorAll('.video-container').forEach(container => {
        container.draggable = !isDraggable;
        container.style.cursor = isDraggable ? 'auto' : 'grab';
        container.querySelector('video').style.pointerEvents = isDraggable ? 'auto' : 'none';
        container.querySelectorAll('button').forEach(btn => btn.style.pointerEvents = isDraggable ? 'auto' : 'none');
    });
};

const toggleSwapMode = () => {
    isSwapMode = !isSwapMode;
    const swapBtn = document.getElementById('swapModeBtn');
    swapBtn.textContent = isSwapMode ? '退出交换' : '启用交换';
    swapBtn.classList.toggle('active', isSwapMode);
    document.querySelectorAll('.check-box').forEach(checkbox => checkbox.style.display = isSwapMode ? 'block' : 'none');
    document.querySelectorAll('.video-container').forEach(container => container.draggable = !isSwapMode);
    if (!isSwapMode) {
        selectedVideos = [];
        document.querySelectorAll('.video-container.selected').forEach(el => el.classList.remove('selected'));
        document.getElementById('swapBtn').disabled = true;
    }
};

const swapSelectedVideos = () => {
    if (selectedVideos.length !== 2) return;
    const [first, second] = selectedVideos;
    const temp = document.createElement('div');
    first.parentNode.insertBefore(temp, first);
    second.parentNode.insertBefore(first, second);
    temp.parentNode.insertBefore(second, temp);
    temp.remove();
    selectedVideos = [];
    document.getElementById('swapBtn').disabled = true;
    initDragAndDrop();
};

const addVideo = (button, position) => {
    const videoContainer = button.closest('.video-container');
    const newVideoContainer = document.createElement('div');
    videoCount++;
    newVideoContainer.className = 'video-container';
    newVideoContainer.draggable = true;
    newVideoContainer.innerHTML = `
        <button class="source-btn fixed-icon" title="设置视频源" onclick="showSourceDialog(this)">✎</button>
        <button class="add-button top fixed-icon" onclick="addVideo(this, 'top')">+</button>
        <button class="add-button bottom fixed-icon" onclick="addVideo(this, 'bottom')">+</button>
        <button class="add-button left fixed-icon" onclick="addVideo(this, 'left')">+</button>
        <button class="add-button right fixed-icon" onclick="addVideo(this, 'right')">+</button>
        <button class="check-box fixed-icon" onclick="toggleVideoSelection(this)" style="display: ${isSwapMode ? 'block' : 'none'}">✓</button>
        <button class="delete-btn fixed-icon" title="删除视频" onclick="removeVideo(this)">×</button>
        <video controls><source src="video${videoCount}.mp4" type="video/mp4"></video>
    `;
    videoContainer.parentNode.insertBefore(newVideoContainer, position === 'top' ? videoContainer : videoContainer.nextSibling);
    newVideoContainer.querySelector('video').play().catch(console.log);
    initDragAndDrop();
};

const removeVideo = button => {
    const videoContainer = button.closest('.video-container');
    if (document.querySelectorAll('.video-container').length <= 1) return alert('至少需要保留一个视频播放器');
    if (confirm('确定要删除这个视频吗？')) videoContainer.remove();
};

const controlAllVideos = action => {
    document.querySelectorAll('.video-container video').forEach(video => {
        if (action === 'play') video.play();
        if (action === 'pause') video.pause();
        if (action === 'stop') { video.pause(); video.currentTime = 0; }
        if (action === 'mute') video.muted = true;
        if (action === 'unmute') video.muted = false;
    });
};

const setAllVolume = volume => {
    document.querySelectorAll('.video-container video').forEach(video => video.volume = volume);
};

const showSourceDialog = button => {
    currentVideoContainer = button.closest('.video-container');
    document.getElementById('sourceInput').value = currentVideoContainer.querySelector('source')?.src || '';
    document.getElementById('sourceDialog').style.display = 'block';
};

const hideSourceDialog = () => {
    document.getElementById('sourceDialog').style.display = 'none';
    currentVideoContainer = null;
};

const confirmSource = () => {
    if (!currentVideoContainer) return;
    const sourceInput = document.getElementById('sourceInput').value.trim();
    if (!sourceInput) return alert('请输入有效的视频路径或URL');
    
    const video = currentVideoContainer.querySelector('video');
    while(video.firstChild) video.removeChild(video.firstChild);
    if (video._hls) video._hls.destroy();
    
    if (sourceInput.includes('.m3u8') && Hls.isSupported()) {
        const hls = new Hls();
        hls.attachMedia(video);
        hls.on(Hls.Events.MEDIA_ATTACHED, () => hls.loadSource(sourceInput));
        video._hls = hls;
    } else {
        const source = document.createElement('source');
        source.src = sourceInput;
        source.type = sourceInput.startsWith('http') ? 'video/mp4' : `video/${sourceInput.split('.').pop()}`;
        video.appendChild(source);
        video.load();
    }
    hideSourceDialog();
};

const browseVideoFile = () => {
    document.getElementById('fileInput').click();
    document.getElementById('fileInput').onchange = e => {
        const file = e.target.files[0];
        if (file) document.getElementById('sourceInput').value = file.path || file.name;
    };
};

const toggleContainerButtons = () => {
    const isVisible = document.querySelector('.source-btn').style.display !== 'none';
    document.querySelectorAll('.source-btn, .add-button, .delete-btn').forEach(btn => btn.style.display = isVisible ? 'none' : 'flex');
    document.getElementById('toggleControlsBtn').textContent = isVisible ? '显示按钮' : '隐藏按钮';
};