import { createApp } from "vue";
import App from "./app.vue";

import "vuetify/styles";
import { createVuetify } from "vuetify";
// NOTE:
// this imports ALL vuetify components and directives
// would need to ensure the Vuetify Vite Plugin tree-shakes properly
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

const vuetify = createVuetify({
  components,
  directives,
});

createApp(App).use(vuetify).mount("#app");
