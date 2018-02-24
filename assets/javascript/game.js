var assets = {
    imagepath: './assets/images/',
    weaponImage: function(role){
        var imgReturn;
        switch (role){
            case 'archer':
                imgReturn = this.imagepath + role + '/' + 'arrow.png';
                break;
            case 'mage':
                imgReturn = this.imagepath + role + '/' + 'magic.png';
                break;
            case 'assassin':
                imgReturn = this.imagepath + role + '/' + 'dart.png';
                break;
            default:
                '';
        }
        return imgReturn;
    },
    characterImage: function(role, state){
        return this.imagepath + role + '/' + role + '_' + state + '.png';
    }
};

var utilities = {
    getImageSize: function(src){
        var thisImg = new Image();
        thisImg.src = src;
        return [thisImg.width, thisImg.height];
    },
    getPosition: function(element) {
        if(typeof  $(element).position() === 'undefined')
            return;
        var x = $(element).position().left;
        var y = $(element).position().top;
        return [Math.floor(x),Math.floor(y)];
    },
    switchClass: function(selector, remove, add){
        $(selector).removeClass(remove);
        if(!$(selector).hasClass(add))
            $(selector).addClass(add);
    }
};

var rpgCharBase = function(name, role, health, attack, specialabel, duration){
    var attackGraphics = function(){
      var img = document.createElement('img');
      img.src = assets.weaponImage(role);
      return img;
    };
    return {
        name: name,
        character: assets.characterImage(role, 'inactive'),
        role: role,
        health: health,
        attack: attack,
        weaponui: attackGraphics(),
        weaponpos: [],
        characterpos: [],
        counter: 0,
        duration: duration,
        special: {label: specialabel, value: 0}
    };

};

var characterObjs = {
    archer: new rpgCharBase('Chad', 'archer', 100, 10, 'arrow me a river', 700),
    assassin: new rpgCharBase('Dick', 'assassin', 50, 25, 'dart barf', 550),
    mage: new rpgCharBase('Bill', 'mage', 45, 40, 'glitter bomb', 1200)
};

var defaults = $.extend(true, {}, characterObjs);

var renderUi = {
    table: '',
    tableBody: '',
    tableLabels: '',
    characters: characterObjs,
    buildPlatform: function(){
        var dimensions = utilities.getImageSize(assets.imagepath + 'platform.jpg');
        $('#battle_arena').css({
            'height':dimensions[1] + 'px',
            'width': dimensions[0] + 'px',
        });
    },
    buildTabularData: function(charTableId,charInfoClass){
        var self = this;
        self.tableId = charTableId;
        self.tableBody = charInfoClass;
        var labels = $('#'+charTableId+' thead');
        self.tableLabels = labels.find('th').map(function(k,v){
            var unsanitized = v.outerText;
            return unsanitized.indexOf(" ") > -1 ? unsanitized.slice(0, unsanitized.indexOf(" ")).toLowerCase() : unsanitized.toLowerCase();
        });
        $('#'+self.tableId+' .'+self.tableBody).append(self.buildCharacterRows());
    },
    buildCharacterRows: function(){
        var self = this;
        var rows = $(Object.keys(self.characters)).map(function(i, role){
            var thisTR = document.createElement('tr');
            $(thisTR).addClass(role);
            $(thisTR).addClass('enemy');
            $(thisTR).append(self.buildPropertyCells(self.characters[role]));
            return thisTR;
        });
        return rows;
    },
    buildPropertyCells: function(row){
        var self = this;
        var tds = [];
        $.each(row, function(property, value){
            var thisTD = document.createElement('td');
            /*if($.isFunction(value))
                return;*/
            if($.inArray(property, self.tableLabels) === -1)
                return;
            switch(property){
                case 'character': //;
                    var image = document.createElement('IMG');
                    image.src = value;
                    image.width = 50;
                    $(thisTD).html(image);
                    break;
                case 'special':
                    $(thisTD).html(value.label);
                    break;
                default:
                    $(thisTD).html(value);
            }
            tds.push($(thisTD));

        });
        return tds;
    },
    renderSelection: function(player, fighter){
        var image = $(fighter).find('img');
        var clone = image.clone().addClass(fighter.className);
        clone.width(image.width() * 3);
        var selector = '#battle_arena #'+player;
        if(player === 'opponent'){
            $(selector).html(clone.css({'transform': 'scaleX(-1)'}));
            $(selector).append(  '<span>Enemy HP: <span></span></span>' );
            image.css({'background-color': '#cea452'});
            renderUi.modal.setAction('selection', 'enable');
        }
        if(player === 'user') {
            $(selector).html(clone);
            $(selector).append( '<span>Your HP: <span></span></span>' );
            image.css({'background-color': '#BDDDF6'});
        }
        $(selector +' span span').html(gameProgress[player]['health']);
        image.css({'opacity': '0.5'});
    },
    modal: {
          gameModal: '#gameModal',
          additionalBtn: { help: '.help' },
          action: '#gameAction',
          setOptions: function(){
              $(this.gameModal).modal({backdrop: 'static', keyboard: false});
          },
          show: function(selectorId){
              //$(this.gameModal + ' .modal-content > div').filter( "#"+selectorId ).show();
              //.show();
              var visible = $(this.gameModal + ' .modal-content > div').filter( ":visible" );
              $.each(visible, function(i, el){
                 if(el.id !== selectorId)
                     $(el).hide();
                 else $(el).show();
              });
          },
          setAction: function(selectorId, btn){
              if(btn === 'disable'){
                  utilities.switchClass(this.action, 'btn-primary', 'btn-light');
                  $(this.action).attr(btn+'d', true);
              } else
              {
                  utilities.switchClass(this.action, 'btn-light', 'btn-primary');
                  if($(this.action).attr('disabled'))
                      $(this.action).attr('disabled', false);
              }
              switch(selectorId){
                  case 'selection':
                      if($(this.action).prop('disabled'))
                          $(this.action).text('No Characters Selected');
                      else
                          $(this.action).text( gameProgress.rounds > 0 ? 'Start Next Round' : 'Game Over. Restart.');
                      break;
              }
          }
    },
    updateWins: function(){
        $('#score_keeping span.win').html(gameProgress.wins);
    },
    updateLosses: function(){
        $('#score_keeping span.loss').html(gameProgress.losses);
    },
    updateRounds: function(){
        $('#score_keeping span.rounds').html(gameProgress.rounds);
    },
    characterWeapon: function(image){
        var clone = $(image).clone(true);
        clone.css({'position':'absolute', 'height':'30%', 'left':'0px'});
        clone.addClass(gameProgress.user.role + ' weapon');
        $('#battle_arena .negative-space').append(clone);
        clone.animate({
            left: $('#battle_arena .negative-space').width() + 30
        }, {
            duration: gameProgress.user.duration,
            progress: function(){
                //TODO: enhanced mechanics
            },
            complete: function() {
                gameProgress.validateAttack(this,'user', image);
            }
        });
    },
    opponentWeapon: function(image){
        $(image).css({'position':'absolute', 'height':'30%', 'right':'0px','transform': 'scaleX(-1)'});
        $(image).addClass(gameProgress.opponent.role + ' weapon');
        $('#battle_arena .negative-space').append(image);
        $(image).animate({
            right: $('#battle_arena .negative-space').width() + 60
        }, {
            duration: gameProgress.opponent.duration,
            progress: function(){
                //TODO: enhanced mechanics
            },
            complete: function() {
                gameProgress.validateAttack(this,'opponent', image);
            }
        });
    }
};

var gameProgress = {
    user: false,
    opponent: false,
    wins: 0,
    losses: 0,
    rounds: 0,
    fighting: false,
    setFighters: function(opponent, user){
        if(typeof opponent === 'undefined')
            opponent = this.opponent;
        if(typeof user === 'undefined')
            user = this.user;
        this.user = user;
        this.opponent = opponent;
        this.opponent.duration = this.opponent.duration * 2.5;
    },
    getCurrentFighters: function () {
        return [this.opponent, this.user];
    },
    subtractHealth: function(source, target){
        target.health -= source.attack;
        if(target.role === gameProgress.opponent.role)
            $('#battle_arena #opponent span span').html(target.health);
        else
            $('#battle_arena #user span span').html(target.health);
    },
    /*resetCurrentPlayer: function() {
        characterObjs[this.user.role] = defaults[this.user.role];
        this.user = characterObjs[this.user.role];
    },*/
    getNextOpponent: function(){
        var self = this;
        this.updateScore();
        this.resetPlayer();
        this.resetOpponent();
        gameProgress.fighting = false;
        this.updateUi();
        $('#characters .info').one('click', '.enemy', function(){
            var selection = this;
            var role = selection.className.split(' ')[0];
            $(selection).removeClass('enemy');
            gameProgress.opponent = $.extend(true, {}, characterObjs[role]);
            renderUi.renderSelection('opponent', selection);
            gameProgress.opponent.characterpos = utilities.getPosition('#battle_arena #opponent');
            $('#characters .info tr').off('click');
            gameProgress.setFighters();
        });
    },
    setFinalStats: function () {
        this.updateScore();
        gameProgress.fighting = false;
        this.updateUi();
    },
    updateScore: function(){
        if(this.rounds > 0) this.rounds -= 1;
        if(this.opponent > 0)
            this.losses += 1;
        else
            this.wins += 1;
    },
    resetPlayer: function(){
        this.user = $.extend(true, {}, characterObjs[this.user.role]);
        $('#battle_arena #user span span').html(this.user['health']);
        if(this.rounds <= 0){
            $('#battle_arena #user').html('');
            this.user = false;
        }
    },
    resetOpponent: function(){
      $('#battle_arena #opponent').html('');
      if(this.rounds <= 0){
          this.opponent = false;
      }
    },
    updateUi: function () {
        renderUi.updateRounds();
        renderUi.updateLosses();
        renderUi.updateWins();
    },
    resetScores: function () {
        this.wins = 0;
        this.losses = 0;
        this.rounds = 0;
    },
    resetGame: function () {
        
    },
    initGame: function () {
        gameProgress.rounds = Object.keys(characterObjs).length - 1;
        renderUi.updateRounds();
        this.initSelections();
        renderUi.modal.setAction('selection', 'disable');

        /*
        TODO: add jump feature
        $('#battle_arena #user').on('click', function(){
            if(gameProgress.user && gameProgress.opponent) gameMechanics.jump(this);
        });*/

    },
    initSelections: function () {
        $('#characters .info tr').one('click', function(){
            var selection = this;
            var role = this.className.split(' ')[0];
            $(selection).removeClass('enemy');
            if(gameProgress.user){
                gameProgress.initOpponentSelection(role,selection);
            } else {
                gameProgress.initUserSelection(role,selection);
            }
        });
    },
    initOpponentSelection: function (role, selection) {
        this.opponent = $.extend(true, {}, characterObjs[role]);
        renderUi.renderSelection('opponent', selection);
        this.opponent.characterpos = utilities.getPosition('#battle_arena #opponent');
        $('#characters .info tr').off('click');
        this.setFighters();
        this.setOpponentListener();
    },
    setOpponentListener: function(){
        $('#battle_arena #opponent').on('click', function(){
            if(gameProgress.user &&
                gameProgress.opponent &&
                gameProgress.opponent.health > 0 &&
                gameProgress.user.health > 0
            )
            {
                if(gameProgress.fighting === false || gameProgress.opponent === null){
                    //start animating opponent
                    var opponentRole = gameProgress.opponent.role;
                    renderUi.opponentWeapon(characterObjs[opponentRole].weaponui);
                    gameProgress.fighting = true;
                }
                gameActions.attack(this);
            } else {
                if(gameProgress.user.health > 0){
                    //gameProgress.user.health = defaults[gameProgress.user.role].health;
                    gameProgress.user.health = characterObjs[gameProgress.user.role].health;
                    $('#battle_arena #user span span').html(gameProgress.user.health);
                } else {
                    gameProgress.user.health = 0;
                    $('#battle_arena #user span span').html(0);
                }
            }
        });
    },
    initUserSelection: function (role, selection) {
        this.user = $.extend(true, {}, characterObjs[role]);
        renderUi.renderSelection('user', selection);
        this.user.characterpos = utilities.getPosition('#battle_arena #user');
    },
    validateAttack: function(el, fighterId, weaponUi){
        var position = utilities.getPosition('#battle_arena .negative-space .'+gameProgress[fighterId]['role']);
        $('#battle_arena #'+fighterId).find('img')[0].src = gameProgress[fighterId]['character'];
        $(el).removeAttr('style');
        switch(fighterId){
            case 'opponent':
                this.validateOpponentAttack(el, fighterId, weaponUi, position);
                break;
            case 'user':
                this.validateUserAttack(el, fighterId, weaponUi, position);
                break;
        }
        this.validateFight();
    },
    validateOpponentAttack: function(el, fighterId, weaponUi, position) {
        if(typeof position === 'undefined' || position[0] < -88){
            gameProgress.subtractHealth(this.opponent, this.user);
        }
        if(gameProgress.user.health <= 0 || gameProgress.opponent.health <= 0){
            $('#battle_arena .negative-space').html('');
            $('#characters .info .' + gameProgress[fighterId]['role'] + ' img').css({
                'background-color':'#4A4545'
            });
        }
    },
    validateUserAttack: function(el, fighterId, weaponUi, position) {
        $(el).remove();
        if(typeof position === 'undefined' || position[0] > 420)
        {
            gameProgress.subtractHealth(this.user, this.opponent);
        }
    },
    validateFight: function () {
        if(gameProgress.opponent.health <= 0 || gameProgress.user.health <= 0) {
            $(this).delay(500).queue(function() {
                if(gameProgress.user.health <= 0)
                    alert('You lose!');
                else
                    alert('You win!');
                if(gameProgress.rounds > 0){
                    gameProgress.getNextOpponent();
                    alert('Starting the next round');
                } else {
                    alert( gameProgress.wins > gameProgress.losses ? 'You won the game!' : 'You lost the game. Refresh the page and try again.');
                    gameProgress.setFinalStats();
                }
                $(this).dequeue();
            });
        } else {
            renderUi.opponentWeapon(renderUi.opponentWeapon(characterObjs[gameProgress.opponent.role].weaponui));
        }
    }
};

var gameActions = {
    attack: function(opponent){
        var role = gameProgress.getCurrentFighters()[1]['role'];
        $('#battle_arena #user').find('img')[0].src = assets.characterImage(role, 'active');
        if((weapon = $('#battle_arena .negative-space img.'+role)).length){
            weapon.remove();
        }
        renderUi.characterWeapon(characterObjs[role].weaponui);
    },
    jump: function (user) {
        //TODO: add jump feature;
    }
};

$(document).ready(function() {
    renderUi.modal.setOptions({backdrop: 'static', keyboard: false});
    renderUi.modal.show('selection');
    renderUi.buildTabularData('characters', 'info');
    gameProgress.initGame();
});

$(window).on('load', function(){
    renderUi.buildPlatform();
});