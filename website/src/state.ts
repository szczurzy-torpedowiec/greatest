import { reactive } from 'vue';
import { Viewer } from 'greatest-api-schemas';

export default reactive<{
  signedInUser: Viewer | null,
}>({
  signedInUser: null,
});
