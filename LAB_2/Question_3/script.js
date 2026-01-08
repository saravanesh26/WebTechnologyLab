document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const todoList = document.getElementById('todo-list');

    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') return;

        const taskCard = createTaskElement(taskText);
        todoList.appendChild(taskCard);
        taskInput.value = '';
        taskInput.focus();
    }

    function createTaskElement(text) {
        const div = document.createElement('div');
        div.classList.add('task-card');
        div.draggable = true;
        div.id = 'task-' + Date.now();
        
        // Drag events
        div.addEventListener('dragstart', dragStart);
        div.addEventListener('dragend', dragEnd);

        const content = document.createElement('div');
        content.classList.add('task-content');
        content.textContent = text;

        const date = document.createElement('div');
        date.classList.add('task-date');
        const now = new Date();
        date.textContent = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;

        div.appendChild(content);
        div.appendChild(date);

        return div;
    }

    // Drag and Drop Logic
    window.allowDrop = function(ev) {
        ev.preventDefault();
        const dropZone = ev.target.closest('.column');
        if (dropZone) {
            ev.dataTransfer.dropEffect = "move";
        }
    };

    function dragStart(ev) {
        ev.dataTransfer.setData("text/plain", ev.target.id);
        ev.dataTransfer.effectAllowed = "move";
        setTimeout(() => ev.target.classList.add('dragging'), 0);
    }
    
    function dragEnd(ev) {
        ev.target.classList.remove('dragging');
    }

    window.drop = function(ev) {
        ev.preventDefault();
        const taskId = ev.dataTransfer.getData("text/plain");
        const taskElement = document.getElementById(taskId);
        const dropZone = ev.target.closest('.column');
        
        if (dropZone && taskElement) {
            const list = dropZone.querySelector('.task-list');
            list.appendChild(taskElement);
            
            // Handle Completed State
            if (dropZone.id === 'completed') {
                if (!taskElement.classList.contains('completed-task')) {
                    taskElement.classList.add('completed-task');
                    addSuccessMessage(taskElement);
                }
            } else {
                taskElement.classList.remove('completed-task');
                removeSuccessMessage(taskElement);
            }
        }
    };

    function addSuccessMessage(taskElement) {
        // Remove existing message if present
        removeSuccessMessage(taskElement);
        
        const msg = document.createElement('div');
        msg.classList.add('success-message');
        msg.textContent = 'Task Completed Successfully';
        taskElement.appendChild(msg);
    }

    function removeSuccessMessage(taskElement) {
        const existingMsg = taskElement.querySelector('.success-message');
        if (existingMsg) {
            existingMsg.remove();
        }
    }
});
