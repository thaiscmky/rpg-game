var assets = {
    imagepath: './assets/images/',
    weaponImage: function(role){
        var imgReturn;
        switch (role){
            case 'archer':
                imgReturn = this.imagepath + 'arrow.png';
                break;
            case 'mage':
                imgReturn = this.imagepath + 'magic.png';
                break;
            case 'assassin':
                imgReturn = this.imagepath + 'dart.png';
                break;
            default:
                '';
        }
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
    return {
        name: name,
        character: assets.characterImage(role, 'inactive'),
        role: role,
        health: health,
        attack: attack,
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
                    image.width = 150;
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
        var selector = '#battle_arena #'+player;
        if(player==='user'){
            $(selector).html(image.clone().addClass(fighter.className));
            $(selector).append( '<span>You</span>' );
        } else {
            $(selector).html(image.clone().addClass(fighter.className).css({'transform': 'scaleX(-1)'}));
            $(selector).append(  '<span>Enemy</span>' );
        }
    }
};

var gameProgress = {
    user: false,
    opponent: false,
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


$(document).ready(function() {
    renderUi.buildPlatform();
    renderUi.buildTabularData('characters', 'info');
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
});
