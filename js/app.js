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
	  this.$allComplete = qs('input#toggle-all').addEventListener('change', this.changeState.bind(this));
	  this.allCompletedTasks = 0;
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
	
	allComplete(){
		this.completedTasks = 0;
		this.totalTasks = 0;
		document.querySelectorAll('ul.todo-list li').forEach(el=>{
			if(el.classList.contains('completed')){
				this.completedTasks += 1
			}
			this.totalTasks += 1;
		})
			if(this.completedTasks === this.totalTasks){
				qs('input#toggle-all').checked=true;
				this.allCompletedTasks = true;
			}else{
				qs('input#toggle-all').checked=false;
				this.allCompletedTasks = false;
			}
		console.log(this.completedTasks,this.totalTasks)
	}

    handleCompleteToggle(event) {
      const completed = event.currentTarget.checked;
      this.completed = completed;

      if (this.completed) {
        this.$element.classList.add('completed');
      } else {
        this.$element.classList.remove('completed');
      }
		
      this.allComplete()		
      this.onCompleted(this);
    }
	
	changeState(event){
		console.log(this.allCompletedTasks)
		document.querySelectorAll('ul.todo-list li').forEach(el=>{
			if(this.allCompletedTasks){
				el.classList.add('completed')
				el.childNodes[1].childNodes[1].checked=this.allCompletedTasks
			}else{
				el.classList.remove('completed')
				el.childNodes[1].childNodes[1].checked=this.allCompletedTasks
			}		
		})
		
		this.allCompletedTasks=qs('ul.todo-list li').classList.contains('completed');
	}
  }

  Task.id = 0;

  class TodoMVC {
    constructor() {
      this.initElements();

      this.tasks = [];
    }
	
	isEmpty(list){
		if(list.length === 0){
			qs('.main').classList.add('hide')  
			qs('.footer').classList.add('hide')  
		}else{
			qs('.main').classList.remove('hide')  
			qs('.footer').classList.remove('hide')    
	  }
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
	  
	  this.isEmpty(serializedTasks);
    }

    restore() {
      try {
        const serializedTasks = JSON.parse(localStorage.getItem('tasks'));
        serializedTasks.forEach((task) => {
          this.addNewTask(task.title, { completed: task.completed, id: task.id });
        });

        const maxId = serializedTasks.map(({ id }) => id).sort((a, b) => b - a)[0];
        Task.id = maxId ? maxId + 1 : 0;
		this.isEmpty(serializedTasks);
      } catch (e) {
        console.log('Cannot parse JSON from local storage');
      }
    }
  }

  const todo = new TodoMVC();
  todo.restore();
}(window));
