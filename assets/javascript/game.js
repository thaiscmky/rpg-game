//build pre-document ready variables here
var characters = ['archer', 'assassin', 'mage'];
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
        return this.imagepath + role + '_' + state + '.png';
    }
};

var utilities = {
    getImageSize: function(src){
        var thisImg = new Image();
        thisImg.src = src;
        return [thisImg.width, thisImg.height];
    }
}

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
    var properties = labels.find('th').map(function(k,v){
        var unsanitized = v.outerText;
        return unsanitized.indexOf(" ") > -1 ? unsanitized.slice(0, unsanitized.indexOf(" ")).toLowerCase() : unsanitized.toLowerCase();
    });
    $(characters).each(function(i,v){
        $('#characters .info').append('<tr class="' + v + '"></tr>');
    });
    $('#characters .info tr').each(function(){
        var self = this;
        $(properties).each(function(i,v){
            $(self).append('<td/>');
            console.log(v); //character class health attack special
        });
    });


    //
    //console.log(properties);
    buildcharacters(properties);
}

function buildcharacters(propertyList) {
    console.log(characters);
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