import Vue from 'vue'
import Vuex from 'vuex'

var script = document.createElement("SCRIPT");
script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js';
script.type = 'text/javascript';
document.getElementsByTagName("head")[0].appendChild(script);

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    intent: 'None',
    intensity: 'None',
    score: 0,
    uiState: 'idle',
    intents: ''
  },
  actions: {
    getSpeech({ dispatch, commit, state }) {
      commit('setUiState', 'listening')
      recognition.onresult = function(event) {
        const phrase = event.results[event.results.length - 1][0].transcript
        dispatch('getUnderstanding', phrase)
      }
    },

    // query for finding all intents
    getModule({ dispatch, commit, state }) {
      let url = `https://eastus.api.cognitive.microsoft.com/luis/v2.0/apps/a6ae596d-a399-496f-81e9-adc316b8953c?verbose=true&timezoneOffset=0&subscription-key=ec14835ee9f944b6b4d9412cde2f810f&q=test`;
      var data;
      var request = new XMLHttpRequest();
      request.open('GET', url, true)
      request.onload = function () {
        // Begin accessing JSON data here
        data = JSON.parse(this.response)
        var filtered = [];
        data.intents.forEach((d) => {
          if(d.intent != 'None')
            filtered.push(d);
        });
        state.intents = filtered;
      }
      request.send()
      commit('setUiState', 'fetching')

    },

    // the main function for processing commands
    getUnderstanding({ commit }, voiceText) {

      // for text navigation
      let text = false;
      if (voiceText.startsWith('!'))
        text = true;

      if (voiceText.includes("voice command")){

        var keywordPosition = voiceText.search("voice command");
        voiceText = voiceText.substring(keywordPosition + 14);

        var possibility = 0.5;
        commit('setUiState', 'fetching')

        // the LUIS REST APi
        let url = `https://eastus.api.cognitive.microsoft.com/luis/v2.0/apps/a6ae596d-a399-496f-81e9-adc316b8953c?verbose=true&timezoneOffset=0&subscription-key=ec14835ee9f944b6b4d9412cde2f810f&q=`;
        url += voiceText;
        var request = new XMLHttpRequest();

        request.open('GET', url, true)
        request.onload = function () {
          var data = JSON.parse(this.response)

          // processing request based on the received intent (form)
          if (data.topScoringIntent.intent == 'Find' && data.topScoringIntent.score >= possibility){
            var find = $(".dx-icon-ic_search");
            find.click();
            data.entities.forEach(element => {
              var searchField = document.getElementsByClassName("dx-texteditor-input");
              if (searchField.length != 0) {
                var searchDropdownValue = document.getElementsByClassName('dx-dropdowneditor-input-wrapper dx-selectbox-container');
                var input = searchDropdownValue[0].getElementsByTagName('input');
                if(element.type == "Customer"){
                  searchField[0].value = 'Customer # [c]';
                  input[0].defaultValue = 'customeraccount.customer';
                } else if(element.type == "Account"){
                  searchField[0].value = 'Account # [a]';
                  input[0].defaultValue = 'customeraccount.account';
                } else if (element.type == "Address"){
                  searchField[0].value = 'Address [r]';
                  input[0].defaultValue = '.address';
                } else if (element.type == "Contact details") {
                  searchField[0].value = 'Contact details';
                  input[0].defaultValue = 'contactinformation.contactdetails';
                } else if (element.type == "Bill number") {
                  searchField[0].value = 'Bill Number';
                  input[0].defaultValue = 'bill.billnumber';
                } else if (element.type == "Service order") {
                  searchField[0].value = 'Service order';
                  input[0].defaultValue = 'serviceorder.serviceordernumber';
                } else if (element.type == "Service Address") {
                  searchField[0].value = 'Service Address [s]';
                  input[0].defaultValue = '.serviceaddress';
                }
              }
            });
          } else if (data.topScoringIntent.intent == 'Outstanding tasks' && data.topScoringIntent.score >= possibility){
            var tasks = $(".dx-visibility-change-handler");
            tasks.click();
          } else if (data.topScoringIntent.intent == 'Recent customers' && data.topScoringIntent.score >= possibility) {
            var tasks = $(".u-pull-left");
            tasks.click();
          } else if (data.topScoringIntent.intent == 'Stop' && data.topScoringIntent.score >= possibility){
            recognition.abort();
            commit('setUiState', 'fetching')
          } else if (data.topScoringIntent.intent == 'Close' && data.topScoringIntent.score >= possibility){
            $(".dx-icon-close").click()
          } else if (data.topScoringIntent.intent == 'User Tasks' && data.topScoringIntent.score >= possibility){
            window.location.href = '/Inquiry/UserTasks/UserTasksInquiry?type=Task&subtype=INQ';
          } else if (data.topScoringIntent.intent == 'Main' && data.topScoringIntent.score >= possibility) {
            window.location.href = '/LandingPage';
          }
        }
        request.send()

        // change the state of the button if voice navigation was triggered.
        // ignore if command came from text navigation
        text ? commit('setUiState', 'fetching') : commit('setUiState', 'listening')
      }

    }
  }
})
