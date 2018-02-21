//build pre-document ready variables here
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

var rpgCharBase = {
    name: '',
    character: '',
    role: '',
    health: '',
    attack: '',
    counter: '',
    special: {label: '', value: 0},
    init: function(name, role, health, attack, special){
        this.name = name;
        this.character = assets.characterImage(role, 'inactive');
        this.role = role;
        this.health = health;
        this.attack = attack;
        this.special['label'] = special;
        return this;
    }
};
var characterObjs = {
    archer: rpgCharBase.init('Chad', 'archer', 100, 10, 'arrow me a river'),
    assassin: rpgCharBase.init('Dick', 'assassin', 60, 25, 'dart barf'),
    mage: rpgCharBase.init('Bill', 'mage', 45, 40, 'glitter bomb')
};

//build document ready functions here
function buildPlatform(){
    var dimensions = utilities.getImageSize(assets.imagepath + 'platform.jpg');
    $('#battle_arena').css({
        'height':dimensions[1] + 'px',
        'width': dimensions[0] + 'px',
    });
}

function buildCharacterFrame() {
    var labels = $('#characters thead');
    var cols = labels.find('th').length;
    //this seems out of place
    var tableHeaders = labels.find('th').map(function(k,v){
        var unsanitized = v.outerText;
        return unsanitized.indexOf(" ") > -1 ? unsanitized.slice(0, unsanitized.indexOf(" ")).toLowerCase() : unsanitized.toLowerCase();
    });
    //$(characterObjs[0]).each(function(k,v){
    $.each(characterObjs, function(role, properties){
        var thisTR = document.createElement('tr');
        $(thisTR).addClass(role);
        $('#characters .info').append(thisTR);
        //var tdCreated = $('#characters .info').append('<tr class="' + role + '"></tr>');
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

    var image = document.createElement('IMG');
    image.src = assets.characterImage('archer','inactive');
    $('.info .archer .character').append(image);

    //
    //console.log(properties);
    //buildcharacters(properties);
}

function buildcharacters(propertyList) {
    //console.log(characters);
    //ui
    //https://api.jquery.com/add/
    //character objects
}

//generate objects from document ready state here

$(document).ready(function() {
    buildPlatform();
    buildCharacterFrame();
});

/*
    More references
 http://api.jquery.com/on/ (also jquery one and jquery off)
 https://stackoverflow.com/questions/4230029/jquery-javascript-collision-detection
 https://css-tricks.com/collision-detection/
 https://jsfiddle.net/ryanoc/TG2M7/

 */