
const blessed = require('blessed');

class MenuMod {
   constructor() {
      this.top = this.createButton;
      this.bottom = this.searchButton;

      this.mainBox = blessed.box({
         height: '70%',
         width: '20%',

         top: '10%',
         left: '70%',

         keys: true,
         mouse: true,
         tags: true,

         border: {
            type: 'line',
         },
         style: { focus: { border: { fg: 'green' } } }
      });

      this.createButton = blessed.button({
         name: 'createButton',
         content: 'new tip',

         top: '5%',
         left: 'center',

         width: '80%',
         height: 3,

         mouse: true,
         keys: true,

         align: 'center',
         border: {
            type: 'line',
            fg: 'magenta'
         },
         style: {
            fg: 'white',
            focus: {
               border: {
                  fg: 'green'
               }
            },
         },
      });

      this.logAllTipsButton = blessed.button({
         name: 'logAllTipsButton',
         content: 'print all tips',

         top: '15%',
         left: 'center',

         width: '80%',
         height: 3,

         mouse: true,
         keys: true,

         align: 'center',
         border: {
            type: 'line',
            fg: 'magenta'
         },

         style: {
            fg: 'white',
            focus: {
               border: {
                  fg: 'green'
               }
            },
         },
      });

      this.homeButton = blessed.button({
         name: 'homeButton',
         content: 'go home',

         top: '25%',
         left: 'center',

         width: '80%',
         height: 3,

         mouse: true,
         keys: true,

         align: 'center',
         border: {
            type: 'line',
            fg: 'magenta'
         },
         style: {
            fg: 'white',
            focus: {
               border: {
                  fg: 'green'
               }
            },
         },
      });

      this.randomButton = blessed.button({
         name: 'randomButton',
         content: 'random',

         top: '35%',
         left: 'center',

         width: '80%',
         height: 3,

         mouse: true,
         keys: true,

         align: 'center',
         border: {
            type: 'line',
            fg: 'magenta'
         },
         style: {
            fg: 'white',
            focus: {
               border: {
                  fg: 'green'
               }
            },
         },
      });

      this.searchButton = blessed.button({
         name: 'searchButton',
         content: 'search',

         top: '45%',
         left: 'center',

         width: '80%',
         height: 3,

         mouse: true,
         keys: true,

         align: 'center',
         border: {
            type: 'line',
            fg: 'magenta'
         },
         style: {
            fg: 'white',
            focus: {
               border: {
                  fg: 'green'
               }
            },
         },
      });

      this.helpButton = blessed.button({
         name: 'helpButton',
         content: 'help',

         top: '55%',
         left: 'center',

         width: '80%',
         height: 3,

         mouse: true,
         keys: true,

         align: 'center',
         border: {
            type: 'line',
            fg: 'magenta'
         },
         style: {
            fg: 'white',
            focus: {
               border: {
                  fg: 'green'
               }
            },
         }

      });

      this.buildMenuBox();
   }//end constructor

   buildMenuBox() {
      this.mainBox.append(this.createButton);
      this.mainBox.append(this.logAllTipsButton);
      this.mainBox.append(this.homeButton);
      this.mainBox.append(this.randomButton);
      this.mainBox.append(this.searchButton);
      this.mainBox.append(this.helpButton);
   }
}

class NewTipMod {
   constructor() {

      this.mainBox = blessed.box({
         height: '70%',
         width: '59%',

         top: '10%',
         left: '10%',

         keys: true,
         mouse: true,

         border: {
            type: 'line',
            fg: 'green',
         }
      });

      this.nameBox = blessed.textbox({
         label: 'Name',
         name: 'nameBox',

         top: 5,
         left: 'center',

         width: '80%',
         height: 3,

         keys: true,
         mouse: true,

         tags: true,
         border: { type: 'line' },
         style: { focus: { border: { fg: 'magenta' } } }
      });

      this.descriptionBox = blessed.textarea({
         label: 'Description',
         name: 'descriptionBox',

         top: 8,
         left: 'center',

         width: '80%',
         height: 5,

         keys: false,
         mouse: false,

         border: { type: 'line' },

         style: {
            focus: {
               border: { fg: 'magenta' },
            }
         }
      });

      this.tagsBox = blessed.textbox({
         label: 'Tags',
         name: 'tagsBox',

         top: 13,
         left: 'center',

         width: '80%',
         height: 3,

         keys: true,
         mouse: true,

         border: { type: 'line' },
         style: { focus: { border: { fg: 'magenta' } } }
      });

      this.linksBox = blessed.textarea({
         label: 'Links',
         name: 'linksBox',

         top: 16,
         left: 'center',

         width: '80%',
         height: 5,

         keys: true,
         mouse: true,

         border: { type: 'line' },
         style: { focus: { border: { fg: 'magenta' } } },
      });

      this.saveButton = blessed.button({
         name: 'saveButton',
         tags: true,
         content: '{center}save tip{/center}',

         top: 23,
         left: 'center',

         width: '40%',
         height: 3,

         keys: true,
         mouse: true,

         border: { type: 'line' },
         style: { focus: { border: { fg: 'magenta' } } },
      });
      this.buildNewTipBox();
   }//end constructor

   buildNewTipBox = () => {
      this.mainBox.append(this.nameBox);
      this.mainBox.append(this.descriptionBox);
      this.mainBox.append(this.tagsBox);
      this.mainBox.append(this.linksBox);
      this.mainBox.append(this.saveButton);
   }
}

class LogMod {
   constructor() {
      this.delay = 300;
      this.isLogging = false;
      this.keepLogging = true;

      this.mainBox = blessed.log({
         height: '70%',
         width: '59%',

         top: '10%',
         left: '10%',

         keys: true,
         mouse: true,

         tags: true,
         border: {
            type: 'line',
         },

         scrollbar: {
            mouse: true,
            bg: 'magenta'
         },
         style: { focus: { border: { fg: 'green' } } }
      });
   }
}

class InputBox {
   constructor() {
      this.mainBox = blessed.textbox({
         name: 'inputBox',

         mouse: true,
         keys: true,

         top: '80%',
         left: 'center',

         width: '70%',
         height: 4,

         border: {
            type: 'line',
         },
         style: { focus: { border: { fg: 'green' } } },
      });
   }//end constructor
}

class HomeMod {
   constructor() {
      this.mainBox = blessed.log({
         name: 'homeBox',

         height: '70%',
         width: '59%',

         top: '10%',
         left: '10%',

         keys: true,
         mouse: true,

         tags: true,
         border: {
            type: 'line',
         },

         scrollbar: {
            mouse: true,
            bg: 'magenta'
         },
         style: { focus: { border: { fg: 'green' } } }
      });
   }
}

class HelpMod{
   constructor(){
      this.mainBox = blessed.log({
         name: 'helpBox',

         height: '70%',
         width: '59%',

         top: '10%',
         left: '10%',

         keys: true,
         mouse: true,

         tags: true,
         border: {
            type: 'line',
         },

         style: { focus: { border: { fg: 'green' } } }
      });
   }
}

//TODO: add messageBox class

class MessageMod{
   constructor(){
      this.mainBox = blessed.message({
         name: 'messageBox',

         height: '20%',
         width: '30%',

         // top: '10%',
         // left: '10%',

         keys: true,
         mouse: true,

         tags: true,
         border: {
            type: 'line',
         },

         scrollbar: {
            mouse: true,
            bg: 'magenta'
         },
         style: { focus: { border: { fg: 'green' } } }
      });
   }
}

module.exports = {
   MenuMod,
   NewTipMod,
   LogMod,
   InputBox,
   HomeMod,
   MessageMod,
   HelpMod
};
