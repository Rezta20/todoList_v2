import { createApp } from "vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faUserSecret,
  faStar,
  faPencil,
  faCalendarDays,
  faXmark,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import {
  faStar as farStar,
  faFile,
  faCommentDots,
} from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import App from "./App.vue";
import "./index.css";

library.add(
  faUserSecret,
  faStar,
  farStar,
  faPencil,
  faCalendarDays,
  faFile,
  faCommentDots,
  faXmark,
  faPlus
);

const app = createApp(App);
app.component("font-awesome-icon", FontAwesomeIcon);
app.mount("#app");
