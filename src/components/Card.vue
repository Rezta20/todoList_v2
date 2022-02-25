<script setup lang="ts">
import { faCommentsDollar } from "@fortawesome/free-solid-svg-icons";
import { watch, ref, computed, Ref, PropType, ComputedRef } from "vue";

interface file {
  fileName: string;
  url: string | ArrayBuffer | null;
}

interface todoItem {
  id: number;
  isChecked: boolean;
  title: string;
  isMarked: boolean;
  date: string;
  time: string;
  file: file;
  comment: string;
}

// props
const props = defineProps({
  todoItem: {
    type: Object as PropType<todoItem>,
    default: () => ({}),
  },
  source: String,
  isEditing: Boolean,
  isAdd: Boolean,
});

// refs;
const isEditing: Ref<boolean> = ref(false);
const deepCloneTodo: Ref<todoItem> = ref(
  JSON.parse(JSON.stringify(props.todoItem))
);
// DOM
const fileUploadImg: Ref<HTMLImageElement | undefined> = ref();
const fileUploadName: Ref<HTMLElement | undefined> = ref();
const fileUploader: Ref<HTMLInputElement | undefined> = ref();

// emits
const emits = defineEmits(["cancelEdit", "saveTodo", "cancelCloseShowAddBtn"]);

// watch
watch(isEditing, (val: boolean) => {
  if (val) deepCloneTodo.value = JSON.parse(JSON.stringify(props.todoItem));
});

// computed
const dateFormat: ComputedRef<string> = computed(() => {
  const str = deepCloneTodo.value.date;
  const originalDate = str.split("-");
  const month = originalDate[1];
  const day = originalDate[2];

  return `${month}/${day}`;
});

const checkBtnText: ComputedRef<string> = computed(() => {
  if (props.source === "newCard") {
    return "Add Task";
  }
  return "Save";
});

// function
const cancel = () => {
  if (props.source === "newCard") {
    emits("cancelCloseShowAddBtn");
    return;
  }

  isEditing.value = false;
  deepCloneTodo.value = props.todoItem;
};

const emitSaveTodo = () => {
  emits("saveTodo", JSON.parse(JSON.stringify(deepCloneTodo.value)));
};

const closeSave = () => {
  if (props.source === "newCard") {
    emitSaveTodo();
    emits("cancelCloseShowAddBtn");
    return;
  }

  isEditing.value = false;
  emitSaveTodo();
};

const uploadFile = () => {
  const inputFile = fileUploader.value;

  if (inputFile) {
    inputFile.addEventListener(
      "change",
      (event: EventTarget) => {
        // 檔案資訊
        const fileData = event.target.files[0];

        // transfer to base64 format
        const reader = new FileReader();
        reader.readAsDataURL(fileData);
        reader.onload = function (e) {
          const fileMaxSize = 1024 * 1024 * 10; //10 MB

          if (fileData.size > fileMaxSize) {
            alert("檔案太大, 請上傳其他檔案");
            return;
          }

          if (fileUploadImg.value && fileUploadName.value) {
            fileUploadImg.value.src = this.result as string;
            fileUploadName.value.innerText = fileData.name;
          }

          const uploadData = { url: this.result, fileName: fileData.name };
          deepCloneTodo.value.file = uploadData;
        };
      },
      false
    );
  }
};
</script>

<template>
  <div
    class="w-full my-4 rounded h-22"
    :class="{
      'bg-gray-light': !deepCloneTodo.isMarked,
      'bg-yellow-light': deepCloneTodo.isMarked,
    }"
  >
    <!-- upper -->
    <div class="flex flex-col px-6 py-2">
      <!-- title line  -->
      <div class="flex justify-between w-full h-12">
        <div class="flex items-center text-primary-black">
          <input
            type="checkbox"
            name="checkTodo"
            v-model="deepCloneTodo.isChecked"
            @change="emitSaveTodo"
            class="larger"
          />
          <input
            type="text"
            name="title"
            id=""
            v-model="deepCloneTodo.title"
            class="text-l mx-2 bg-transparent font-medium focus:outline-none"
            :class="{
              'line-through': deepCloneTodo.isChecked,
              'text-gray-delete': deepCloneTodo.isChecked,
            }"
            placeholder="Type something here..."
          />
        </div>
        <div
          class="flex items-center justify-around w-24 text-s text-primary-black"
        >
          <button @click="deepCloneTodo.isMarked = !deepCloneTodo.isMarked">
            <font-awesome-icon
              v-if="!deepCloneTodo.isMarked"
              :icon="['far', 'star']"
              class="px-2 text-m"
            />
            <font-awesome-icon
              v-if="deepCloneTodo.isMarked"
              :icon="['fas', 'star']"
              class="px-2 text-m text-yellow-dark"
            />
          </button>
          <button @click="isEditing = true">
            <font-awesome-icon
              :icon="['fas', 'pencil']"
              :class="[
                'px-2 text-m',
                isAdd || isEditing ? 'text-blue-light' : 'text-black',
              ]"
            />
          </button>
        </div>
      </div>
      <!-- icon line -->
      <div
        v-if="!isEditing && !isAdd"
        class="flex w-32 ml-9 mt-1 text-gray-dark"
      >
        <div v-if="deepCloneTodo.date" class="icon pr-3">
          <font-awesome-icon :icon="['fas', 'calendar-days']" class="text-m" />
          {{ dateFormat }}
        </div>
        <div v-if="deepCloneTodo.file.fileName" class="icon pr-3">
          <font-awesome-icon :icon="['far', 'file']" class="text-m" />
        </div>
        <div v-if="deepCloneTodo.comment" class="icon">
          <font-awesome-icon :icon="['far', 'comment-dots']" class="text-m" />
        </div>
      </div>
    </div>

    <!-- lower -->
    <div
      class="lower border-t-2 border-gray-middleLight bg-gray-light text-primary-black"
      v-if="isEditing || isAdd"
    >
      <div class="flex flex-col px-14 py-4">
        <div>
          <div class="flex items-center">
            <font-awesome-icon
              :icon="['fas', 'calendar-days']"
              class="text-m"
            />
            <h4 class="text-m text-primary-black font-medium px-2">Deadline</h4>
          </div>
          <input
            class="align-middle w-48 rounded mt-1 px-4 py-1 mx-6 focus:outline-none focus:ring focus:border-blue-light focus:shadow-md"
            type="text"
            name="date"
            id="date"
            placeholder="yyyy / mm / dd"
            onfocus="this.type = 'date'"
            onblur="if(this.value==''){this.type='text'}"
            v-model="deepCloneTodo.date"
          />
          <input
            class="align-middle w-36 mt-1 px-4 py-1 rounded focus:outline-none focus:ring focus:border-blue-light focus:shadow-md"
            type="text"
            name="time"
            id="time"
            placeholder="hh:mm"
            onfocus="this.type = 'time'"
            onblur="if(this.value==''){this.type='text'}"
            v-model="deepCloneTodo.time"
          />
        </div>
        <div class="mt-4">
          <div class="flex items-center">
            <font-awesome-icon :icon="['far', 'file']" class="text-m" />
            <h4 class="text-m text-primary-black font-medium px-2">File</h4>
          </div>
          <img
            ref="fileUploadImg"
            id="fileImg"
            class="mx-6 mt-1 rounded w-5/6"
            :src="todoItem.file.url"
          />
          <p ref="fileUploadName" id="fileName" class="mx-6 mt-1">
            {{ todoItem.file.fileName }}
          </p>
          <input
            type="file"
            id="fileUploader"
            ref="fileUploader"
            accept="image/png, image/jpeg"
            class="hidden"
            @click="uploadFile"
          />
          <label
            for="fileUploader"
            class="mt-1 bg-gray-middleLight text-primary-white w-7 h-7 rounded text-m flex justify-center items-center hover:bg-blue-light mx-6"
          >
            +
          </label>
        </div>
        <div class="mt-4">
          <div class="flex items-center">
            <font-awesome-icon :icon="['far', 'comment-dots']" class="text-m" />
            <h4 class="text-m text-primary-black font-medium px-2">Comment</h4>
          </div>
          <textarea
            type="text"
            name="comments"
            id="comments"
            cols="50"
            rows="10"
            placeholder="Type your memo here..."
            class="mt-1 p-4 rounded focus:outline-none focus:ring focus:border-blue-light focus:shadow-md mx-6"
            v-model="deepCloneTodo.comment"
          />
        </div>
      </div>
      <div class="w-full text-l">
        <button
          class="w-1/2 py-2 bg-primary-white hover:bg-button-hover-cancel text-red"
          @click="cancel"
        >
          <font-awesome-icon :icon="['fas', 'xmark']" class="text-m px-1" />
          Cancel
        </button>
        <button
          class="w-1/2 py-2 bg-blue-light hover:bg-button-hover-save text-primary-white"
          @click="closeSave"
        >
          <font-awesome-icon :icon="['fas', 'plus']" class="text-m px-1" />
          {{ checkBtnText }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
input.larger {
  width: 24px;
  height: 24px;
}
</style>
