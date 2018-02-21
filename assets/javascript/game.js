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

//build document ready functions here
function buildPlatform(){
    var dimensions = utilities.getImageSize(assets.imagepath + 'platform.jpg');
    $('#battle_arena').css({
        'height':dimensions[1] + 'px',
        'width': dimensions[0] + 'px',
    });
}

function gameProgress(user, opponent){
    var usercharacter = {role: user};
    var opponentcharacter = {role: opponent};
    return [usercharacter, opponentcharacter];
}

function buildCharacterFrame() {
    var labels = $('#characters thead');
    var tableHeaders = labels.find('th').map(function(k,v){
        var unsanitized = v.outerText;
        return unsanitized.indexOf(" ") > -1 ? unsanitized.slice(0, unsanitized.indexOf(" ")).toLowerCase() : unsanitized.toLowerCase();
    });
    $.each(characterObjs, function(role, properties){
        var thisTR = document.createElement('tr');
        $(thisTR).addClass(role);
        $('#characters .info').append(thisTR);
        $.each(properties, function(property, value){
            var thisTD = document.createElement('td');
            if($.isFunction(value))
                return;
            if($.inArray(property, tableHeaders) === -1)
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
            $(thisTR).append($(thisTD));

        });
    });
}


//generate objects from document ready state here

$(document).ready(function() {
    buildPlatform();
    buildCharacterFrame();
    var pickedCharacter = false;
    $('#characters .info tr').one('click', function(){
        var image = $(this).find('img');
        if(pickedCharacter){
            $('#battle_arena #opponent').html(image.clone().addClass(this.className).css({'transform': 'scaleX(-1)'}));
            $('#battle_arena #opponent').append('<span>Enemy</span>');
            $('#characters .info tr').unbind('click');
        } else {
            pickedCharacter = true;
            $('#battle_arena #user').html(image.clone().addClass(this.className));
            $('#battle_arena #user').append('<span>You</span>');

            /*-moz-transform: scaleX(-1);
            -o-transform: scaleX(-1);
            -webkit-transform: scaleX(-1);
            transform: scaleX(-1);
            filter: FlipH;
            -ms-filter: "FlipH";*/
        }
        image.css({'opacity':'0.5'});
    });
});

/*
    More references
 http://api.jquery.com/on/ (also jquery one and jquery off)
 https://stackoverflow.com/questions/4230029/jquery-javascript-collision-detection
 https://css-tricks.com/collision-detection/
 https://jsfiddle.net/ryanoc/TG2M7/

 */