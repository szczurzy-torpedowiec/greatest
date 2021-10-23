<template>
  <div class="render-header">
    <div class="render-header__content">
      <div class="render-header__fields">
        <div class="render-header__field render-header__field--short">
          <div class="render-header__field-label">
            Klasa
          </div>
          <div class="render-header__field-box" />
        </div>
        <div class="render-header__field render-header__field--short">
          <div class="render-header__field-label">
            Numer
          </div>
          <div class="render-header__field-box" />
        </div>
        <div class="render-header__field render-header__field--name">
          <div class="render-header__field-label">
            Imię i nazwisko
          </div>
          <div class="render-header__field-box" />
        </div>
        <div class="render-header__field render-header__field--date">
          <div class="render-header__field-label">
            Data
          </div>
          <div class="render-header__field-box" />
        </div>
      </div>
      <div class="render-header__info">
        Wygenerowano przy użyciu <b>{{ $t('appName') }}</b>
      </div>
    </div>
    <div class="render-header__generated">
      <div>Strona <b>{{ pageIndex + 1 }}</b>/<b>{{ totalPages }}</b></div>
      <code>eksperymentalnie</code><br>
      <code>przykład</code>
    </div>
    <!--    <img-->
    <!--      class="render-header__qr"-->
    <!--      :src="require('src/assets/demo-code.svg')"-->
    <!--      alt="Kod arkusza"-->
    <!--    >-->
    <img
      class="render-header__qr render-header__qr--demo"
      :src="require('src/assets/demo-code.svg')"
      alt="Przykładowy kod arkusza"
    >
    <slot />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
  props: {
    pageIndex: {
      type: Number,
      required: true,
    },
    totalPages: {
      type: Number,
      required: true,
    },
    phrase: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    return {
      phraseParts: computed(() => props.phrase.split(' ')),
    };
  },
});
</script>

<style lang="scss">
@import "src/css/render";

.render-header {
  height: $header-height;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  overflow: hidden;
  position: relative;

  .render-header__content {
    flex-grow: 1;
    padding: 0 render-mm(5);

    .render-header__fields {
      display: flex;

      .render-header__field {
        margin-right: render-mm(2);

        .render-header__field-label {
          text-align: center;
          font-size: 0.8em;
          padding: 0 render-mm(1);
          margin-bottom: render-mm(1);
        }

        .render-header__field-box {
          border: render-mm(0.2) solid black;
          border-radius: render-mm(1);
          height: render-mm(10);
        }
      }

      .render-header__field--short {
        min-width: render-mm(12);
      }

      .render-header__field--name {
        min-width: render-mm(60);
      }

      .render-header__field--date {
        min-width: render-mm(35);
      }
    }

    .render-header__info {
      font-size: 0.7em;
      margin-top: render-mm(2);
    }
  }

  .render-header__generated {
    margin-right: render-mm(4);
    text-align: right;
  }

  .render-header__qr {
    margin-right: render-mm(3);
    width: render-mm(24);
    height: render-mm(24);

    &.render-header__qr--demo {
      filter: blur(render-mm(1));
    }
  }
}
</style>
