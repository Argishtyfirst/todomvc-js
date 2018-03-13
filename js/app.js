(function closure() {
  function qs(selector, element) {
    return (element || document).querySelector(selector);
  }


  class TodoMVC {
    constructor() {
      this.initElements();

      this.tasks = [];
      this.completedTaskList = []
    }

    clearCompleted(){      
      this.notCompleted = []
      this.deletingTasks = []
      this.tasks.forEach(el=>{
      if(el.completed!==true){
        this.notCompleted.push(el); 
      }else{
        this.deletingTasks.push(el)
      }

    })
      this.deletingTasks.forEach(el=>{
        this.handleTaskDelete(el)
      })
      this.tasks = [...this.notCompleted]
      this.dump()

    }
    
	changeState(event){
      this.tasks.forEach((el) => {
        el.completed = this.$allComplete.checked;
        if (this.$allComplete.checked) {
          qs('input.toggle', el.$element).checked = true;
          el.$element.classList.add('completed');
        } else {
          qs('input.toggle', el.$element).checked = false;
          el.$element.classList.remove('completed');
        }
      });
    this.allCompletedTasks=qs('ul.todo-list li').classList.contains('completed');
    this.totalTasksCounter()
    this.dump()

  }
  totalTasksCounter(){
    this.completedTaskList=[]
    this.tasks.forEach(el=>{
      if(el.completed===true){
        this.completedTaskList.push(el);
      }
    })
        this.leftTasks = this.tasks.length - this.completedTaskList.length
        if(this.leftTasks === 1 || this.leftTasks === 0){
          qs('.todo-count').innerHTML=`<span class="todo-count"><strong>${this.leftTasks}</strong> item left</span>` 
        }else{
          qs('.todo-count').innerHTML=`<span class="todo-count"><strong>${this.leftTasks}</strong> items left</span>` 
        }
    if(this.completedTaskList.length === 0){
      qs('button.clear-completed').classList.add('hide');
    }else{
      qs('button.clear-completed').classList.remove('hide');
    }
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
      this.$allComplete = qs('input#toggle-all')
      this.$clearCompleted = qs('.clear-completed')

      this.$newTaskInput.addEventListener('keydown', this.handleNewTaskKeyDown.bind(this));
      this.$allComplete.addEventListener('change', this.changeState.bind(this));
      this.$clearCompleted.addEventListener('click', this.clearCompleted.bind(this));

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
        onChange: this.handleTaskCompleted.bind(this),
      };

      const task = new Task(title, handlers, { completed, id });

      this.tasks.push(task);

      this.$tasksList.prepend(task.$element);
      if(task.completed===true){
        this.completedTaskList.push(task);
      }


this.totalTasksCounter()
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
        this.totalTasksCounter();
        if(this.completedTaskList.length === this.tasks.length){
          qs('input#toggle-all').checked=true;
        }

		this.isEmpty(serializedTasks);
      } catch (e) {
        console.log('Cannot parse JSON from local storage');
      }
    }
  }


  class Task{
    constructor(title, { onDelete, onCompleted, onChange }, { id, completed = false } = {}) {
      this.id = id || Task.id++;
      this.title = title;
      this.completed = completed;

      this.$element = this.getElement();
      this.onDelete = onDelete;
      this.onCompleted = onCompleted;
      this.onChange = onChange;
      this.allCompletedTasks = 0;
      this.totalTasks = 0;
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
      qs('.view label', li).addEventListener('dblclick', () => this.onEdit(this));

      if (this.completed) {
        li.classList.add('completed');
      }
    
      return li;
    }

  onEdit(event){
    document.querySelectorAll('ul.todo-list li').forEach(el=>{
        el.classList.remove('editing')
    });
    event.$element.classList.add('editing')
    this.initialValue = event.$element.childNodes[1].childNodes[3].innerHTML
    // this.initialValue = event.$element.chil
    qs('.editing input.edit').addEventListener('keyup', this.onEditComplete.bind(this));
    qs('.editing input.edit').addEventListener('blur', this.onEditComplete.bind(this));
  }  

  onEditComplete(event){
      const value = event.target.value.trim();
      if ((event.key === 'Enter' || event.type === "blur") && value.trim()) {
        event.target.value = value;
        event.target.parentNode.childNodes[1].childNodes[3].innerHTML=value
        event.target.parentNode.classList.remove('editing');
        this.title = value
        this.onCompleted(this);
      }else if(event.keyCode === 27){
        this.initialValue
        event.target.value = this.initialValue;
        event.target.parentNode.childNodes[1].childNodes[3].innerHTML=this.initialValue
        event.target.parentNode.classList.remove('editing');
        this.title = this.initialValue
        this.onCompleted(this);
      }
  }
  
  makeAllComplete(){
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
      
  }

  handleCompleteToggle(event) {
      const completed = event.currentTarget.checked;
      this.completed = completed;

      if (this.completed) {
        this.$element.classList.add('completed');
      } else {
        this.$element.classList.remove('completed');
      }
    
      this.makeAllComplete()    
      this.onCompleted(this);
      this.leftTasks = this.totalTasks - this.completedTasks;
      if(this.leftTasks === 1){
          qs('.todo-count').innerHTML=`<span class="todo-count"><strong>1</strong> item left</span>` 
      }else{
          qs('.todo-count').innerHTML=`<span class="todo-count"><strong>${this.leftTasks}</strong> items left</span>` 
      }
          if(this.completedTasks === 0){
      qs('button.clear-completed').classList.add('hide');
    }else{
      qs('button.clear-completed').classList.remove('hide');
    }
    }

  }

  Task.id = 0;
  const todo = new TodoMVC();
  todo.restore();
}(window));
