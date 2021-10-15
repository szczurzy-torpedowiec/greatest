import {
  ref, readonly, watch, onBeforeUnmount, computed,
} from 'vue';
import { DeepReadonly, Ref } from '@vue/reactivity';
import { TestWebsocketMessage } from 'greatest-api-schemas';

export type ConnectListener = (isReconnect: boolean) => void;
export type MessageListener<T> = (message: T) => void;

export function useWebsocket<T>(url: DeepReadonly<Ref<string | null>>) {
  const isOpen = ref<boolean>(false);
  const connectListeners = new Set<ConnectListener>();
  const messageListeners = new Set<MessageListener<T>>();

  let websocket: WebSocket | null;
  let connectTimeoutId: number | null = null;

  let destroyed = false;

  const resetTimeout = () => {
    if (connectTimeoutId !== null) clearTimeout(connectTimeoutId);
    connectTimeoutId = null;
  };

  const connect = (connectUrl: string, isReconnect: boolean) => {
    resetTimeout();
    websocket?.close();
    websocket = new WebSocket(connectUrl);
    websocket.onclose = () => {
      websocket = null;
      isOpen.value = false;
      if (url.value !== null && !destroyed) {
        connectTimeoutId = setTimeout(connect, 2500, url.value, true);
      }
    };
    websocket.onopen = () => {
      connectListeners.forEach((listener) => listener(isReconnect));
      isOpen.value = true;
    };
    websocket.onmessage = (event) => {
      messageListeners.forEach((listener) => listener(JSON.parse(event.data) as T));
    };
  };

  watch(url, (value) => {
    if (value === null) websocket?.close();
    else connect(value, false);
  }, {
    immediate: true,
  });

  onBeforeUnmount(() => {
    destroyed = true;
    resetTimeout();
    websocket?.close();
    messageListeners.clear();
    connectListeners.clear();
  });

  return {
    isOpen: readonly(isOpen),
    onConnect: (listener: ConnectListener) => connectListeners.add(listener),
    onMessage: (listener: MessageListener<T>) => messageListeners.add(listener),
  };
}

export const useTestWebsocket = (
  testId: DeepReadonly<Ref<string | null>>,
) => useWebsocket<TestWebsocketMessage>(computed(() => {
  if (testId.value === null) return null;
  const url = new URL(`/api/ws/tests/${testId.value}`, window.location.toString());
  url.protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
}));
