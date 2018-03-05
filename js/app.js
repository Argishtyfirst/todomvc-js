(function closure() {
  function qs(selector, element) {
    return (element || document).querySelector(selector);
  }

  class Task {
    constructor(title, { onDelete, onCompleted }, { id, completed = false } = {}) {
      this.id = id || Task.id++;
      this.title = title;
      this.completed = completed;

      this.$element = this.getElement();
      this.onDelete = onDelete;
      this.onCompleted = onCompleted;
    }

    getElement() {
      const li = document.createElement('li');
      li.innerHTML = ` 
        <div class="view">
          <input class="toggle" type="checkbox" ${this.completed ? 'checked' : ''}>
          <label>${this.title}</label>
          <button class="destroy"></button>
        </div>
        <input class="edit" value="${this.title}">
      `;

      qs('input.toggle', li).addEventListener('click', this.handleCompleteToggle.bind(this));
      qs('button.destroy', li).addEventListener('click', () => this.onDelete(this));

      if (this.completed) {
        li.classList.add('completed');
      }

      return li;
    }

    handleCompleteToggle(event) {
      const completed = event.currentTarget.checked;
      this.completed = completed;

      if (this.completed) {
        this.$element.classList.add('completed');
      } else {
        this.$element.classList.remove('completed');
      }

      this.onCompleted(this);
    }
  }

  Task.id = 0;

  class TodoMVC {
    constructor() {
      this.initElements();

      this.tasks = [];
    }

    initElements() {
      this.$newTaskInput = qs('input.new-todo');
      this.$tasksList = qs('.todo-list');

      this.$newTaskInput.addEventListener('keydown', this.handleNewTaskKeyDown.bind(this));
    }

    handleNewTaskKeyDown(event) {
      const { value } = this.$newTaskInput;
      if (event.key === 'Enter' && value.trim()) {
        this.addNewTask(value.trim());
        this.$newTaskInput.value = '';
      }
    }

    addNewTask(title, { completed, id } = {}) {
      const handlers = {
        onDelete: this.handleTaskDelete.bind(this),
        onCompleted: this.handleTaskCompleted.bind(this),
      };

      const task = new Task(title, handlers, { completed, id });

      this.tasks.push(task);

      this.$tasksList.prepend(task.$element);

      this.dump();
    }

    handleTaskCompleted() {
      this.dump();
    }

    handleTaskDelete(task) {
      this.$tasksList.removeChild(task.$element);
      this.tasks.splice(this.tasks.indexOf(task), 1);

      this.dump();
    }

    dump() {
      const serializedTasks =
        this.tasks.map(({ id, title, completed }) => ({ id, title, completed }));
      localStorage.setItem('tasks', JSON.stringify(serializedTasks));
    }

    restore() {
      try {
        const serializedTasks = JSON.parse(localStorage.getItem('tasks'));
        serializedTasks.forEach((task) => {
          this.addNewTask(task.title, { completed: task.completed, id: task.id });
        });

        const maxId = serializedTasks.map(({ id }) => id).sort((a, b) => b - a)[0];
        Task.id = maxId ? maxId + 1 : 0;
      } catch (e) {
        console.log('Cannot parse JSON from local storage');
      }
    }
  }

  const todo = new TodoMVC();
  todo.restore();
}(window));
