


function setTag() {
    var hash = location.hash;

    var selectedTag = hash.substring(1);
    if(selectedTag.indexOf('#') > -1) {
        selectedTag = selectedTag.replace(/#/gi, 'sharp');
        selectedTag = selectedTag.replace(/.net/gi, 'dotnet');
    }
    
    if(selectedTag === "") {
        $('div#tags > section').show();
    }
    else {
        $('div#tags > section').hide();
        $('div#tags > section#tag-' + selectedTag).show();
    }
    
    window.scrollTo(0, 0);
}


$(function(){
    window.onhashchange = function() {
        setTag();
    };
    
    setTag();
});

