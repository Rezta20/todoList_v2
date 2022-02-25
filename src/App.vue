<script setup lang="ts">
import { ref, computed, Ref, onMounted } from "vue";
import Card from "./components/Card.vue";

// const d: Ref<Todo[]> = ref([])

interface todoListsItem {
  id: number;
  isChecked: boolean;
  title: string;
  isMarked: boolean;
  date: string;
  time: string;
  file: object;
  comment: string;
}

// refs
const todoLists: Ref<todoListsItem[]> = ref([]);

const newTodoItem: Ref<todoListsItem> = ref({
  id: +new Date(),
  isChecked: false,
  title: "",
  isMarked: false,
  date: "",
  time: "",
  file: {},
  comment: "",
});

const tag: Ref<string> = ref("myTasks");
const showAddBtn: Ref<boolean> = ref(true);

// computed
const timeAndMarkRanking: Ref<todoListsItem[]> = computed(() => {
  // const arr = todoLists.value.map((todo) => todo);
  const arr = [...todoLists.value];

  return arr.sort((a: todoListsItem, b: todoListsItem) => {
    const mileSecondsOfA = +new Date(`${a.date} ${a.time}`) || 0;
    const mileSecondsOfB = +new Date(`${b.date} ${b.time}`) || 0;

    // When  priority of time ranking is same
    if (a.isMarked === b.isMarked) {
      return mileSecondsOfB - mileSecondsOfA;
    }

    // Marks ranking is firstly
    return a.isMarked === true ? -1 : 1;
  });
});

const navbarFilter: Ref<todoListsItem[]> = computed(() => {
  switch (tag.value) {
    case "myTasks":
      return timeAndMarkRanking.value;
    case "inProgress":
      return timeAndMarkRanking.value.filter((item) => !item.isChecked);
    case "completed":
      return timeAndMarkRanking.value.filter((item) => item.isChecked);
    default:
      return todoLists.value;
  }
});

const tasksStatusLists: Ref<todoListsItem[]> = computed(() => {
  switch (tag.value) {
    case "myTasks":
    case "inProgress":
      return todoLists.value.filter((item) => !item.isChecked);
    case "completed":
      return todoLists.value.filter((item) => item.isChecked);
    default:
      return todoLists.value;
  }
});

const taskStatusText: Ref<string> = computed(() => {
  switch (tag.value) {
    case "myTasks":
    case "inProgress":
      return "left";
    case "completed":
      return "completed";
    default:
      return "left";
  }
});

// mounted
onMounted(() => {
  const data = window.localStorage.getItem("todoLists") || "[]";
  const dataFromLocalStorage = JSON.parse(data);

  dataFromLocalStorage.forEach((todoItem: todoListsItem) =>
    todoLists.value.push(todoItem)
  );
});

// function
const reStructureTodo = (currentTodoItem: todoListsItem) => {
  // Find & reStructuring
  const index = todoLists.value.findIndex(
    (todo) => todo.id === currentTodoItem.id
  );

  // remove current old value then put in new, connect remainder
  // array.slice(start, end);
  todoLists.value = [
    ...todoLists.value.slice(0, index),
    currentTodoItem,
    ...todoLists.value.slice(index + 1),
  ];
  setItemToLocalStorage();
};

const cancelCloseShowAddBtn = () => {
  showAddBtn.value = true;
};

const addNewTask = (newTodoItem: todoListsItem) => {
  newTodoItem.id = +new Date();
  todoLists.value.push(newTodoItem);
  setItemToLocalStorage();
};

const setItemToLocalStorage = () => {
  window.localStorage.setItem("todoLists", JSON.stringify(todoLists.value));
};
</script>

<template>
  <div class="font-body bg-primary-gray min-h-screen">
    <!-- navbar -->
    <div
      class="flex w-full justify-center items-center h-16 bg-blue-light text-primary-white"
    >
      <div class="card mx-4 text-l font-semibold h-full flex">
        <button
          @click="tag = 'myTasks'"
          class="w-1/3 navbar navbar-hover"
          :class="{
            'navbar-click': tag === 'myTasks',
            'text-primary-white': tag === 'myTasks',
            'text-blue-dark': tag !== 'myTasks',
          }"
        >
          My Tasks
        </button>
        <button
          @click="tag = 'inProgress'"
          class="w-1/3 navbar navbar-hover"
          :class="{
            'navbar-click': tag === 'inProgress',
            'text-primary-white': tag === 'inProgress',
            'text-blue-dark': tag !== 'inProgress',
          }"
        >
          In Progress
        </button>
        <button
          @click="tag = 'completed'"
          class="w-1/3 navbar navbar-hover text-blue-dark"
          :class="{
            'navbar-click': tag === 'completed',
          }"
        >
          Completed
        </button>
      </div>
    </div>
    <!-- content -->
    <div
      class="content flex flex-col m-auto mt-4 justify-center items-center text-blue-dark"
    >
      <button
        v-if="showAddBtn"
        class="w-full text-left h-12 bg-primary-white border-2 border-gray-middleLight rounded px-8 text-l font-normal text-gray-middleLight"
        @click="showAddBtn = false"
      >
        + Add Task
      </button>

      <Card
        v-if="!showAddBtn"
        :todoItem="newTodoItem"
        isAdd
        :source="'newCard'"
        @cancelCloseShowAddBtn="cancelCloseShowAddBtn"
        @saveTodo="addNewTask"
      />

      <div class="mt-4 w-full">
        <Card
          v-for="(todo, index) in navbarFilter"
          :key="todo.id"
          :todoItem="todo"
          @saveTodo="reStructureTodo"
        />
      </div>
      <p class="text-l italic text-gray-middleLight text-left w-full ml-12">
        {{ tasksStatusLists.length }} tasks {{ taskStatusText }}
      </p>
    </div>
  </div>
</template>

<style lang="scss">
.card {
  width: 620px;
}

.navbar {
  border-bottom: solid 5px #4a90e2;
}

.navbar-click {
  border-bottom: solid 5px #00408b;
}
.navbar-hover {
  &:hover {
    border-bottom: solid 5px #00408b;
  }
}

.content {
  width: 620px;
}
</style>
