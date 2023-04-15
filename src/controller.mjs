

import blessed from 'blessed';
import pkg from 'figlet';
const figlet = pkg;

import { MenuMod, NewTipMod, LogMod, InputBox, HomeMod, MessageMod, HelpMod } from './boxes.js';
import { Tip, Jar } from './jarData-interface.js';

const screen = blessed.screen({
   title: 'bless',
   smartCSR: true,
   keys: true,
   mouse: true,
});


const jar = new Jar();

const menu = new MenuMod();
const menuBox = menu.mainBox;
menu.top = menu.createButton;
menu.bottom = menu.helpButton;

const newTipFields = new NewTipMod();
const newTipBox = newTipFields.mainBox;

const logMod = new LogMod();
const logBox = logMod.mainBox;

const homeMod = new HomeMod();
const homeBox = homeMod.mainBox;

const inputter = new InputBox();
const inputBox = inputter.mainBox;

const messageMod = new MessageMod();
const messageBox = messageMod.mainBox;

const helpMod = new HelpMod();
const helpBox = helpMod.mainBox;

var onNewTipScreen = false;
var isLogging = false;
var keepLogging = true;
const logDelay = 300;
const defaultFocusBox = inputBox;
var currBox;
var fromEdit = false;
var tipToEdit;
var origName;


const logger = initLogger();
const searcher = initSearcher();
const terminal = initTerminalUtils();
const switcher = initSwitcher();
const focuser = initFocuser();
const tipMaker = initTipMaker();
const input = initInputter();
const messenger = initMessenger();




function initSwitcher() {

   function switchToHome() {
      if (isLogging) {
         logger.stopLogging();
         setTimeout(() => {
            currBox.detach();
            currBox = homeBox;
            screen.append(homeBox);
            defaultFocusBox.focus();
            homeBox.setContent(`{center}${figlet.textSync('home', {})}{/center}`);
            screen.render();
         }, logDelay);
      } else {
         currBox.detach();
         currBox = homeBox;
         screen.append(homeBox);
         defaultFocusBox.focus();
         homeBox.setContent(`{center}${figlet.textSync('home', {})}{/center}`);
         screen.render();
      }

   }

   function switchToLogBox() {
      currBox.detach();
      currBox = logBox;
      screen.append(logBox);
      logMod.mainBox.focus();
      logBox.setContent('');
      screen.render();
   }

   function switchToNewTip() {
      currBox.detach();
      onNewTipScreen = true;
      currBox = newTipBox;
      screen.append(newTipBox);
      newTipFields.nameBox.focus();
      screen.render();
   }

   function switchToHelp() {
      currBox.detach();
      currBox = helpBox;
      screen.append(helpBox);
      logger.figLog(helpBox, 'help');
      logger.logHelp(helpBox);
      screen.render();
   }

   return {
      switchToHome,
      switchToLogBox,
      switchToNewTip,
      switchToHelp
   }
}

function initFocuser() {

   function focusMenuBox(button) {
      if (button === 'bottom') { menu.bottom.focus(); }
      else { menu.top.focus(); }
      screen.render();
   }

   function focusInputBox() {
      inputter.mainBox.focus();
   }

   function focusDefault() {
      defaultFocusBox.focus();
   }

   function focusCurrBox() {
      switch (currBox) {
         case logBox:
            logMod.mainBox.focus();
            break;

         case newTipBox:
            newTipFields.nameBox.focus();;
            break;

         case homeBox:
            homeBox.focus();
            break;
      }
   }

   return {
      focusMenuBox,
      focusInputBox,
      focusDefault,
      focusCurrBox
   }
}

//TODO: implement to resize boxes based on terminal size
function initTerminalUtils() {

   function getColumns() {
      return process.stdout.columns;
   }
   function getRows() {
      return process.stdout.rows;
   }

   return {
      getColumns,
      getRows
   }
}

function initInputter() {

   function clear() {
      inputBox.setValue('');
   }

   function handleCommand(command) {
      clear();
      const args = command.split(' ');

      switch (args[0]) {
         case 'create':
            menu.createButton.press();
            return;

         case 'home':
            menu.homeButton.press();
            return;

         case 'help':
            menu.helpButton.press();
            return;

         case 'search':
            if (!args[1]) {
               messenger.noTipSpecified('search for');
            } else {
               const matchingTips = searcher.search(args[1], jar.tipsArray);
               switcher.switchToLogBox();
               logger.logTipArray(matchingTips);
            }
            return;

         case 'random':
            menu.randomButton.press();
            return;

         case 'tags':
            logger.logTags();
            return;

         case 'edit':
            if (!args[1]) {
               messenger.noTipSpecified('edit');
               return;
            }

            if (isNaN(args[1])) {
               tipToEdit = jar.tipsArray.find(tip => tip.name.toLowerCase() === args[1].toLowerCase());
            } else {
               tipToEdit = jar.tipsArray.find(tip => tip.index === parseInt(args[1]));
            }

            if (!tipToEdit) {
               messenger.tipNotFound();
               return;
            } else {
               switcher.switchToNewTip();
               newTipFields.nameBox.setValue(tipToEdit.name);
               newTipFields.descriptionBox.setValue(tipToEdit.description);
               newTipFields.tagsBox.setValue([...tipToEdit.tags].join(', '));
               newTipFields.linksBox.setValue([...tipToEdit.links].join(', '));
               fromEdit = true;
               origName = tipToEdit.name;
               return;
            }


         case 'delete':
            let tipToDelete;

            if (!args[1]) {
               messenger.noTipSpecified('delete');
               return;
            } else if (isNaN(args[1])) {
               tipToDelete = jar.tipsArray.find(tip => tip.name.toLowerCase() === args[1].toLowerCase());
            } else {
               tipToDelete = jar.tipsArray.find(tip => tip.index === parseInt(args[1]));
            }

            if (!tipToDelete) {
               messenger.tipNotFound();
               return;
            } else {
               jar.deleteTip(tipToDelete);
               messenger.tipDelted(tipToDelete.name);
               switcher.switchToHome();
               return;
            }



         default:
            if (!args[0]) {
               messenger.noCommand();
               return;
            } else {
               messenger.invalidCommand();
               return;
            }

      }
   }

   return {
      clear,
      handleCommand,
   }
}

function initSearcher() {

   function search(query, tipArray) {
      query = query.toLowerCase();
      let matchingTips = [];
      let push = false;

      for (let tip of tipArray) {
         if (tip.name.toLowerCase().includes(query)) { push = true; }
         else if (tip.description.toLowerCase().includes(query)) { push = true; }
         else if (tip.tags.has(query)) { push = true; }
         else if (tip.links.has(query)) { push = true; }

         if (push) { matchingTips.push(tip); }
         push = false;
      }
      return matchingTips;
   }

   function random(tipArray) {
      const randomIndex = Math.floor(Math.random() * tipArray.length);
      return tipArray[randomIndex];
   }

   function sortAlpha(tipArray) {
      tipArray.sort((a, b) => {
         return a.name.localeCompare(b.name);
      });
   }

   return {
      search,
      random,
      sortAlpha
   }
}

function initTipMaker() {

   function end() {
      newTipFields.nameBox.setContent();
      newTipFields.descriptionBox.setContent();
      newTipFields.tagsBox.setContent();
      newTipFields.linksBox.setContent();
      onNewTipScreen = false;
      fromEdit = false;
      switcher.switchToHome();
   }

   function saveTip() {
      const tipName = newTipFields.nameBox.getValue();
      const description = newTipFields.descriptionBox.getValue();
      const tags = newTipFields.tagsBox.getValue().split(',').map(tag => tag.trim());
      const links = newTipFields.linksBox.getValue().split(',').map(link => link.trim());

      if (tipName === '') {
         messenger.noTipName();
         return;
      }

      var existingTip = jar.tipsArray.find(tip => tip.name === tipName)

      if (fromEdit) {
         if (existingTip && tipName !== origName) {
            messenger.tipExists();
            return;
         } else {
            jar.overWriteTip(tipToEdit, tipName, description, tags, links);
            fromEdit = false;
            end();
            return;
         }
      }

      if (!fromEdit) {
         if (existingTip) {
            messenger.tipExists();
            return;
         } else {
            const newTip = new Tip(tipName, description, tags, links);
            jar.addTip(newTip);
            end();
            messenger.tipAdded(tipName);
            return;
         }
      }
   }

   return {
      end,
      saveTip,
   }
}

function initLogger() {

   function logHelp(box) {
      box.log();
      box.log('when you print tips, it will show the tip contents and an index.')
      box.log('you can reference a tip using its name or its index in the list')
      box.log();
      box.log('here are some basic commands:');
      box.log('create - create a new tip');
      box.log('edit [name or index] - edit a tip');
      box.log('delete [name or index] - delete a tip');
      box.log('search [query] - search for a tip');
      box.log('random - get a random tip');
      box.log('home - go to the home screen');
      box.log('help - show this help message');
   }

   function clear() {
      logBox.setContent('');
   }

   function figLog(box, string) {
      box.setContent('');
      box.log(`{center}${figlet.textSync(string, {})}{/center}`);
   }

   function stopLogging() {
      keepLogging = false;
      isLogging = false;
   }

   function logWelcome() {
      const welcomeTo = figlet.textSync('welcome to', {});
      const tipJar = figlet.textSync('t i p J a r !', {});

      homeBox.log(`{center}${welcomeTo}{/center}`);
      homeBox.log(`{center}${tipJar}{/center}`);
   }

   function logTip(tip) {
      logBox.log(`Name: ${tip.name}`);
      if (tip.description.length > 0) { logBox.log(`Description: ${tip.description}`); }
      if (![...tip.tags].includes('')) { logBox.log(`Tags: ${[...tip.tags]}`); }
      if (![...tip.links].includes('')) { logBox.log(`links: ${[...tip.links]}`); }
      logBox.log();
   }

   async function logTipArray(tipArray) {
      isLogging = true;
      keepLogging = true;
      searcher.sortAlpha(tipArray);

      for (let i = 0; i < tipArray.length; i++) {
         if (!keepLogging) { break; }
         const tip = tipArray[i];
         tip.index = i + 1;

         //artificial delay
         await new Promise((resolve) => setTimeout(resolve, logDelay));
         logBox.log(`${i + 1}.`)
         logTip(tip);
      }

      isLogging = false;
      keepLogging = true;
   }

   function logTags() {
      var tags = Array.from(jar.jarTags);
      searcher.sortAlpha(tags);
      for (const tag of tags) {
         logBox.log(`Tag: ${tag}`);
      }
   }

   return {
      figLog,
      stopLogging,
      logWelcome,
      logTip,
      logTipArray,
      clear,
      logTags,
      logHelp
   }
}

function initMessenger() {

   function noTipName() {
      messageBox.height = 3;
      messageBox.top = '16%'
      messageBox.left = '25%'
      screen.append(messageBox);
      messageBox.log(`{center}the tip has to have a name bro{/center}`, 2);
   }

   function tipDelted(name) {
      messageBox.height = 3;
      messageBox.top = '16%'
      messageBox.left = '25%'
      screen.append(messageBox);
      messageBox.log(`{center}deleted: ${name}{/center}`, 2);
   }

   function tipNotFound() {
      messageBox.height = 3;
      messageBox.top = '46%'
      messageBox.left = '25%'
      screen.append(messageBox);
      messageBox.log(`{center}tip not found{/center}`, 2);
   }

   function noTipSpecified(string) {
      messageBox.height = 3;
      messageBox.width = 60;
      messageBox.top = '46%'
      messageBox.left = '15%'
      screen.append(messageBox);
      messageBox.log(`{center}bro.. you know you need to specify a tip to ${string} it {/center}`, 3);
   }

   function invalidCommand() {
      messageBox.height = 3;
      messageBox.width = 60;
      messageBox.top = '46%'
      messageBox.left = '15%'
      screen.append(messageBox);
      messageBox.log(`{center}bro.. you know that's not a valid command right {/center}`, 3);
   }

   function noCommand() {
      messageBox.height = 3;
      messageBox.width = 65;
      messageBox.top = '46%'
      messageBox.left = '13%'
      screen.append(messageBox);
      messageBox.log(`{center}you need to enter a command if you want to you use this box dummy{/center}`, 3);
   }

   function tipExists() {
      messageBox.height = 3;
      messageBox.width = 65;
      messageBox.top = '16%'
      messageBox.left = '13%'
      screen.append(messageBox);
      messageBox.log(`{center}a tip with that name already exists{/center}`, 3);
   }

   function tipAdded(name) {
      messageBox.height = 3;
      messageBox.width = 65;
      messageBox.top = '46%'
      messageBox.left = '13%'
      screen.append(messageBox);
      messageBox.log(`{center}tip added: ${name}{/center}`, 3);
   }

   return {
      noTipName,
      tipDelted,
      tipNotFound,
      noTipSpecified,
      invalidCommand,
      noCommand,
      tipExists,
      tipAdded
   }
}



function setNavListeners() {

   function setQuitListener() {
      screen.on('element keypress', (el, ch, key) => {
         switch (key.name) {
            case 'escape':
               if (onNewTipScreen) { tipMaker.end(); focuser.focusDefault(); return; }
               else if (screen.focused === logBox) { focuser.focusDefault(); return; }
               else if (screen.focused === inputBox) { focuser.focusMenuBox(); return; }
               else { screen.destroy(); return process.exit(0); }

            case 'q':
               if (onNewTipScreen && screen.focused !== newTipFields.saveButton) { return; }
               else if (screen.focused === inputBox) { return; }
               else { screen.destroy(); return process.exit(0); }

            default:
               return;
         }
      });
   }
   function setInputOnFocus() {
      inputBox.on('focus', () => {
         inputBox.readInput();
      });

      newTipBox.on('element focus', (el) => {
         if (onNewTipScreen && el !== newTipFields.saveButton) {
            el.readInput();
         }
      });
   }
   function setMenuNav() {
      menuBox.on('element keypress', (el, ch, key) => {
         switch (key.name) {
            case 'down':
               if (screen.focused === menu.bottom) { focuser.focusInputBox(); }
               else { screen.focusNext(); }
               return;

            case 'up':
               if (screen.focused === menu.top) { focuser.focusInputBox(); }
               else { screen.focusPrevious(); }
               return;

            case 'right':
            case 'left':
               focuser.focusCurrBox();
               return;
         }
      });
   }
   function setLogBoxNav() {
      logBox.on('element keypress', (el, ch, key) => {
         switch (key.name) {
            case 'left':
            case 'right':
               focuser.focusMenuBox();
               return;

            case 'up':
            case 'down':
               focuser.focusInputBox();
               return;

            default:
               return;
         }
      });
   }
   function setNewTipNav() {
      newTipBox.on('element keypress', (el, ch, key) => {
         switch (key.name) {
            case 'up':
               if (screen.focused === newTipFields.nameBox) { newTipFields.saveButton.focus(); }
               else { screen.focusPrevious(); }
               return;

            case 'down':
               if (screen.focused === newTipFields.saveButton) { newTipFields.nameBox.focus(); }
               else { screen.focusNext(); }
               return;

            case 'left':
            case 'right':
               focuser.focusMenuBox();
               return;

            case 'enter':
               if (screen.focused !== newTipFields.saveButton) { screen.focusNext(); return; }
         }
      });
   }
   function setInputBoxNav() {
      inputBox.on('keypress', (ch, key) => {
         switch (key.name) {
            case 'enter':
               input.handleCommand(inputBox.getValue());
               input.clear();
               screen.render();
               return;

            case 'up':
               focuser.focusMenuBox('bottom');
               return;

            case 'down':
               focuser.focusMenuBox('top');
               return;
         }
      });
   }
   function setHomeBoxNav() {
      homeBox.on('element keypress', (el, ch, key) => {
         switch (key.name) {
            case 'left':
            case 'right':
               focuser.focusMenuBox();
               return;

            case 'up':
            case 'down':
               focuser.focusInputBox();
               return;

            default:
               return;
         }
      });
   }

   function setListeners() {
      setInputOnFocus();
      setQuitListener();

      setMenuNav();
      setNewTipNav();
      setLogBoxNav();
      setInputBoxNav();
      setHomeBoxNav();
   }
   setListeners();
}

function setButtons() {

   menu.createButton.on('press', () => {
      switcher.switchToNewTip();
   });

   menu.logAllTipsButton.on('press', () => {
      switcher.switchToLogBox();
      logger.logTipArray(jar.tipsArray);
   });

   menu.homeButton.on('press', () => {
      switcher.switchToHome();
   });

   menu.randomButton.on('press', () => {
      switcher.switchToLogBox();
      menu.randomButton.focus();
      logger.figLog(logBox, 'random tip')
      const randomTip = searcher.random(jar.tipsArray);
      randomTip.index = 0;
      logger.logTip(randomTip);
   });

   menu.searchButton.on('press', () => {
      switcher.switchToLogBox();
      focuser.focusDefault();
      logger.figLog(logBox, `search :\n${inputBox.getValue()}`);
      logger.logTipArray(searcher.search(inputBox.getValue(), jar.tipsArray));
      input.clear();
   });

   menu.helpButton.on('press', () => {
      switcher.switchToHelp();
      focuser.focusDefault();
   });

   newTipFields.saveButton.on('press', () => {
      tipMaker.saveTip();
   });
}



function run() {
   setNavListeners();
   setButtons();

   currBox = homeBox;

   screen.append(menuBox);
   screen.append(homeBox);
   screen.append(inputBox);
   logger.logWelcome();

   focuser.focusDefault();
   screen.render();
}

run();
