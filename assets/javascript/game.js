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
    }
    //other utilities: load modal
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
        weaponposition: [],
        counter: 0,
        special: {label: specialabel, value: 0}
    };

};

var characterObjs = {
    archer: new rpgCharBase('Chad', 'archer', 100, 10, 'arrow me a river'),
    assassin: new rpgCharBase('Dick', 'assassin', 60, 25, 'dart barf'),
    mage: new rpgCharBase('Bill', 'mage', 45, 40, 'glitter bomb')
};

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
            $(selector).append( '<span>You</span>' );
        } else {
            $(selector).html(clone.css({'transform': 'scaleX(-1)'}));
            $(selector).append(  '<span>Enemy</span>' );
        }
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
        }, 500, function(){
            $('#battle_arena #user').find('img')[0].src = gameProgress.getCurrentFighters()[1].character;
            $(this).removeAttr('style');
            $(this).remove();
        });
    },
    opponentWeapon: function(image){
        $(image).css({'position':'absolute', 'height':'30%', 'right':'0px','transform': 'scaleX(-1)'});
        $(image).addClass(gameProgress.opponent.role + ' weapon');
        $('#battle_arena .negative-space').append(image);
        $(image).animate({
            right: $('#battle_arena .negative-space').width() + 60
        }, 1500, function(){
            $('#battle_arena #opponent').find('img')[0].src = gameProgress.getCurrentFighters()[0].character;
            $(this).removeAttr('style');
            renderUi.opponentWeapon(image);
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
            renderUi.renderSelection('opponent', selection);
            gameProgress.opponent = characterObjs[role];
            $('#characters .info tr').unbind('click');
            gameProgress.setFighters();
        } else {
            renderUi.renderSelection('user', selection);
            gameProgress.user = characterObjs[role];
        }
    });
    /*
    TODO: add jump feature
    $('#battle_arena #user').on('click', function(){
        if(gameProgress.user && gameProgress.opponent) jump(this);
    });*/
    $('#battle_arena #opponent').on('click', function(){
        if(gameProgress.user && gameProgress.opponent){
            if(gameProgress.fighting === false){
                //start animating opponent
                var opponentRole = gameProgress.getCurrentFighters()[0]['role'];
                //renderUi.opponentWeapon($(this).find('img')[0]);
                renderUi.opponentWeapon(characterObjs[opponentRole].weaponui);
                gameProgress.fighting = true;
            }
            attack(this);
        }
    });
});
/*
 

 */