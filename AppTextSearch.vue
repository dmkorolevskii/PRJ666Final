<template>
<div >
  <input class="textSearch" list="modules" placeholder="Module Search..." @mousedown="moduleInsert" @change="selectionChange">
  <datalist id="modules"> </datalist>
</div>
</template>

<script>
export default {
  props: {
    aborted: {
      type: Boolean,
      default: false,
      required: true
    },
    test: {
      type: Boolean,
      default: false,
      required: true
    }
  },
  computed: {
    uiState() {
      return this.$store.state.uiState
    }
  },

  methods: {
    getNewIntent() {
      if (this.test === true) {
        this.$store.commit('abortRecording')
        this.test = false;
      } else {
        this.$store.dispatch('getSpeech')
        this.aborted = true;
        this.test = true;
        api.updateQuery(api.searchItem.keyword, api.searchItem.input)
      }
    },
    moduleInsert() {
      let currentInsert = $('.topnav').val();
      this.$store.dispatch('getModule')
      let existingIntents = this.$store.state.intents;
      let item = $('<datalist id="modules">');
      for (let i = 0; i < existingIntents.length; i++) {
        item.append('<option>' + existingIntents[i].intent + '</option>');
      }
      item.append('</datalist>')
      $('#modules').replaceWith(item);
    },
    selectionChange() {
      let selected = $('.textSearch').val();
      this.$store.dispatch('getUnderstanding', '! voice command ' + selected);
      $('.textSearch').val('');
    }
  },
  mounted() {
  },
}
</script>

<style scoped>
.topnav {
  overflow: hidden;
}

.topnav a {
  color: black;
  display: block;
  text-align: center;
  float: left;
  font-size: 17px;
  padding: 14px 16px;
  text-decoration: none;
}

.topnav a:hover {
  color: black;
}

.topnav a.active {
  color: white;
  background-color: #2196F3;
}

.topnav input[type=text] {
  margin-top: 4px;
  margin-right: 16px;
  border-radius: 5px;
  font-size: 17px;
  float: right;
  border: none;
}

@media screen and (max-width: 600px) {
  .topnav a, .topnav input[type=text] {
    padding: 14px;
    margin: 0;
    width: 100%;
    float: none;
    text-align: left;
    display: block;
  }
  .topnav input[type=text] {
    border: 1px solid #ccc;
  }
}

</style>
