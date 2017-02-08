/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';
var request = require('request');

const Alexa = require('alexa-sdk');

const APP_ID = "amzn1.ask.skill.b91639b9-e856-4592-8f4b-14f0c29acdb6";

const randomAPIURL = '/w/api.php?action=query&format=json&prop=extracts&explaintext=&generator=random&grnnamespace=0&grnlimit=1'
const languageStrings = {
    'en-GB': {
        translation: {
            SKILL_NAME: 'Wikipedia Random Article',
            GET_FACT_MESSAGE: "Here's your article: ",
            HELP_MESSAGE: 'You can say give me a new article, or, you can say exit... What can I help you with?',
            HELP_REPROMPT: 'What can I help you with?',
            STOP_MESSAGE: 'Goodbye!',
            DOMAIN: 'en.wikipedia.org',
        },
    },
    'en-US': {
        translation: {
            SKILL_NAME: 'Wikipedia Random Article',
            GET_FACT_MESSAGE: "Here's your article: ",
            HELP_MESSAGE: 'You can say give me a new article, or, you can say exit... What can I help you with?',
            HELP_REPROMPT: 'What can I help you with?',
            STOP_MESSAGE: 'Goodbye!',
            DOMAIN: 'en.wikipedia.org',
        },
    },
    'de-DE': {
        translation: {
            SKILL_NAME: 'Wikipedia Zufällige Artikel',
            GET_FACT_MESSAGE: 'Hier sind deine Artikel: ',
            HELP_MESSAGE: 'Du kannst sagen, „Nenne mir einen Artikel“, oder du kannst „Beenden“ sagen... Wie kann ich dir helfen?',
            HELP_REPROMPT: 'Wie kann ich dir helfen?',
            STOP_MESSAGE: 'Auf Wiedersehen!',
            DOMAIN: 'de.wikipedia.org',
        },
    },
};

var body = "";
var alexa;
const handlers = {
    'LaunchRequest': function () {
        this.emit('AskForFactIntent');
    },
    'AskForFactIntent': function () {
        this.emit('GetFact');
    },
    'GetFact': function () {
        httpGet(this.t('DOMAIN'), function(response) {
            let jsonObject = JSON.parse(response);
            let pages = jsonObject.query.pages
            for (let p in pages){
                    let title = pages[p].title
                    let rawText = pages[p].extract
                    // only save until the first newline
                    let nl = rawText.search(/\n/)
                    if (nl !== -1) {
                        rawText = rawText.substr(0,nl)
                    }
                    // take out all brackets
                    rawText = rawText.replace(/\([^\(\)\[\]]+\)/g, "")
                    // replace starting text with pronounciation
                    rawText = rawText.replace(/^(.*)\[([^\[\]]*)\]/,
                    '<phoneme alphabet="ipa" ph="$2">$1</phoneme>')
                    // strip all angle brackets
                    rawText = rawText.replace(/\<[^\<\>]*\>/g,"")
                    // Create speech output
                    const speechOutput = this.t('GET_FACT_MESSAGE') + rawText;
                    let pageUrl = "http://en.wikipedia.org/?curid="
                    const cardText = "\n\n To see the full article open link at URL " 
                    alexa.emit(':tellWithCard', speechOutput, this.t('SKILL_NAME') + ": " + title, rawText + cardText+ pageUrl + pages[p].pageid);
            }        
        }.bind(this));
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = this.t('HELP_MESSAGE');
        const reprompt = this.t('HELP_MESSAGE');
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'SessionEndedRequest': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
};

exports.handler = (event, context) => {
    alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};


// Create a web request and handle the response.
function httpGet(query, callback) {
 var url = "https://"+query+randomAPIURL
 var req = request(url, (error, response, body) => {
    if (!error && response.statusCode == 200) {
        callback(body)
    }else {
        console.log(response.statusCode);
        console.error(error);
    }
 });
 }

