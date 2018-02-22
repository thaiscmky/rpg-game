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
        var x = $(element).position().left;
        var y = $(element).position().top;
        return [Math.floor(x),Math.floor(y)];
    }
};

var rpgCharBase = function(name, role, health, attack, specialabel){
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
        special: {label: specialabel, value: 0}
    };

};

var characterObjs = {
    archer: new rpgCharBase('Chad', 'archer', 100, 10, 'arrow me a river'),
    assassin: new rpgCharBase('Dick', 'assassin', 60, 25, 'dart barf'),
    mage: new rpgCharBase('Bill', 'mage', 45, 40, 'glitter bomb')
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
        if(player==='user'){
            $(selector).html(clone);
            $(selector).append( '<span>Your HP: <span></span></span>' );
        } else {
            $(selector).html(clone.css({'transform': 'scaleX(-1)'}));
            $(selector).append(  '<span>Enemy HP: <span></span></span>' );
        }
        $(selector +' span span').html(gameProgress[player]['health']);
        image.css({'opacity': '0.5'});
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
            duration: 500,
            progress: function(){
                //TODO: enhanced mechanics
            },
            complete: function() {
                //ends at x 430
                var position = utilities.getPosition('#battle_arena .negative-space .'+gameProgress.user.role);
                $('#battle_arena #user').find('img')[0].src = gameProgress.getCurrentFighters()[1].character;
                $(this).removeAttr('style');
                $(this).remove();
                if(position[0] > 420)
                {
                    var currentPlayers = gameProgress.getCurrentFighters();
                    gameProgress.subtractHealth(currentPlayers[1], currentPlayers[0]);
                }
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
            duration: 1500,
            progress: function(){
                //TODO: enhanced mechanics
            },
            complete: function() {
                //stops at -90
                var position = utilities.getPosition('#battle_arena .negative-space .'+gameProgress.opponent.role);
                $('#battle_arena #opponent').find('img')[0].src = gameProgress.getCurrentFighters()[0].character;
                $(this).removeAttr('style');
                if(position[0] < -88){
                    var currentPlayers = gameProgress.getCurrentFighters();
                    gameProgress.subtractHealth(currentPlayers[0], currentPlayers[1]);
                }
                if(gameProgress.getCurrentFighters()[0].health > 0 &&
                    gameProgress.getCurrentFighters()[1].health > 0)
                    renderUi.opponentWeapon(image);
                else {
                    $('#battle_arena .negative-space').html('');
                   if(gameProgress.getCurrentFighters()[0].health > 0){
                       alert('You lose!');
                   } else {
                       alert('You win!');
                       gameProgress.user.health = defaults[gameProgress.user.role].health;
                       $('#battle_arena #user span span').html(gameProgress.user.health);
                   }
                }
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
    },
    getCurrentFighters: function () {
        return [this.opponent, this.user];
    },
    subtractHealth: function(source, target){
        target.health -= source.attack;
        if(target.role === gameProgress.opponent.role)
            $('#battle_arena #opponent span span').html(target.health);
        if(target.role === gameProgress.user.role)
            $('#battle_arena #user span span').html(target.health);
    }
};

function attack(opponentElement){
    var role = gameProgress.getCurrentFighters()[1]['role'];
    $('#battle_arena #user').find('img')[0].src = assets.characterImage(role, 'active');
    if((weapon = $('#battle_arena .negative-space img.'+role)).length){
        weapon.remove();
    }
    renderUi.characterWeapon(characterObjs[role].weaponui);
}
function jump(userElement){
    //TODO: add jump feature;
}

$(document).ready(function() {
    renderUi.buildPlatform();
    renderUi.buildTabularData('characters', 'info');
    gameProgress.rounds = Object.keys(characterObjs).length;
    renderUi.updateRounds();
    $('#characters .info tr').one('click', function(){
        var selection = this;
        var role = this.className.split(' ')[0];
        if(gameProgress.user){
            gameProgress.opponent = characterObjs[role];
            renderUi.renderSelection('opponent', selection);
            gameProgress.opponent.characterpos = utilities.getPosition('#battle_arena #opponent');
            $('#characters .info tr').unbind('click');
            gameProgress.setFighters();
        } else {
            gameProgress.user = characterObjs[role];
            renderUi.renderSelection('user', selection);
            gameProgress.user.characterpos = utilities.getPosition('#battle_arena #user');
        }
    });

    /*
    TODO: add jump feature
    $('#battle_arena #user').on('click', function(){
        if(gameProgress.user && gameProgress.opponent) jump(this);
    });*/

    $('#battle_arena #opponent').on('click', function(){
        if(gameProgress.user &&
            gameProgress.opponent &&
            gameProgress.opponent.health > 0 &&
            gameProgress.user.health > 0
        )
        {
            if(gameProgress.fighting === false){
                //start animating opponent
                var opponentRole = gameProgress.getCurrentFighters()[0]['role'];
                //renderUi.opponentWeapon($(this).find('img')[0]);
                renderUi.opponentWeapon(characterObjs[opponentRole].weaponui);
                gameProgress.fighting = true;
            }
            attack(this);
        } else {
            if(gameProgress.user.health > 0){
                gameProgress.user.health = defaults[gameProgress.user.role].health;
                $('#battle_arena #user span span').html(gameProgress.user.health);
            } else {
                gameProgress.user.health = 0;
                $('#battle_arena #user span span').html(0);
            }
        }
    });
});